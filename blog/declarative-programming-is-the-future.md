---
title: 未来属于声明式编程
layout: post
date: 2019-07-18
tags: blog
categories:
  - Coding
# cover https://gbstatic.djyde.com/F5AF0D75-30A2-46DD-B66F-9FDEFFC10B27.png?x-oss-process=style/80
pin: true
---

[声明式编程](https://zh.wikipedia.org/zh-cn/%E5%AE%A3%E5%91%8A%E5%BC%8F%E7%B7%A8%E7%A8%8B?oldformat=true) （Declarative Programming）是一种编程范式。现实世界中，我们大部分编码都是命令式的。

举个最常见的例子，对于用 JavaScript 来构建 UI, React 是声明式的。

```js
// 普通的 DOM API 构建 UI

const div = document.createElement('div')
const p = document.createElement('p')
p.textContent = 'hello world'
const UI = div.append(p)
```

```js
// React 构建 UI
const h = React.craeteElement
const UI = h('div', null, h('p', null, 'hello world'))
```

所有的 DSL (HTML, XML, SQL) 都是声明式的，你写出一条 SQL 语句，只是为了告诉数据库你要什么，然后数据库就会给你对应的数据，而不是通过数据库的 API 去取。

```sql
SELECT * FROM Products WHERE name='Alipay'
```

Apple 在今年 (2019 年) 也推出了 Swift UI, 在 WWDC 的 Swift UI 相关的 Session 里也[多次提到声明式 UI 开发的威力](https://developer.apple.com/videos/play/wwdc2019/216/)。

声明式编程的潜力在于：

**解放人力成本，你只要「声明」你要做什么，具体怎么做，由运行时解决。**

函数式编程就是声明式编程的一种，在函数式编程里的[尾递归](https://zh.wikipedia.org/zh-hans/%E5%B0%BE%E8%B0%83%E7%94%A8?oldformat=true)性能，就取决于运行时，而不是靠程序员去手动优化。React 里你只要描述你的 UI, 接下来状态变化后 UI 如何更新，是 React 在运行时帮你处理的，而不是靠程序员优化 diff 算法。

我们可以认为 Serverless (尤其是函数计算) 在运维领域获得了声明式的好处 —— 我们定义好了函数，我们只要告诉平台我们需要调用这个函数，那么如何进行计算资源分配、如何对代码做分布式部署，都不需要程序员考虑。

运行时帮你完成工作，除了可以节省人力成本外，还降低了程序员出错的概率 —— 因为写的代码越少，出错的概率就越小。人是最不可靠的，我们应该尽量把工作交给计算机。

**「声明」是「描述」而不是真正「执行」**

在纯函数式编程语言里面，一切都是声明式的，是纯 (Pure) 的，没有副作用（Side Effect）的。

Haskell 是一个纯函数式的语言，像在控制台输出文本这种方法（`putStrLn`）就是一种副作用。在 Haskell 里 `putStrLn "Hello World"` 本身不会真正地输出 “Hello World“, 而是返回一个 IO 类型，来说明他是一个副作用。但它如何被执行，取决于运行时。

[Elm](https://elm-lang.org) 和 Haskell 一样，副作用也只是返回一种类似 Haskell 中的 IO 类型。在 Elm 中叫做 Cmd. 

![](https://gbstatic.djyde.com/F5AF0D75-30A2-46DD-B66F-9FDEFFC10B27.png?x-oss-process=style/80)

以上说的这些，可能太过抽象。所以我用前端的同学们应该都知道的 redux-saga 对此作更具象的解释。也可以解答为什么我虽然不喜欢 Redux, 但认为 redux-saga 是一个的很不错的库。因为他利用 redux 的 middleware 机制和 generator 巧妙地实现了类似 Haskell 的 IO. 

下面我将用 [官方文档的例子](https://redux-saga.js.org/docs/basics/DeclarativeEffects.html) 做解释。

比如，以下是一个有副作用的函数:

```js
import { call } from 'redux-saga/effects'

function* fetchProducts() {
  const products = yield call(Api.fetch, '/products')
  // ...
}
```

显然，`Api.fetch()` 是副作用，它会发送网络请求。但是，在 redux-saga 里面，你不应该直接执行这个函数，而是使用 `call` 告诉 redux-saga —— 你要执行 `Api.fetch` , 参数为 `/products`. 

所以，事实上这个函数没有被命令式地被执行，而是由 redux-saga 决定如何执行。

如果你在外部直接调用 `fetchProducts()`, 你会得到一个 Generator Iterator. 然后通过 `next()` 得到你 yield 的值。所以你可以这样去测试你的程序：

```js
const iterator = fetchProducts()

// expects a call instruction
assert.deepEqual(
  iterator.next().value,
  call(Api.fetch, '/products'),
  "fetchProducts should yield an Effect call(Api.fetch, './products')"
)
```

也就是说，你要测试的是「你有没有告诉程序你要执行的副作用，以及执行的参数是什么」。和命令式编程不同，因为命令式的程序在你执行函数时会真实地执行这个 `Api.fetch`，你必须用测试框架里类似 `mockFn` 的手段去 mock 这个函数进行测试。

`fetchProducts()` 只有在 Redux 环境里，才会真正地执行副作用（在这里就是 Api.fetch 发送的网络请求）。

所以，**声明式的编程是非常易于测试的**。

**可视化编程是一种声明式编程**

我们探索可视化编程，是因为我们一直期望通过拖拽就能完成开发，其实就是期望我们完成任务仅仅需要通过声明，而不是写命令式的代码。当然这是一种理想的状态。

DSL 是最常见的声明式编程形式。我一直在布道 GraphQL, 因为它把网络请求变得声明式了：

```
query {
	posts {
		id, title, content
  }
}
```

把网络请求变成声明式的好处有很多，其中一个就是它可以被放到各种各样的环境被执行。想象一下，我们可以打造一个可视化的应用搭建工具，在命令式编程的场景下，我们如果要做出如「点击按钮发送请求，得到响应后触发另一个 UI 更新」，就需要编写命令式的代码：

```js
async function onClickButton() {
	// 手动发送请求
	const result = await fetch('/api')
	// 手动更新 UI
  table.dataSource = result
}
```

如果是 GraphQL, 我们可以把每一条 GraphQL 语句单独看作一个对象，他可以被任何组件触发，它的结果也可以被任何组件订阅。这样一来，在可视化的搭建工具里，程序员要做的是：

1. （声明式地）编写 GraphQL 查询语句 
2. （声明式地）为组件（比如某个按钮）绑定 onClick 事件为触发某条查询语句
3. （声明式地）为组件（比如某个表格）绑定某条查询语句的响应值对应哪些组件的属性值

当然现实世界的应用不是那么简单，但已经是跨出了很大一步。

## Conclusion
未来为什么属于声明式编程，因为我们在不断地努力提高开发效率，声明式编程显然是提效的最佳手段。React, Flutter, SwiftUI, GraphQL 的出现是最好的证明。最近听到内网太多人在提 Serverless, 我想说，**提升开发效率，我们应该去想如何尽量让开发者声明式地编写代码，而不是只去想我们在 Serverless 上能做什么。**