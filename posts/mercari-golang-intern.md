---
title: メルカリの「Online Summer Internship for Gophers 2020」に参加して静的解析ツールをつくった話！
date: "2020-09-04"
template: "post"
draft: false
slug: "mercari-golang-intern"
category: "Engineer"
tags:
    - "intern"
    - "golang"
description: "夏休みの 8/31~9/4 に開催された mercari online summer internship に参加して来ました！"
socialImage: "/media/mercari.jpeg"
---

とさです。

夏休みの 8/31~9/4 に開催された mercari online summer internship に参加して来ました！

golang からプログラミングを始めたといって過言がない自分としては興味のある内容で、楽しい一週間でした！！

# 概要

> Online Summer Internship for Gophers 2020 は、メルカリ・メルペイで採用されている Go をハンズオンなどのワークショップを交えつつ学ぶ、短期インターンシップです。
>
> 構文解析をし抽象構文木（AST）を得て解析する方法から、型情報を取得する型チェック、静的単一代入（SSA）形式への変換とそれを使った解析まで Go の静的解析を深く学ぶ
>
> Go の静的解析ツールの開発に取り組むことで、一段飛び抜けてくわしくなる etc..

詳しい概要等はメルカリの web サイトでご覧ください
(https://mercan.mercari.com/articles/22800/)

# 参加が決定するまで

golang がインターンでかけるなら応募するしかないと応募がかかった段階で申込みました。
今までプログラミングでやってきたことなどもろもろなどを記入する書類選考と golang を使用して解く三問くらいのコーディングテスト。~~問題文が英語ですこしびびりつつ~~。最後に面接をして参加させていただくことがきまりました。

面接ではその時取り組んでいたもの（go で作るインタプリタ）についてや、メルカリとメルペイのサービスについて話したりしました。話題のウイルスで人と全く話せなかったので面接官と話している時間はとても楽しかったです！

# 準備

golang は趣味ではよくかいていますが、アルバイトとかで書いたことがなかったので理解が足りるか少し不安気味。
また静的解析といわれても、Javascript とか書いてるとででくるあの真っ赤なやつくらいのイメージしかないくらいの知識でした。

準備といってもしっかりとしたものではないですが、面接の時にも話した go でつくるインタプリタをすこしすすめて字句解析や抽象構文木っていうのがいつも動かしているプログラムの下にあるんだなくらいに理解をしておきました。

# 講義編

初日と三日目は講義編でした！講師は[tenntennʕ ◔ϖ◔ʔ ==Go](https://twitter.com/tenntenn)さんでこの[スライド](https://docs.google.com/presentation/d/1I4pHnzV2dFOMbRcpA-XD0TaLcX6PBKpls6WxGHoMjOg/edit)を元に行われました。
（なんと無料で公開されています。すごい）

講義資料が本当によくまとまっているので、開発中も閲覧しながら参考にしていました。

講義の合間合間に[TRY]で学習したことをもとに解析ツールを実際にコードを書いてみたり、他の参加者さんの作成したコードを読んで学習していくことで理解がふかまった気がします。

抽象構文木の探索の際に**深さ優先探索**の話題がでてきたときは競技プログラミングでやったやつや！ってすこし感動したり...

また go 言語が parser や go/analysis パッケージなどを用意してくれているためツールの開発に専念できる点がとてもよさげでした。

# 開発編

二日目と四日目、五日目は学習した内容をもとに実際に静的解析ツールをつくってみようという作業時間でした！Remo とよばれるテレビ電話サービスをつなぎながら他のインターン生ともくもくと開発をしていました。

自分はみっつほど静的解析ツールを開発しました。

※静的解析とは**プログラムを実行せずにソースコードを解析すること**

## errchecker

errchecker は返り値として error を指定している関数が error を返さずに nil だけを返している場合に指摘するツールです。

[![harukitosa/errchecker - GitHub](https://gh-card.dev/repos/harukitosa/errchecker.svg)](https://github.com/harukitosa/errchecker)

## がんばった点

実装的には ast.FuncDecl,ast.FuncLit を走査して返り値に error を指定しているかどうかとその場所(index)そのあと関数内部の処理のなかで return 文をさがしてきちんと error を返しているかどうかを確認していく方向性でいきました。

### 複数の if - elseif - else 文を再起的に対応しなくてはいけなかった。

関数の内部を一行ずつ走査していく関係から分岐の内部もしらべなくてはいけないので if 文、else 文のなかで return しているかどうかを確かめる処理を再起的にかきました。可読性が低くなってしまったのでもっといい方法があったら修正したいです。

```go
// ifstmtProcess is *ast.IfStmt processe
func ifstmtProcess(stmt *ast.IfStmt, idx int) bool {
	flag := true
	flag = isReturnNil(stmt.Body.List, idx)
	switch e := stmt.Else.(type) {
	case *ast.IfStmt:
		flag = ifstmtProcess(e, idx)
	case *ast.BlockStmt:
		flag = isReturnNil(e.List, idx)
	}
	return flag
}
```

### 通常の関数だけではなく無名関数の場合もきちんと指摘するようにした

~~無名関数のことをわすれていた~~

```go
// testコード
// 無名関数の場合も指摘
func anonfunc() (int, error) {
	s := func(src string) (int, error) { return 2, errors.New("error") }
	return s("hogehoge")
}

func anonfunc2() error {
	s := func(src string) error { return nil } // want "It returns nil in all the places where it should return error"
	return s("hogehoge")
}
```

また、テストコードを複数作成していたのでリファクタリングや昨日の変更をするときにとても安心しておこなえました！やはり、テストは大切です。

## countname

変数、関数、定数名が長いものを指摘するツール

[![harukitosa/countname - GitHub](https://gh-card.dev/repos/harukitosa/countname.svg)](https://github.com/harukitosa/countname)

## がんばった点

golang ではわりと短い変数名がこのまれているので 20 文字以上の変数、定数、関数名を指摘するツールを作成しました。アイデアをおもいついたら小さくてもすぐに実装してみようと思い立ってから 1 時間ほどで作成しました。
[skeleton](https://github.com/gostaticanalysis/skeleton)を使用すれば簡単に analyzer の雛形を生成してくれるのですぐに作成を始めることができてとても便利です。

自分でコードを書いたのは以下の部分くらいです。

```go
	nodeFilter := []ast.Node{
		(*ast.GenDecl)(nil),
		(*ast.FuncDecl)(nil),
	}

	inspect.Preorder(nodeFilter, func(n ast.Node) {
		switch decl := n.(type) {
		case *ast.GenDecl:
			for i := 0; i < len(decl.Specs); i++ {
				switch spec := decl.Specs[i].(type) {
				case *ast.ValueSpec:
					var flag bool
					for _, name := range spec.Names {
						if !flag && len(name.Name) > maxLongNum {
							pass.Reportf(n.Pos(), "name is longer than %d", maxLongNum)
							flag = true
						}
					}
				}
			}
		case *ast.FuncDecl:
			if len(decl.Name.Name) > maxLongNum {
				pass.Reportf(n.Pos(), "name is longer than %d", maxLongNum)
			}
		}
	})

```

実装方針としてはファイルの中の*ast.GenDecl, *ast.FuncDecl(詳しく知りたい人は[ここ](https://docs.google.com/presentation/d/1I4pHnzV2dFOMbRcpA-XD0TaLcX6PBKpls6WxGHoMjOg/edit#slide=id.g8791627004_3_7))を取得して来て名称が 20 文字以上であれば指摘する形です。

## goaster

golang のソースファイルを指定するとそのファイルの抽象構文木を生成してエディターで閲覧できるコマンドラインツール

[![harukitosa/goaster - GitHub](https://gh-card.dev/repos/harukitosa/goaster.svg)](https://github.com/harukitosa/goaster)

![goaster](https://user-images.githubusercontent.com/44115752/92212447-ef139b00-eecc-11ea-8823-b88e82ab350a.gif)

抽象構文木（ast)をみながら上の二つのツールを作成したので対象とするテストコードなどの go ファイルの ast をもう少し手軽にみることができたらいいなと思い作成しました。go/ast の fPrintf などのコードを拝借して、エディターでも見やすい形に出力できていると思います。この抽象構文木を編集したら元のソースコードも変更される！なんてことができたらおもしろいだろうなと思ったのですが時間切れで、積み残しの課題になりました。~~あとテストコード書いてない~~

# 感想

一週間 golang を触れたので自分は大満足でした！！
まだまだ学習したいことがたくさんあるのでこの経験を生かしてこれからも Gopher の駆け出しとしてがんばっていきたいと思います！

メルカリさんと講師とメンターの皆様！お世話になりました 🙇‍♂️

# あとがき

一週間がんばったので温泉にでも入りにいきたいです。

golang のマスコットキャラクター gopher 君(偽物)
<img src="/media/gopher.jpeg"/>
