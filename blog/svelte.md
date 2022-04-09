---
title: 我对 Svelte 的看法
layout: post
tags: blog
date: 2021-03-09
pin: true
categories:
  - tech

---

我在很早前已经听说过 [Svelte](https://svelte.dev), 但是一直没有机会在新的项目真正地用上。最近在尝试模仿实现一个 [Roam Research](https://roamresearch.com) 的编辑器，考虑到可能会有大量和 DOM 交互的逻辑，所以我趁这个机会选择了 Svelte, 目前这个编辑器的已经完成了大部分的功能，开源在 https://github.com/djyde/plastic-editor .

在开发的过程中我对 Svelte 非常满意，这篇文章打算就我的体验来说说我对 Svelte 的一些看法。

你需要有使用过任意一个前端框架的经验才能读懂本文。这篇文章**不是**一篇 Svelte 教程，如果你想学习 Svelte, 请浏览 [Svelte 的官方教程](https://svelte.dev/tutorial/basics)，**本文试图通过告诉读者 Svelte 在编译阶段做了什么，来让只听说过 Svelte 的读者，从浅层的原理和设计的角度，了解到 Svelte 是一个怎么样的框架、她和其它框架的区别是什么**。

## Svelte 是什么？

简单来说 Svelte 是一个在编译时实现了 Reactivity (反应式) 的框架，所以它既是一个框架，同时也是一个 Compiler. 如何理解「编译时实现了 Reactivity」？先说说什么是 Reactivity.

```js
let a = 1
let b = 2
let c = a + b
console.log(c) //=> 3
a = 2
console.log(c) //=> 3, not 4
```

JavaScript 没有 Reactivity 的能力，所以即使 `let c = a + b`, 在改变了 `a` 或 `b` 的值之后，`c` 不会因此而改变。真正的 Reactive 与此相反。

拿 Excel 举例，Excel 是天生 Reactive 的，一个 Excel 里面的单元格，可以编写简单的函数组合其它单元格的值，而组合的结果会随着依赖的单元格改变而自动改变。例如单元格 `C1` 如果是  `=SUM(A1:B1)` , 那么 `C1` 值会随着 `A1` 或 `B1` 的值而重新计算和改变。

如果你用过 Vue 或者 MobX, 你应该知道它们实现 Reactivity 的原理：它们使用了 `defineProperty` 或者 `Proxy`, 在 setter 这一层做了一些手脚，当对象的某个成员被赋值的时候，执行更新逻辑。

```js
const reactive = {}
Object.defineProperty(reactive, 'a', {
  set(value) {
		console.log('a was updated')
  }
})

reactive.a = 'changed' //=> a was updated
```

这是一种「运行时」的手段，它需要在运行时改变了赋值行为，所以在用 Vue 的时候，你必需把需要 Reactivity 的对象包在 `data` 里，上文的例子用 Vue 需要这么写：

```js
const yourData = {
  data() {
    return {
      a: 1,
      b: 2
    }
  },
  computed: { // 还有 computed
    c() {
      return this.a + this.b
    }
  }
}

const reactive = new Vue(yourData)
console.log(reactive.c) //=> 3
reactive.a = 2
console.log(reactive.c) //=> 4, not 3
```

但是我们可以想一想，如果不用 `defineProperty`, 可以实现类似的功能吗？

当然可以：

```js
let a = 1
let b = 2
let c = a + b

function update() {
  c = a + b
}

console.log(c) //=> 3

a = 2; update()
console.log(c) //=> 4

b = 5; update()
console.log(c) //=> 6
```

我们只要每次在赋值的时候，手动触发一个 `update` 函数，那么 `c` 的值就会重新计算，不就实现了 Reactivity 的效果吗？

但是这样做未免太蠢，要写太多的代码，而且很容易漏掉。不过，我们可以借助 Compiler 帮我们做这些事！在编译时，每当遇到赋值语句，我们就让它在赋值语句的后面自动加一个调用 `update` 方法的语句。

这就是 Svelte 做的事情。当然实际上的实现要更加复杂一些（比如需要把更新放在同一个 microtask 里），但原理是一样的。

Reactivity 是现代的前端框架的标配，因为从前 MVC 的开发模式对 UI 开发来说，要在 Controller 手动操作 DOM 这个步骤显得有点枯燥和多余，我们希望 UI 是自动随着数据的变化而自动更新的。因此**不同的框架除了写法不尽相同外，最主要的区别还是在于框架在检测到数据更新后，如何处理 UI 的更新**。

以一个 Counter 为例，这是 React 的写法：

```jsx
function Counter () {
  const [ count, setCount ] = React.useState(0)
  return (
    <>
    	<div>{count}</div>
	    <button onClick={_ => setCount(count + 1) }>+</button>
      <button onClick={_ => setCount(count - 1) }>-</button>
    </>
  )
}
```

我在之前的文章已经谈过 React 的思想，在这里稍作重复。React 主张「视图」是「状态」的函数：

```bash
UI = f(state)
```

在 `setState` 的时候，这个函数会重新执行，因为是新的 `state`, 因此 UI 是变化的。在 React 里，UI 是 Virtual DOM, 用算法对比两个 DOM 树，来算出哪个真实的 DOM 需要被更新。

React 的实现非常「粗暴」，因为它是真的会重新执行这个函数，在上面的例子中，`Counter` 会在每次状态变化的时候被重新执行。这使得写 React 组件要多留心性能问题，因为你要避免在函数内部进行不必要的计算：

```diff
function Counter () {
  const [ count, setCount ] = React.useState(0)

+ doSomethingHeavy()
  
  return (
    <>
    	<div>{count}</div>
	    <button onClick={_ => setCount(count + 1) }>+</button>
      <button onClick={_ => setCount(count - 1) }>-</button>
    </>
  )
}
```

在「古典」React 里，你不得不写 shouldComponentUpdate, 在现代 React, 你同样需要引入 `useCallback` 和  `useMemo`，手动地缓存函数，来避免性能问题。

同样是使用 Virtual DOM 的 Vue 却没有这个问题，因为 Vue 的机制（依赖收集）决定了它不必重新执行整个 UI 函数来换取新的 Virutal DOM 树，当某个状态更新的时候，它明确地知道应该 diff 哪些节点。

> 如果你是 Vue 用户，而不太清楚 React 的机制, 你可以把一个 React 组件函数想象成是一个 Vue 的 `computed` 里的成员函数, 你一定知道在 `computed` 的成员函数里做耗时计算的后果是什么。

现代前端框架倾向于使用 Virtual DOM, 我认为主要出于两点：

- Virtual DOM 可以 port 到任何除了 Web 以外的宿主环境。
- Virtual DOM diff 算法足够快，框架把 DOM diff 和 DOM 修改的工作交给了算法，可以把精力花在实现框架的其它功能上。

Virtual DOM 的本质就是找出需要被修改的真实 DOM 节点，难道不用 Virtual DOM 就不能实现吗？当然不是。回到上面的 Counter 的例子，我们如何用 Vanilla JS (原生 JavaScript) 来实现：

```js 
const target = document.querySelector('#app')

// state
let count = 0

// view
const div = document.createElement('div')
const countText = document.createTextNode(`${count}`)
div.appendChild(countText)

const button1 = document.createElement('button')
const button1Text = document.createTextNode(`+`)
button1.appendChild(button1Text)

const button2 = document.createElement('button')
const button2Text = document.createTextNode(`-`)
button2.appendChild(button2Text)

target.appendChild(div)
target.appendChild(button1)
target.appendChild(button2)

// event
button1.addEventListener('click', () => {
  count += 1
})
button2.addEventListener('click', () => {
  count -= 1
})

```

上面的程序生成了 UI, 绑定了点击事件，改变了状态 `count` 的值。但是显然 UI 是不会随之改变的，所以我们需要写一个 `update` 函数，让状态在变化的时候，触发特定的 UI 更新逻辑：

```js
const target = document.querySelector('#app')

// state
let state = {
  count: 0
}

// view
const div = document.createElement('div')
const countText = document.createTextNode(`${state.count}`)
div.appendChild(countText)

const button1 = document.createElement('button')
const button1Text = document.createTextNode(`+`)
button1.appendChild(button1Text)

const button2 = document.createElement('button')
const button2Text = document.createTextNode(`-`)
button2.appendChild(button2Text)

target.appendChild(div)
target.appendChild(button1)
target.appendChild(button2)

// event
button1.addEventListener('click', () => {
  update('count', state.count + 1)
})
button2.addEventListener('click', () => {
  update('count', state.count - 1)
})

// update
function update(key, value) {
  state[key] = value
  countText.nodeValue = state[key]
}
```

现在点击按钮，`div` 显示的 `count` 就会变化了，因为我们在 `update` 函数指明了 UI 更新的逻辑。

我敢保证上面的程序性能一定比 React 版本的更好（当然在这个例子可能只相差 0.0000002ms），因为 DOM diff 再快还是要算，原生 JavaScript 是不需要算的。

但没人愿意这样写程序：

1. 这样的代码完全丧失了可读性，无法一眼看出 UI 树的结构。
2. UI 只要一调整，就需要写大量的代码。
3. 每当有元素依赖一个状态值，就要手动在 `update` 函数中加上 UI 更新的逻辑。和传统的 MVC 没区别。

Svelte 是一个 Compiler, 帮助你在编译时生成这些 Vanilla JS 的代码，同时收集依赖，生成 UI 更新的逻辑。

```html
<div>hello world</div>
```

会被编译成：

```js
const div = document.createElement('div')
const text = document.createTextNode('hello world')
div.appendChild(text)
```

> 这并不是 Svelte 编译出来的代码，真实的代码经过了封装。这里只是为了方便讲解，但本质上是一致的。

加一个变量：

```html
<script>
  let count = 0
</script>
<div>
  {count}
</div>
```

会被编译成：

```js
let count = 0
const div = document.createElement('div')
const text = document.createTextNode(`${count}`)
div.appendChild(text)

update() {
  text.nodeValue = count
}
```

> 再次强调，这并非 Svelte 编译出来的真实代码。如果你对 Svelte 真实编译出来的代码有兴趣，可以在官方的 REPL https://svelte.dev/repl 写一个简单的 Svelte 组件然后看 JS output. 然后推荐进一步阅读 https://lihautan.com/compile-svelte-in-your-head/

编译器在遇到 `{count}` 的时候，就可以收集到在 count 变化的时候需要更新哪些元素。也就是说，像 Vue 那样通过 getter 实现的依赖收集，Svelte 通过编译阶段实现了。

一个完整的 Counter:

```html
<script>
  let count = 0
</script>

<div>
  {count}
</div>
<button on:click={_ => { count += 1 }}>+</button>
<button on:click={_ => { count -= 1 }}>-</button>
```

> 你可以在这里打开这个程序 https://svelte.dev/repl/cfd45cdafb8a48a88edab6921c69ac0c?version=3

在编译的阶段，只要遇到赋值语句，就可以插入一个语句来安排 UI update (schedule update). 就像本文最初提到的方法一样。

到这里，已经解释了什么是「在编译时实现了 Reactivity」。

## Svelte 的特殊语法

Svelte 里有一个比较特殊的语法，值得在这里介绍一下。

回到最初的例子：

```js
let a = 1
let b = 2
let c = a + b
```

`c` 依赖了其它变量，如果其中的依赖发生了改变，它应该会被重新计算。在 Vue 里可以通过 `computed` 实现：

```js
const reactive = new Vue({
  data() {
    return {
      a: 1,
      b: 2
    }
  },
  computed: {
    c() {
      return this.a + this.b
    }
  }
})
```

Svelte 用了一个特殊的语法实现了类似 computed 的功能：

```html
<script>
  let a = 1
  let b = 2
  $: c = a + b
</script>

<span>{c}</span>
```

>  `:` 其实是一个合法的 JavaScript 语法，https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/label

当然背后同样是在编译时实现的，它在更新视图的函数前会加入执行 `a + b` 并赋值给 c 的语句。

## Svelte 的跨组件通讯

状态管理和组件通讯是前端框架设计比较重要的一块，通常的做法是 [Lifting State Up](https://zh-hans.reactjs.org/docs/lifting-state-up.html). 也就是两个同级组件如果想要共享状态，那就把这个状态上升到共同的父组件上面去。Svelte 也可以这么做。不过 Svelte 里有 `store` , 你可以定义一个 writable store, 然后在不同的组件之间进行读取和更新：

```html 
// store.js
import { wrtiable } from 'svelte/store'
export let count = writable(0)

// A.svelte
<script>
import { count } from './store.js'
  
let count_value
const unsub = count.subscribe((newValue) => {
  count_value = newValue
})
</script>
<sapn>{count_value}</sapn>

// B.svelte
<script>
import { count } from './store.js'
</script>
<button on:click={_ => count.set(2) }>mutate</button>

```

每个 writable store 其实是一个 object, 在需要用到这个值的组件里可以 `subscribe` 他的变化，然后更新到自己组件里的状态。在另一个组件里可以调用 `set` 更新这个状态的值。

敏锐的读者可能已经发现，上面的代码没有处理组件销毁时 unsubscribe. 当然我可以在 `onDestroy()` 里调用 `unsub()`, 但是在 Svelte, 有个更便捷的语法：

```html 
// store.js
import { wrtiable } from 'svelte/store'
export let count = writable(0)

// A.svelte
<script>
import { count } from './store.js'
  
</script>
<sapn>{$count}</sapn>

// B.svelte
<script>
import { count } from './store.js'
</script>
<button on:click={_ => $count = 2 }>mutate</button>
```

Svelte 规定了在 store 前面加一个 `$`, 会自动 subscribe, 得到它的值，并且在组件被销毁的时候自动帮你 unsubscribe 它。对它进行赋值的时候，其实相当于执行了 `.set()` 的方法。

不要以为 `svelte/store` 的 writable 返回的对象是一个黑魔法，其实他不过是一个普通的对象而已，只是 Svelte 在编译的时候对 `$` 为首的变量做了一些特殊处理。比如：

```html
<script>
  console.log($name)
</script>
```

会编译成：

```js
let name_value
const unsub = name.subscribe((newValue) => {
  name_value = newValue
})
console.log(name_value)
onDestroy(() =>{
  unsub()
})
```

> 同样这不是 Svelte 实际生成的代码，这里是为了讲解，但本质和 Svelte 的逻辑一致

对一个 store 赋值：

```html
<script>
	$name = 'new'
</script>
```

会被编译成：

```js
name_value.set('name')
```

看到这里，你可能已经知道了，其实 store 只不过是一个普通的对象，只是如果你在 Svelte 里通过 $ 符号进行操作的时候，会调用它的一些方法。这些方法就是：

- `subscribe`. 返回一个 unsubscribe 方法
- `set`

只要任何对象有实现两个方法，就可以用 $ 进行这样的便捷使用。这是一种 Svelte 约定的 [store 协议](https://svelte.dev/docs#Store_contract). `writable` 是一个创建符合 store 协议的对象的捷径，不是什么黑魔法。

> 如果你用 RxJS, 你会发现 RxJS 天生就兼容 store 协议

## 我对 Svelte 的看法

我用 React 太久了，在用回不需要关心 rerender 问题的框架，我觉得非常舒服😄。当然 Vue 也不需要，我觉得在某个程度上 Svelte 和 Vue 很像，它和 Vue  的区别是：

- 实现 Reactivity 的原理都是依赖收集，但 Svelte 是在编译时完成了，Vue 在运行时收集。
- Vue 用了 Virtual DOM, Svelte 在编译时就知道它应该操作哪个 DOM

因为所有的功能都是在编译时实现的，所以用 Svelte 写的代码非常直白 —— 像正常定义变量一样定义变量，在 HTML 里使用这个变量，修改这个变量（而且没有 `this`）。运行时的框架无论如何简单，至少需要你写一层 Wrapper，例如在 Vue 里你必须把状态包在 data 函数中返回。

我认为 [Write less code](https://svelte.dev/blog/write-less-code) 是重要的，在前端开发的领域，我们花了太多精力在处理像 immutable, reactivity 这些 UI 开发标配的特性上面， 我一直认为需要有一门天生带了这些特性的语言用来写 UI 应用，而不是引入第三方包、写一些 boilerplate code.

Svelte 非常接近，而且它做到了不需要你学习新的语法，在 JavaScript 里面就实现了这样的效果（目前只是 Reactivity）。

所以无论是对比哪个框架，我个人觉得 Svelte 对我来说最大的吸引力是可以写更少的代码，而且在写代码的时候感觉是符合直觉的，这一点非常重要，我认为 React 并没有做好这一点。我碰到过太多用 React 的朋友同样遇到过这样的问题：

```jsx
function Timer () {

  const [ time, setTime ] = React.useState(0)
  
  React.useEffect(() => {
   	const interval = setInterval(() => {
      setTime(time + 1)
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div>{time}</div>
  )
}
```

这个 `time` 在视图里一直是 1，为什么？谁会在第一次写这样的逻辑的时候就能意识到问题出现在哪里呢？

同样的逻辑在 Svelte 里，就不会有这样的问题（当然在 Vue 里也不会有）：

```html
<script>
  let time = 0
	
	const interval = setInterval(() => {
		time = time + 1
	}, 1000)

	onDestroy(() => {
		clearInterval(interval)
	})
</script>

<div>
  {time}
</div>
```

当然可能有人会说，Randy, 你连在 hooks 里面怎么用 setInterval 都不知道，你一定是 JavaScript 基础不行，回去补补基础吧！对于这样的想法，我只能一笑了之😆。

我没有办法提出一个杀手级的功能吸引没有用过 Svelte 的人来用 Svelte, 我只能说我喜欢 Svelte 是因为她是一个简单的框架，我在用她的时候不用想太多 Why. 

Vue 的缺点和优点基本就是 Svelte 的缺点和优点，但 Svelte 从用法上比 Vue 更简单。

至于有人说，Svelte 生成的代码体积小，我认为这确实是一个优势，不过要注意的是用 Svelte 生成的代码，体积是线性增长的。这是我大概画的一个图，表示项目规模和代码体积的关系：

![](https://gbstatic.djyde.com/uPic/Z9fwZH.png?x-oss-process=style/80)

> 这只是一个大概的趋势，图中的斜率不是一个准确的值。详细在 Github 看相关的讨论 https://github.com/sveltejs/svelte/issues/2546 

## Svelte 的适用场景

生态是技术选型一个很重要的考虑因素，Svelte 显然不是数一数二的选择，基本不用期望 Svelte 有什么现成的组件库。

我认为 Svelte 非常适合用来做活动页。活动页没有很复杂的交互，以渲染和事件绑定为主。我常常想做简单的活动页还用 React 也太委屈自己了吧。

另外一个很好的用法是用 Svelte 写的 UI 组件，可以包装成给不同框架用的组件。Svelte 暴露了足够的 [API](https://svelte.dev/docs#$set) 可以适配到其它框架，比如写一个日历组件，然后分别包装成 React 和 Vue 的版本。

## 结论

我很喜欢 Rich Harris (Svelte 的作者) 的很多想法，在 YouTube 看他的演讲有很大的收获。你可以在下面的延伸链接找到更多有关 Svelte 的我认为不错的视频，十分推荐 Rethinking Reactivity 这个演讲（我在 Bilibili 没有找到搬运，所以只能贴上 YouTube 链接了）。

最后想说的是，学习一个框架或者一个语言，不一定是非要把它用到生产环境才算是有用。我很喜欢看新的技术和学不同的语言，更多地是因为想看看在面对同一个问题的时候，不同的人解决问题的思路是怎么样的，这才是框架和语言真正的魅力。比如说你不一定非要用 [Elm](https://elm-lang.org), 但是你一定能从 Elm 的设计学到点什么。Svelte 也一样 :)

## 延伸链接

- [知乎 - 如何看待 svelte 这个前端框架？](https://www.zhihu.com/question/53150351)
- [Rethinking Reactivity (YouTube)](https://www.youtube.com/watch?v=AdNJ3fydeao)
- [Making setInterval Declarative with React Hooks](https://overreacted.io/making-setinterval-declarative-with-react-hooks/)
- [Compile Svelte in your head](https://lihautan.com/compile-svelte-in-your-head/)
- [Svelte for Sites, React for Apps](https://www.swyx.io/svelte-sites-react-apps/)

