---
title: ISUCON10予選に初出場して来た記録
date: "2020-09-13"
template: "post"
draft: false
slug: "isucon10"
category: "Engineer"
tags:
    - "golang"
    - "isucon"
description: "9/12 開催された ISUCON10 にさんぽしくんとましくんと一緒にチーム雑用係として参加して来ました！"
socialImage: "/media/isucon10-ogp.jpeg"
---

9/12 開催された ISUCON10 に[さんぽしくん](https://twitter.com/sanpo_shiho)と[ましくん](https://twitter.com/masibw)と一緒にチーム雑用係として参加して来ました！

※ISUCON とは IIkanzini Speed Up Contest の略

チームを組んだ経緯と雑用係の名前の由来。
<img src="/media/isucon10-1.png">

# 開催前

チームメイトと時間をきめて三回練習をしました！

初めの一回は Makefile と最初の一時間の環境構築の練習。他の二回はある程度の時間をかけて本番と同じような形で訓練しました。

練習では isucon7, isucon8 を主に使用しました、この二つは conoha にイメージがあるのでボタンをおすだけで簡単に環境構築することができておすすめです！

あとは役割分担を決めていてさんぽしさんがインフラ、ましさんが DB と App、自分が App を担当することになりました。
前半 1 時間の流れは詳細につめていて一人ひとりのやることが明確になるようにしていました。(make やるかかり、git 管理係、...)

# 当日

環境構築の関係で競技は 12:20 開始、21:00 に終了。
最初の 1 時間はベンチが落ちるなどアクシデントがありましたが、そのほかはいつも通り準備をすすめる。(運営さんめちゃくちゃ大変だろうなと思いつつ、、お疲れ様です 🙇‍♂️)

データベースのテーブルが二つだけだったり、マシンリソースがあまりないことを確認しつつ。

pprof 導入して json が遅いな〜とか思って golang の encoding は遅いってどっかで聞いたことがあったので高速化方法を探し実装してみることに。時間がかかりそうかつ、ひとつ変更してもあんまりスコアが変化しなかったのでとりやめに
（後半でましくんがばしっとここらへんやってくれました）

決定打となりそうなボトルネックがすくない感じでしたが、ベンチをみるかんじ nazoote でタイムアウトしているとの文言があったので自分がそこを改善することに。

コードを見てみると

```sql
query := fmt.Sprintf('SELECT * FROM estate WHERE id = ? AND ST_Contains(ST_PolygonFromText(%s), ST_GeomFromText(%s))', coordinates.coordinatesToText(), point)
```

なんじゃこのクエリ〜〜〜
ST_PolygonFromText??? ST_GeomFromText???なにこれみたことないってなったのでとりあえずコード読みつつこれを調査。

※めちゃくちゃ参考にした記事>>>>[MySQL で GIS データを扱う](https://qiita.com/onunu/items/59ef2c050b35773ced0d)

コードをよんでるとどうやら POST された座標データからまずは最大と最小の緯度経度をわりだして四角い範囲にある物件を取得してからひとつひとつ円の中に入っているかどうかを調査していたので N+1 案件だということがわかった。
ローカル上で上の記事を参考に実験して estate コラムに

```sql
latlon POINT
```

を追加して initalize で値をセットして(sql 初心者すぎてめちゃくちゃ重たい処理をかいて制限時間を超えてしまい sql の書き方チームメイトに泣きながら教えてもらいました)

```sql
"UPDATE estate SET latlon = POINT(latitude,longitude);"
```

一発ですべてのデータを取得できるように

```go
query := fmt.Sprintf(`SELECT * FROM estate WHERE latitude <= ? AND latitude >= ? AND longitude <= ? AND longitude >= ? AND ST_Contains(ST_PolygonFromText(%s), latlon) ORDER BY popularity DESC, id ASC`, coordinates.coordinatesToText())
```

点数変わらなかったけどエラーは消えたのでよしって感じでしたが、2 時間位これに費やしてしまいました。

なかなか点数があがらないなか、チームメイトが CPU の使用率のほとんどが DB に張り付いていることを発見。
ましくんが DB の方を一通り終わらせてくれて App の実装に参戦 、さんぽしくんが複数台構成、キャッシュをすすめてくれました。

自分も app の改善を進めていましたが有効打にならず+ベンチが通らず。

結果としては本戦出場ラインにとどかず終了となってしまいました。

# 振り返り

## 反省点

1. DB が張り付いているあたりからインメモリキャッシュ戦略をとればよかったものの自分の初動が遅れてしまい実装できず...
2. pprof で異常がないあたりから別の原因を探るべきだった。
3. 計測が大切だとわかっていたが計測内容が網羅しきれていなかったこと

## 良かった点

1. 練習した初動はとてもスムーズにおこなえた！
2. ローカルに環境構築することができた！
3. 楽しかった！

反省点はいろいろあり悔しい結果でしたが、初出場にしては善戦だったと思います。
まだまだまだまだ高速化できる観点があってやはり ISUCON はおもしろいかつ勉強になるなと実感しました。

またチームメイトの向上心と技術力をめちゃくちゃ尊敬しているので負けないようにこれからも学習していかなきゃなといい刺激でした。

**来年はもちろん本戦に出場するので一年間楽しみにしていたいとおもいます！**

<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">サーバーをぶっ飛ばす！！！！<br> <a href="https://twitter.com/hashtag/isucon?src=hash&amp;ref_src=twsrc%5Etfw">#isucon</a></p>&mdash; とさ (@tosa_now) <a href="https://twitter.com/tosa_now/status/1304620400890884096?ref_src=twsrc%5Etfw">September 12, 2020</a></blockquote>

## チームメイトの ISUCON 参加ブログ

[ましさん](https://mesimasi.com/isucon10_q_go/)

[さんぽしさん](https://sanposhiho.hatenablog.com/entry/2020/09/13/132433)
