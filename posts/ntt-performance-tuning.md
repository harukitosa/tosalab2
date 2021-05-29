---
title: "NTT Performance Tuning Challenge参加してきてサーバーがI'll (not) be backと行ったきり戻ってこなかった話"
date: "2021-2-7"
template: "post"
draft: false
slug: "ntt-performance-tuning"
category: "Engineer"
tags:
    - "golang"
    - "isucon"
description: "NTT主催のパフォーマンスチューニングコンテストに出場してきました。"
---

おはようございます、とさです。
NTT 主催のパフォーマンスチューニングコンテストに出場してきました。
beer とおつまみがいっぱい送られてきたので昨日の夜はめちゃくちゃ楽しかったです。

今回もチーム雑用係[さんぽしくん](https://twitter.com/sanpo_shiho)と[ましくん](https://twitter.com/masibw)と参加して来ました！

ISUCON と同様に以下の役割分担で頑張りました
<br><br>
さんぽし : インフラ周り、デプロイ&ベンチ&各メトリクス取り係 <br>
まし : DB 周り →app<br>
とさ : app

自分は go で書かれたコードを適当に読んで適当に改善していました。
このブログでも主に app 周りの改善について記述していきます。

さんぽしさんのブログからの引用になりますが計測の部分は以下のようになっています。
Makefile で環境構築を、pprof で吐き出される画像は slack cat で slack に送信などは最強人間 CD のさんぽしくんがやってくださいました。

> メトリクスまわりは具体的には
> alp(アクセスログ解析してくれる君)
> pt-query-digest(スロークエリ解析してくれる君)
> pprof(Go のどの関数で時間がかかってるか調べてくれる君)
> あたりを使用しました。定番ですね

# やったこと時系列

## apache→nginx

apache で運用されていましたが気がついたら nginx になってました。
<br>さんぽしくんありがとう。

## index をはる

SQL もだいぶ遅かったと思うのですが気がついたら高速になっていました。
<br>ましくんありがとう。

## jwt 周りでなんか遅かったのをなんか直してくれた

初回の pprof が以下のような形でした。
<img src="/media/ntt-pprof1.png" alt="pprof1" title="サンプル">

あれ、handler が表示されてないな何かミスったかなと思っていたらましくんが authenticationJwt 遅くね？
なんかめっちゃ重いファイルあるよ？と問題点を見つけてくれたので。原因の究明と解決を行いました。

今回の原因としては失効済み JwtToken を外部ファイルに書き出して、middleware で認証する際に逐一そのファイルを読み込んで失効済みかどうかを確認していたところがボトルネックになっていることを発見しました。
ファイルを開いてみると非常に重かったので、失効済みの情報をインメモリに持つ方針を取りました。

またこの時点でインフラ担当のさんぽしくんは複数台構成にすることを指針にあげていたので、話し合って app 一台でとりあえずは進めてみるという方針にしてもらいました。

キャッシュの実装は以下のようなコードを準備していましたので、それを導入。

```go
// CacheJwt UserJwt created by tosa
type CacheJwt struct {
	sync.Mutex
	jwtsCache map[string]bool
}

// NewCacheJwt 新しいキャッシュ
func NewCacheJwt() *CacheJwt {
	m := make(map[string]bool)
	c := &CacheJwt{
		jwtsCache: m,
	}
	return c
}

// Append キャッシュに追加
func (c *CacheJwt) Append(value string) {
	c.Lock()
	c.jwtsCache[value] = true
	c.Unlock()
}

var mcJwt = NewCacheJwt()

/// ここまで
```

以下がファイルを読み込んでいた箇所です。キャッシュを導入することでだいぶ見通しの良いコードになりました。

```go
    // if already logged out
    // ここが怪しい
    // f, err := os.OpenFile(jwtRevocationListFilePath, os.O_RDONLY|os.O_CREATE, 0644)
    // if err != nil {
    // 	return nil, err
    // }
    // defer f.Close()
    if exist := func() bool {
        // muForFile.Lock()
        // defer muForFile.Unlock()

        // scanner := bufio.NewScanner(f)
        // // ファイルの中にjwtが存在しているのならば
        // for scanner.Scan() {
        // 	if reqJwt == scanner.Text() {
        // 		return true
        // 	}
        // }
        return mcJwt.jwtsCache[reqJwt]
    }(); exist {
        return nil, errUnauthorized{}
    }
```

ログアウトする際にこのキャッシュに jwt を保存しておけば実装完了です。
得点が 1000 点超えくらいになり、メモリにだいぶ余裕ができました。

以下が実装後の pprof です。各 handler が見えてきましたね。
バランスが取れていてとても美しい pprof だと思います。
<img src="/media/ntt2-pprof.png" alt="pprof1" title="サンプル">

## 複数台構成(app1, DB1)

さんぽしくんが複数台構成へのインフラ整備を行ってくれていました。
ISUCON10 での反省が生かされてすぐに実行できるところがすごいところですね。

> この時点で DB が CPU を食っていたのでキャッシュや index は他のメンバーに任せるとして DB を別のサーバーに移す作業に取り掛かりました。
> そして謎に詰まったので後回しにしました。(後に init.sh だけ書き換えただけではサーバー内の DB の向きが切り替わらないのか！という初歩的なミスに気がつきます)

## DB から base64 の画像を引っこ抜いて nginx から配信

次にどうやら Events のテーブルに base64 形式で画像が保存されている部分を発見しました。これは後々ボトルネックになると踏んだのでファイルを書き出して nginx に乗せようと方針が決まりました。

```go
type Event struct {
	Id           int64          `db:"id"`
	ArtistId     int64          `db:"user_id"`
	VenueId      int64          `db:"venue_id"`
	GenreId      int64          `db:"eventgenre_id"`
	Name         string         `db:"name"`
	StartAt      time.Time      `db:"start_at"`
	EndAt        time.Time      `db:"end_at"`
	Price        int64          `db:"price"`
	EncodedImage sql.NullString `db:"image"`
	CreatedAt    time.Time      `db:"created_at"`
	UpdatedAt    time.Time      `db:"updated_at"`
}
```

DB に base64 形式で画像が保存されているのは過去問題(ISUCON7 参照)にもあった処理だったのでこちらも golang のスクリプトをあらかじめ用意しておきました。

と思ったのですが、用意したスクリプトがそのままファイルに base64 形式で吐き出していたようで、チームメイトが画像が表示されないことに四苦八苦していてとても申し訳ない気持ちになりました。

こちらも、きちんと画像を吐き出すように設定。また、putEventImage 関数で画像を更新していたのでこちらもファイルとして吐き出すように修正しました。

ここで今回の敗因になる部分なのですが、ファイルを書き出したあと、初期化する時に新たに保存されたファイルを削除することを忘れてしまっていました。

初期化処理時間は最大 20 秒だったので、30 秒以上するこの書き出し処理を導入することはできなそうだったので、どうすれば綺麗にできたのか考察中です。

## /login だけ別サーバーへプロキシ(→ app2, DB1)

ましくんが/login の暗号化処理が重いことを発見して、さんぽしくんがそのエンドポイントのみを別のサーバーに移してくれました。

## いろんなところでキャッシュを取りまくる

Get リクエストしか飛んでいない場所を中心的にキャッシュを取りました。
やり方は jwt の時と同様に golang の map に保存しました。

## イベントの画像の更新系が不安定に

default.png が返されるところに別の画像ファイルが返っているというエラーが表示されるようになりました。
こちらは、さきほど自分が実装したスクリプトのミスで、初期化時に前回のベンチで保存された画像も保持していたことが原因でした。

## Offset の高速化

ましくんが各 offset で取得しているデータをシーク法とよばれる方法を利用して高速化してくれました！感謝！！

## N+1

ここまできて、ようやく N+1 がネックになっているような箇所を複数見つけることができました、が SQL 力技力が足りずに解決できませんでした。join 句などがスラスラ描けるように練習していたのにいざ本番となるとなかなか難しいものですね。

## 再起動試験対策

今回はサーバー三台で DB が別の構成だったので、再起動試験にて各サーバーが立ち上がる順番が不明でしたので。
再起動試験対策のスクリプトを最後 15 分で仕込みました。

```go
for {
    dbx, err = sqlx.Open("mysql", fmt.Sprintf(
        "%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=true&loc=Local",
        user,
        password,
        host,
        port,
        dbname,
    ))
    if err == nil {
        break
    }
    time.Sleep(1 * time.Second)
}
```

こちらの sqlx.Open はコネクションプールを初期化するだけで DB に接続していないようなので、うまく動作しません。
正しくは以下のような形でした。

```go
    dbx, err = sqlx.Open("mysql", fmt.Sprintf(
        "%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=true&loc=Local",
        user,
        password,
        host,
        port,
        dbname,
    ))

    for {
        // ここで接続を確かめることができる。
        err := dbx.Ping()
        if err == nil {
            break
        }
        log.Print(err)
        time.Sleep(time.Second * 1)
    }
```

常日頃から自分が記述するコードの動作内容をしっかり理解すべきだということを再認識させられました。

# 結果

自分たちは team I でした！
再起動試験で失敗して 0 点 finish です。
優勝争いができていたので、残念。
悔しいですが、Try and Error and Error and Error です。

<img src="/media/ntt-score.png" alt="pprof1" title="サンプル">
<img src="/media/ntt-bestscore.png" alt="pprof1" title="サンプル">

負荷のレベルが 3 段階あって、最終段階で 27000 超えのスコアを記録できたのが非常にうれしかったです！<br>
点数が上がるたびに興奮して奇声をあげてダンスを踊っていました。

# 原因

最後の DB 接続の部分だそうです。

# 感想・考察

NTT さんが用意してくださった問題は非常に良問でかなり学びが多かったです。
また、社員さんの雰囲気がとてもよく楽しそうな雰囲気が伝わってきたもで緊張せずに１日を集中して過ごすことができました！

結果を考察して次回への改善点を見つけることは大切なことなので協議についていいところ悪いところをあげるとすると。

## よかったところ

-   開始 1 時間の流れが非常に連携が取れてスムーズ
-   各担当がそれぞれゆるく連携しながら app,db, infra の各問題に集中して対応できている。
-   典型的なボトルネックの発見と対処法がすぐに思い浮かぶ
-   計測改善のサイクルを綺麗に回すことができた。

## 改善できる箇所

-   終了間近が余裕がなかったので、1 時間前には新規実装を止めて再起動試験に備えられるのが理想。(が、今回は画像配信エラーでつまっていたので...)
    順位にもよる。

-   再起動試験の際の db 接続のスクリプトを用意しておく

今回は結果は出ませんでしたが、かなり戦えるチームになってきたと思います。チームメイトに感謝です！！
<br>
<br>
<br>
<br>
次回作「ISUCON11」をお待ちください！
<br>
<br>
<br>
<br>

## 関連リンク

引用元
<br>
[NTT Performance Tuning Challenge に参加したこの日、人類は思い出した。再起動試験の存在を。奴らに最終スコアが支配されている恐怖を。](https://sanposhiho.com/posts/n-ptc2021/)

インフラ担当のさんぽしくんのブログです！<br>非常に芸術点の高いタイトルとなっています。infra 目線の流れを知りたい方はめちゃくちゃ参考になると思います。

<br>

[NTT Perfomance Tuning Challenge に参加した](https://mesimasi.com/ntt-perfomance-tuning-challenge/)

DB と App 担当のましくんのブログです！<br>シーク法、今回初めて知りました（おい）。かなり難しい実装だと思うのですがさすがです。<br>index をはる技術は最強です。

## 補足

### ISUCON 名言

「推測するな、計測せよ」

### 謎のリズム組織

「ねえ、キャンペーンまでしたのにサーバー落ちているんだけどどういうこと？」
