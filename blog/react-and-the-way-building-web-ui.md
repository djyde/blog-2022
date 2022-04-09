---
title: 从 React 谈 Web UI 开发
layout: post
date: 2017-01-01
tags: blog
categories:
  - Coding
pin: true
---
<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">If using React makes u confused, it&#39;s time to think about what React actually is. It&#39;s a great DOM diff algorithm with component system.</p>&mdash; Randy (@randyloop) <a href="https://twitter.com/randyloop/status/814663047541231616">December 30, 2016</a></blockquote>
<component is="script" async src="//platform.twitter.com/widgets.js" charset="utf-8"></component>

此前我在 Twitter 上这样表达过对 React 的理解，但是 Twitter 篇幅有限，所以在这篇文章里，我要做更详尽的阐述。

我从前不喜欢 React, 是因为写 React 的 render function 不像写 template 一样方便，尤其是存在复杂的判断渲染的时候，Vue 的 template 一个 v-if 就搞定了。而在 React 里写，需要把这个判断写成 function, 然后条件判断 return 哪一个 view. 这是我最初对 React 的偏见所在之一。

然而经过自己的实践和思考，加上阅读一些文章，我发现以前的想法是错的。我在使用 React 的时候，没有做到 Thinking in React. 从而对 React 产生了不解和困惑。

有很多人把 React 当成框架来用，这是用不好 React 的根本原因。很少人认真思考 **A JavaScript library for building User Interface** 背后的含义，把 React 用得一团糟。

何谓 For Building User Interface? 意思就是，这个库仅仅是用于构建 UI 的，这是 React 本质要解决的问题。我甚至和很多人说，事实上 React 本身是不是 React 已经不重要了，重要的是我们写 UI 的思维。**React 这个 library 本身仅仅是用来实现这个思维的手段**。React 提供的，是优秀的 DOM diff 算法，和一套 Component system。换成代码来说，也就是：

```javascript
(state) => View
```

这是 React building UI 的核心思想，所有的组件，就是接受 state, 返回一个 View. 这样看上去比较抽象，比如我们有一个 Clock 组件：

```javascript
const Clock = (time) => `
<div id='clock'>
	<span>It's now: </span>
	<span>${time}</span>
</div>
`
```

Clock 是一个 function, 接受一个 time 参数，返回的是一串 HTML String. 在程序里，我们可以给一个 Interval, 每秒传一个当前的 time, 得到一个新的 HTML String, 然后 apply 到某个 DOM 上。

```javascript
const $app = document.getElementById('app')

setInterval(() => {
  $app.innerHTMl = Clock(Date.now())
}, 1000)
```

这样的实现是能达到目的的，但是问题在于，每次 `innerHTML` 时，整个 `#app` 的 DOM 树会被重新渲染。

![](https://gbstatic.djyde.com/blog/plain-render-clock.gif)

我们都知道，DOM 更新的花费是昂贵的。整个 DOM 树，实际上只是一个 `span` 在不断变化，所以我们需要 DOM diff 算法来得知到底哪一个 DOM 节点才需要被更新，从而节省开销：

```javascript
const Clock = ({time}) => (
  <div id='clock'>
    <span>It's now: </span>
    <span>{time}</span>
  </div>
)

const $app = document.getElementById('app')

setInterval(() => {
  ReactDOM.render(<Clock time={Date.now()} />, $app)
}, 1000)
```

在 React 里，把 props 传入，返回一个类似 HTML 的结构，然后 render 到指定的 DOM 节点上。这里 React 会算出哪个节点应该被更新：

![](https://gbstatic.djyde.com/blog/react-render-clock.gif)

我们这样手动去 setInterval 然后 render 未免有点傻，我们可以更改 state (也就是通常用到的 `setState`) 自动地让 React 随着 state 的改变而重新 render. 这里的 time 就是一个 state. 这叫做 Reactive.

Functional Programming 里有 Pure Function 的概念。Pure Function 之所以 Pure, 是因为不存在 side effect. 举个例子，我们写一个求和 function：

```javascript
function add (a, b) {
  return a + b
}
```

这个求和函数就是一个 pure function. 因为函数内部没有对 input 做任何改变，并且返回一个新的值。我传 1 和 1，得到的永远是 2.

Pure Function 的好处是利于维护和测试。要测试一个 Pure Function, 仅仅是传不同的值，预言对应的返回值。

现在回头看 React 的 Component, 也可以算是一个 Pure Function——接收不同的 props, 然后 render 对应的 View. 上面 Clock 的例子，props 和返回的 View 是映射关系。

光是 `state => View` 还不够，在构建 UI 的时候，我们希望 state 改变的时候，立即 rerender 整个 View, 也就是我们经常用到的 `setState()`. 

这样就很容易理解为什么我说 React 仅仅是实现构建 UI 思想的手段，因为构建 UI 的思想总结起来就是：

1. State 是 Reactive 的 (比如 React 的 `setState`)
2. state => View (依靠 DOM diff)
3. View 组成 Component
4. 管理 state （依靠第三方的 state manager）

无论是 React 还是 Vue, 大抵都是这样的思想。Vue 1 还不完全是，Vue 2 就更接近了，只是后者写法既可以写得像 template, 又可以写直接写 vdom. 

而开发者常常感到困难的地方实际上是上面的第 4 点——管理 state. **写 React 写得痛苦，大部分原因是用把 library 当成 framework 去用**，把处理 state 的逻辑瞎写到 View 层中去，也就是所谓的 Dump Component.

改变 state 是 side effect, 我们应该把它从 View 层中分离出去。我多次提到，**View 层真正要做的，仅仅是根据 state 返回对应的 View**. state 的变化逻辑，应该在给 state manager 库去做，例如 Redux, Mobx. 下面我用 Mobx 作为例子：

![](https://gbstatic.djyde.com/blog/mobx-ticker.gif)

*https://jsbin.com/fumerup/edit?js,output*

如果没有接触过 Mobx 不用慌张，只需要知道，Mobx 的 Observable 变化时，被 observer 包装的 React 组件会重新渲染。使用 state manager, 明显地分离了 View 和 side-effect:

![](https://gbstatic.djyde.com/blog/state-effect-view.png)

测试这样的程序，首先为 side effect 的逻辑做测试，再为 View 做测试。View 的测试在这里就十分简单了，给他传一个 store 实例，借助 [enzyme](https://github.com/airbnb/enzyme) 之类的 testing utilities 预言不同的 action 得到的返回 View.

React 是 Reactive Programming 在 Web User Interface 上实现的手段，它只不过是一个库，提供了reactive render, component system 和降低开销的 DOM diff 算法. 把 React 换掉，只要不是手动操作 DOM, 其它的框架也不过大同小异。重要的是理解它背后的思想。说到底，前端开发在解决什么问题，用什么样的方式解决问题，在使用任何框架和库之前先把这两个问题思考明白，就不会认为前端难学了。
