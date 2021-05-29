---
title: 一日おきのデータの集計処理をcloud functionで自動化してみた
date: "2020-11-24"
template: "post"
draft: false
slug: "cloudfunction-everyday"
category: "Engineer"
tags:
    - "infra"
    - "firebase"
description: "firestoreのデータの集計をcloud functionの練習も兼ねて自動化してみました。"
---

## 概要

firestoreで運営しているアプリケーションがあり、データの統計処理を行ってクエリの数を減らしたかったのでcloud functionを使用して自動化させました。

## 要約

これで毎日動作させる関数の出来上がり
```js
functions.pubsub.schedule('every day 00:00').onRun((context) => {
    \\ 内容
})
```

## 内容

個人開発している[アプリケーション](https://student-salary.com/)のデータの処理をcloud functionを使用して定期的に実行できるようにしてみました。

まずはfirebase-toolsをインストール
```zsh
npm install -g firebase-tools
```

サイトからツールにログインをして、functionsの初期化を行います。
自分はすでに使用している本番用のAppを指定して、言語はJavascriptにしました。(Typescriptは学習中)

```zsh
# プロジェクトディレクトリ内
firebase login
firebase init functions
```

functionsの中にindex.jsが作成されていると思うのでここに目的の処理を記述していきます。

```js
// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// データベースの参照を作成
const db = admin.firestore()

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
});

```

これで、リクエストが飛んできたらHello logs!と出力するエンドポイントが作成できます。
すごく簡単、デプロイもコマンド一発です。

```zsh
# cloud functionのみデプロイ
firebase deploy --only functions
```

ちなみになのですがonRequestはローカル上でfirebase emulatorを使用してテストすることができます。

そんなこんなでcloud functionの概要を把握したので目的の処理であるデータ集計を作成していきます。functionsのpubsubを使用して定期実行されるようにします。pub/subはemulatorにはないので自分は本番で害のないコードを動かしてみてテストしました。

schedule内の期間指定ですがUnix の Crontab と AppEngine の両方の構文をサポートしているようです。今回はAppEngineの記法で指定しました。every 5 minutesに指定すれば5分ごとなど詳しく設定することができます。

関数の内容ですが、firestoreからデータを取得して取得したデータを処理した結果を保存しおくようにしました。具体的には全てのデータの時給情報を区間ごとに何件あるのかを調査して登録しておくことにより、グラフを表示する際にその結果だけ取得するだけで大丈夫なようにしました。


```js
exports.createSalaryMap  = functions.pubsub.schedule('every day 00:00').onRun((context) => {
    functions.logger.info("Hello logs!", {structuredData: true});
    db.collection('datas').get().then((querySnapshot) => {
    // datasの統計処理を記述

    db.collection("result").add({
      create_date: createDate,
      data: result
    }).then((res) => {
      return functions.logger.info("success");
    }).catch(err => {
      return functions.logger.info(err.message);
    })
    return functions.logger.info("function end");
  }).catch( (err) => {
    return functions.logger.info(err.message);
  })
```
(awaitで書き直す予定)

ここまででできたらデプロイしてコンソールのcloud functionを確認してみます。

![](/media/cloudfunction.png)

無事設定できていました。今回は１日おきにという目的が達成できたので問題なかったのですが日本時間の0時に動作させたいなどという場合はTimezoneを指定してあげる必要もあります。


# まとめ

firestoreを使用するなら避けては通れないcloud function。意外と簡単にデプロイまでできたのでこれからどんどん処理を自動化させてより、みやすいグラフやデータを表示できるようにしていきたいなと思います。

サーバーレス楽しい。


## 参考文献

- [cloud firestoreのチュートリアルリンク](https://firebase.google.com/docs/functions/get-started?hl=jad)

- [クイックスタート: クライアント ライブラリの使用(Pub/Subの概要)](https://cloud.google.com/pubsub/docs/quickstart-client-libraries?hl=ja)

- [関数のスケジュール設定](https://firebase.google.com/docs/functions/schedule-functions?hl=ja)