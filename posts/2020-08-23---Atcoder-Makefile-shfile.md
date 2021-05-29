---
title: 競技プログラミング用(C++)のコンパイルを簡単にできるようにしてみた
date: "2020-08-23"
template: "post"
draft: false
slug: "atcoder-makefile-shfile"
category: "Engineer"
tags:
    - "atcoder"
    - "小技"
description: "MacOSにてC++用のコンパイル環境をできるだけ少ないコマンドで実現できるようにファイルを書いたのでそれを掲載する。"
socialImage: "/media/2020-08-22.jpeg"
---

# 概要

C++で競技プログラミング(Atcoder)を行なっているのだが、VScode のターミナル上での自動コンパイルがどうも肌に合わず、iTerm 上でいちいちコマンドを打ってコンパイルして確認をしていた、その作業に慣れはしたもののやはりめんどくさいかつ typo に気を取られることが多くなったのでできるだけ簡単なコマンドでコンパイルを行えるように sh スクリプトと makefile を書いてみたという記録。

# コンパイル対象のファイルを作成する

Atcoder の ABC の問題を解く際に mainA.cpp ~ mainF.cpp ファイルを作成してそこにコードを記入するのでこのファイル群をコマンド一つでコンパイルできるようにする。

```zsh
mkdir contest
```

contest ディレクトリ内に以下のファイルを用意する。

## build.sh

```sh
#!/bin/sh

make mainA
make mainB
make mainC
make mainD
make mainE
make mainF
```

自分も知らなかったのだが mainA.cpp ファイルがある際に make mainA(file 名の拡張子抜き)を打つとコンパイルできる、便利。

## makefile

```makefile
build: build.sh
	./build.sh

clean:
	rm mainA
	rm mainB
	rm mainC
	rm mainD
	rm mainE
	rm mainF

touch:
	touch mainA.cpp
	touch mainB.cpp
	touch mainC.cpp
	touch mainD.cpp
	touch mainE.cpp
	touch mainF.cpp
```

もちろん build.sh は実行できるように権限を変更しておく。

```zsh
chmod +x build.sh
```

以上で下準備は完成だ。

## 実行

make （もしくは make build)と打ち込むだけで全てのファイルをコンパイルすることができる。

```zsh
>>> make
./build.sh
c++  -I/usr/local/opt/openjdk/include   mainA.cpp   -o mainA
make[1]: `mainB' is up to date.
make[1]: `mainC' is up to date.
make[1]: `mainD' is up to date.
make[1]: `mainE' is up to date.
make[1]: `mainF' is up to date.
```

前回のコンパイルからファイル内容を変えていない場合は`` make[1]: `mainB' is up to date. ``のようにコンパイルしないで飛ばすので効率的。あとは実行してコードのテストをすれば OK

```zsh
>>> ./mainA
hogehoge
```

## 感想

以上の準備をすることでコンパイルを脳死で行うことができるようになった。今考えれば build.sh ファイルのコマンドをそのまま makefile に書いてしまえば良さそうだが動作しているのでよしとする（一度完成したのを直すの~~めんどくさい~~）。
自動化をめんどくさがる癖があるのでことあるたびに sh スクリプトや makefile をちょくちょく書く癖をつけたいです。

## 参考文献

[C 言語を使うなら Make を使おうよ](https://qiita.com/j8takagi/items/74232a00cc33623f784)
