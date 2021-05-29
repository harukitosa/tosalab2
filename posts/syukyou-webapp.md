---
title: 怠惰な学生エンジニアはWebアプリを作る夢を見る
date: "2020-09-30"
template: "post"
draft: false
slug: "syukyou-webapp"
category: "Engineer"
tags:
    - "webapp"
    - "個人制作"
description: "あなただけの宗教を作ることができる宗教.comというWebアプリケーションを開発しました"
socialImage: "/media/syukyou.001.jpeg"
---

お疲れ様です。

今日のブログは[きみの宗教.com](https://syukyou.vercel.app/) を作成した経緯とどのように作成して行ったのか記録しておきたいと思います。
また、楽に開発するために使用したツールなどもいくつか紹介していきたいと思います。

## 怠惰に開発するようになった経緯

このきみの宗教.com の web アプリの構想は夏休みが始まる前くらいに思いつきました。そこから、どうやって作っていこうかな〜と何度か軽くコードを書いて試行錯誤していました。

### サーバーサイドを go で書いて、フロントで react か vue を使用する構成

よっしゃ作ったるぞーと一番初めに思いついた構成。go 好きだし、本で読んだアーキテクチャで作れば勉強にもなるし一石二鳥やん！って意気込んでいました。
が、なんとなくどう書けばいいかわかってるのが原因なのか、それを作る過程がある程度想像できてしまったが最後、ほとんど作成してもいないのにとてつもなく面倒くさく感じてしまいました。また、go で json を返すサーバーを立てて vue などでフロントを描くとなると、フロントは静的ホスティングサイト、サーバーはまた別でデプロイみたいな構成になるのですが、それも疲れそうだなぁと。またログイン機能も実装しなくてはならないので、それもまたまためんどくさそう...

コードを書くこと自体は最高に楽しいのですが、個人開発なので時間を取られすぎるのは避けたいところでしたし、わざわざめんどくさいことをやるやる気も出なかったので(おそらくこの頃インターンの業務だけで疲れていたのも起因している)
そんなこんなでこの構成での開発はボツになりました。

※go はめちゃくちゃ書きたいです！

### yeah!! your on rails 構成

次に考えたのはみんなお馴染み rails 構成です。ログイン機能も device を使用すれば一瞬で完成しますし、何より heroku との相性が最高なのでデプロイも瞬殺です。画像生成のコードも簡単に書けるので ogp 生成も楽にできるだろうと思いこれで作ってみようと決断。

しかしながら、rails はその名の通り rail への乗り方を知っている人間であれば爆速で開発できるのですが、いかんせん自分の rails に対する知識はほぼ初心者に近く、また Ruby も見様見真似でしか書けないので、勉強するコストが高くなってきて開発体験があまり良くなくなってきてしまいました。(もちろん自分の無勉強が悪いだけであり Rails は何一つとして悪くない)

結局、ログイン機能をコマンド一発で生成しだだけのコードは github のリポジトリの奥深くへと消えていきました。

悲しいことにどちらの構成でも作り切ることができなかった、、、やはり俺には個人開発なんて無理なんやなどと自暴自棄になり、家を飛び出しコンビニエンスストアでハーゲンダッツを買いに行きました。(ちなみに抹茶が好きです)

その数日後、犬の散歩をしている途中にまた別の構成が浮かびました。

### Nuxt + firestore 構成

~~お前、この前の面接でサーバーサイドエンジニア志望ですとか言ってたよな？？go で API サーバー書くのが楽しいとどうとかって言ってたよな？？あの頃のお前はどうした！！~~

こうして何もやりたくない怠惰な開発の軸が決まりました！

ogp 生成は cloudnary を使用することにより簡単に生成。

Twitter login はもちろん firebase が用意してくれています。

firebase 万歳！！Google 万歳！！

また、CSS を自分の力のみで書くのはとてつもなく難しい作業なので最近流行りの tailwind css を使用して作成していきました。他のフレームワークみたいにコンポーネントが用意されているわけではありませんでしたが、簡単に綺麗な UI を自分の思う通りに書けたので大満足。次回からも個人開発ではこれを使用して作っていきたいですね。

フロントエンドは Vue とか React は一通り触ったことがありますが、そこまで詳しいと言うわけではないのであとはコピペ+ガシガシ力技で実装で完成まで持っていきました。

ちょうど一週間で完成させることができました。めんどくさがりな自分でもこのくらい短期間であれば集中力が持つようで良かったです！

キャッシュなどをあまりやらなかったせいで、(store すら書いてない...)
firestore の無料枠をちょっと超えてしまいましたが、金の力で解決 💪(10 円くらい)

こうして無事に怠惰な自分でも個人開発で Web アプリを作ることができました！

### 最終的な技術選定

Nuxt(Vue) フロントエンド

firestore/auth データベース、認証

vercel デプロイ先

Cloudinary ogp 生成

## 結論

完成しないより完成した方がいい
アイデアを考えるのは楽しいが、実現させるのは大変
(当たり前の結論に着地)

用は完成させるにはの部分で色々なサービスに頼るなど出来るだけ楽をすることを考えるようにすると幸せになれるってことです。

もちろんこれはアプリを作る目的によっても上のやり方がいいかどうか変わります。

インターンやアルバイトなどで実装経験として提出したいのであれば、きちんと go なり ruby なりで実装してアプリを作成すべきでしょう。

今回の自分の目的としてはきみの宗教.com のアイデアを実現させる部分にあったので、上のような形を取りました。

ただ、この構成の楽さを覚えてしまったので次回以降も個人開発ではこんな感じでいきたいと思っています。

最後になりましたが、今回作成した宗教.com のサイトは[こちら](https://syukyou.vercel.app/)です。ご機会があれば立ち寄ってみてください！

ではまた。