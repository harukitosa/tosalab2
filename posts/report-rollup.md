---
title: "Rollup触ってみた"
date: "2021-3-7"
template: "post"
draft: false
slug: "report-rollup"
category: "Engineer"
tags:
    - "rollup"
    - "frontend"
description: "bundleツールであるrollupを触ってみたので概要をまとめる"
---

# Rollup とは

何がともあれまずは[公式ドキュメント](https://rollupjs.org/guide/en/)をよむ。

### Overview[引用]

Rollup is a module bundler for JavaScript which compiles small pieces of code into something larger and more complex, such as a library or application. It uses the new standardized format for code modules included in the ES6 revision of JavaScript, instead of previous idiosyncratic solutions such as CommonJS and AMD. ES modules let you freely and seamlessly combine the most useful individual functions from your favorite libraries. This will eventually be possible natively everywhere, but Rollup lets you do it today.

Javascript の bundle ツールです。Webpack とやっている仕事は同じ。複数の Javascript ファイルをまとめて、一つにまとめることを bundle と読んでいる。

また、ユーザー側は ES6 形式で書いて、rollup が既存のブラウザでサポートされている形式(CommonJS, AMD)にコンパイルもしてくれる。

※ES6 の現在の対応状況は[こちら](https://kangax.github.io/compat-table/es6/)

### Tree-Shaking

rollup は静的解析を用いて import されているが使用されていない関数やモジュールを取り除いてくれる。

結果として bundle サイズが小さくなる。

### Tree-Shaking を試してみる

公式ドキュメントの Tutorial>Creating Your First Bundle に乗っ取ってプロジェクトを作ってみる。今回はきちんと不要なモジュールが bundle されていないか確かめるために hoge.js の方は import しているが使用しないようにしている。

```js
// sample-project/src/foo.js
export default "hello world!";
```

```js
// sample-project/src/hoge.js
export default "hello hoge!";
```

```js
// sample-project/src/main.js
import foo from "./foo.js"; // 使ってる
import hoge from "./hoge.js"; // 使ってない
export default function () {
    console.log(foo);
}
```

準備ができたら bundle してみる。rollup はすでにインストールされており node_module にきちんと path が通っていることを確認して以下のコマンドを打つと bundle.js ファイルが生成される。

```zsh
rollup src/main.js -o bundle.js -f cjs
# -o [output file name]
# -f [format]
```

```js
// bundle.js
"use strict";

// src/foo.js
var foo = "hello world!";

// src/main.js
function main() {
    console.log(foo);
}

module.exports = main;
```

hoge がきちんと削除されていることが確認できた。つぎに、hoge を使用した場合はどのようになるのかを確認する。

```js
// sample-project/src/main.js
import foo from "./foo.js"; // 使ってる
import hoge from "./hoge.js"; // 使ってない
export default function () {
    console.log(foo);
    console.log(hoge);
}
```

zsh

```zsh
rollup src/main.js -o bundle.js -f cjs
# -o [output file name]
# -f [format]
```

bundle された結果、きちんと hoge が存在していることがわかる。

```js
"use strict";

// src/foo.js
var foo = "hello world!";

// src/foo.js
var hoge = "hello hoge!";

// src/main.js
function main() {
    console.log(foo);
    console.log(hoge);
}

module.exports = main;
```

簡単な検証であるが、TreeShaking の働きを理解することができる。

### rollup の config ファイル

project のルートディレクトリに rollup.config.js という名前のファイルが config ファイルとなる。

以下のような設定ファイルを書いて`rollup --config`でファイルを読み込んで、設定に従い bundle する。

```js
// rollup.config.js
export default [
    {
        input: "src/main.js",
        output: {
            file: "bundle.js",
            format: "cjs",
        },
    },
];
```

### 変更検知

`rollup -w`でファイルの変更を検出して、build するようになる。
ローカルのファイルをサーバーにあげて hotreload で開発したい時などに便利。

```zsh
rollup --config -w
```

## これから先勉強できそうなこと

-   TreeShaking のコードリーディング、JS の静的解析
-   watch の仕組み

## 参考文献・サイト

[rollup 公式ドキュメント](https://rollupjs.org/guide/en/)

[Tree shaking](https://developer.mozilla.org/ja/docs/Glossary/Tree_shaking)
