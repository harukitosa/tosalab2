---
title: Firestore の複合クエリってなんだ
date: "2020-11-15"
template: "post"
draft: false
slug: "firestore-query-index"
category: "Engineer"
tags:
    - "firestore"
    - "frontend"
description: "複合クエリをリクエストする際にエラーが出たのでそれの解消方法を軽く載せて置きつつ、そのあたりを調査。"
---

## 要約

-   複合クエリをリクエストする際には複合インデックスの作成が必要
-   コンソールのエラーから作成ページへのリンクがでているのでそれに剃って作成。

## 内容

清々しい日曜日に趣味で開発している Web アプリを弄っていたところ以下のようなクエリを firestore に飛ばしたらエラーが表示されました。

```js
return await db
    .collection("jobs")
    .orderBy("create_date", "desc")
    .where("work_type", "==", "インターン")
    .startAfter(num)
    .limit(20)
    .get()
    .then(function (querySnapshot) {
        hogehgoe;
    });
```

よくよく調べてみるとこれは firestore の複合クエリに当たるものだったよう。
今回で言うと orderBy で create_date の指定、where で work_type の二つを指定しているので該当していますね。

> 複合クエリ
> 複数の where() メソッドをつなぎ合わせて、より具体的なクエリ（論理 AND）を作成することもできます。ただし、等価演算子（==）と range 句または array-contains 句（<、<=、>、>=、array-contains）を組み合わせる場合は、必ず複合インデックスを作成してください。

引用元:[Cloud Firestore で単純なクエリと複合クエリを実行する](https://firebase.google.com/docs/firestore/query-data/queries?hl=ja)

なるほど、複数のクエリを組み合わせて使用する時は複合 index を作成する必要があるらしい。
親切に google console のエラーの欄に複合インデックスを作成するページへのリンクが出ていたので、それを踏んで firebase から複合クエリを作成（作成に 3 分ほどかかりました）。
再度、同様のクエリを飛ばしてみたところ正常にデータを取得する事ができました。

参照:公式ドキュメント [Cloud Firestore でのインデックス管理](https://firebase.google.com/docs/firestore/query-data/indexing?hl=ja)


## まとめ

NoSQL あたり、もうすこしちゃんと調べて開発したいと思いました。(小学生並の感想)
このあたり RDB の方が柔軟なのかな。

## 追伸

katexの設定があって入れてみたら数式もかけるそう。
神

$
\frac{1}{2}
$