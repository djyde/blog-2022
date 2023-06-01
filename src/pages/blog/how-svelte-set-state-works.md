---
title: Svelte 的异步更新实现原理
layout: '../../layouts/Post.astro'
tags: blog
date: 2021-04-11
pin: true
---

在 [我对 Svelte 的看法](/blog/svelte) 一文里，我分析了 Svelte 在编译时实现 Reactive 的原理。在这篇文章，我将分析在 Svelte 里更新一个状态 (state) 值后更新到 UI 的这一过程。

阅读本文前，你应该至少：

- 读过 [我对 Svelte 的看法](/blog/svelte) 
- 明白 JavaScript 中的 [事件循环](https://javascript.info/event-loop) 机制

## 原理分析

为了保持简单，先从一个和 Svelte 无关的例子讲起：

```js
// 假设我们正在实现一个 counter, 只有一个 state，就是 count, 它是一个 number:
let count = 0

// 我们可以实现一个 setCount, 来改变 count 的值，顺便执行更新 UI:
function setCount(newVal) {
  count = newVal
  updateUI()
}

function updateUI() {
  console.log("update ui with count:", count)
}

setCount(1) //=> update ui with count: 1
setCount(2) //=> update ui with count: 2
setCount(3) //=> update ui with count: 3
```

这样实现很简单，但是有一个严重的问题：连续的状态更新会连续触发 `updateUI`, 性能会非常糟糕。解决这个问题的方法是：**把同一个事件循环里的所有状态更新造成的 UI 更新统一合并（batch）到一个 microtask 里统一执行。**

```js
// 基于 Promise 实现一个把函数放到 microtask 里的函数
function createMicroTask(fn) {
  Promise.resovle().then(fn);
}

let updateScheduled = false;
function scheduleUpdate() {
  if (!updateScheduled) {
    // 当首次 schedule 时，把 updateUI 放到 microtask 中
    createMicroTask(updateUI)
    updateScheduled = true;
  }
}

function updateUI() {
  updateScheduled = false
  console.log("update ui with count:", count)
}

// 在 setCount 时，不再直接触发 updateUI, 而是 schedule 一个 update
function setCount(newVal) {
  count = newVal
	scheduleUpdate()
}

setCount(1)
setCount(2)
setCount(3)
//=> update ui with count: 3
```

这样，在同一个事件循环里，多个状态更新只会触发一次 UI 更新。

现在假设页面上有一个 `h1`, `updateUI` 中会更新它：

```js
let count = 0
const h1 = document.querySelector('h1')

function updateUI() {
  updateScheduled = false
	h1.innerHTML = `${count}`
}

setCount(1)
setCount(2)
setCount(3)
//=> update ui with count: 3 
```

So far so good. 但是相信不少人年轻的时候曾经写过这样的代码：

```js
setCount(1)
setCount(2)
setCount(3)
console.log(h1.innerHTML) //=> 0
```

在 `setCount(3)` 后， `h1.innerHTML` 竟不是预期中的 3. 仔细一想，当然了，`updateUI` 是在同步代码执行完后，开始执行 microtask 队列的时候才触发的啊。

为了可以在 `setCount` 后拿到更新后正确的值，我们可以把关于 UI 的操作也放到下一个 microtask 才执行。为了方便，我们可以写一个 `tick` 函数：

```js
function tick() {
  return new Promise.resolve()
}

async () => {
  setCount(1)
  setCount(2)
  setCount(3)
  await tick()
  console.log(h1.innerHTML) //=> 3
}
```

## Svelte 的实际做法

回到 Svelte:

```html
<script>
    let count = 0
</script>

<div>
    <span>{count}</span>
    <button on:click={() => count++}>+</button>
    <button on:click={() => count--}>-</button>
</div>
```

这个组件会被编译成一个 fragment （你不需要读懂下面的代码）:

```js
function create_fragment(ctx) {
	let div;
	let span;
	let t0;
	let t1;
	let button0;
	let t3;
	let button1;
	let mounted;
	let dispose;

	return {
		c() {
			div = element("div");
			span = element("span");
			t0 = text(/*count*/ ctx[0]);
			t1 = space();
			button0 = element("button");
			button0.textContent = "+";
			t3 = space();
			button1 = element("button");
			button1.textContent = "-";
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, span);
			append(span, t0);
			append(div, t1);
			append(div, button0);
			append(div, t3);
			append(div, button1);

			if (!mounted) {
				dispose = [
					listen(button0, "click", /*click_handler*/ ctx[1]),
					listen(button1, "click", /*click_handler_1*/ ctx[2])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*count*/ 1) set_data(t0, /*count*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let count = 0;
	const click_handler = () => $$invalidate(0, count++, count);
	const click_handler_1 = () => $$invalidate(0, count--, count);
	return [count, click_handler, click_handler_1];
}

```

不要被吓到，一个 Svelte Fragment 实际上是一个函数返回几个必要的方法：

```js
function createFragment(ctx) {
  return {
    // 创建 DOM 的方法
    c(): {},
    // 把 DOM mount 到节点的方法，以及事件绑定
    m(): {},
    // DOM 节点更新的方法
    p(): {},
		// unmount 的方法
    d() {}
  }
}
```

这里的 `p()`, 就是类似上文提到的 `updateUI`.

而 `instance` 则是 `<script>` 之中定义的变量和一些 event handlers. `$$invalidate(0, count--, count)` 类似上文提到的 `setCount`. 在真实的 Svelte 中整个状态更新的流程简单地来说就是：

1. 用户点击 button, 触发 `$$invalidate(0, count--, count)`
2. 触发 `schedule_update()`, 通知框架这个 fragment 需要被更新（`make_dirty()`），框架会维护一个 `dirty_components` 的数组
3. 同步代码执行完后，开始执行 microtask, 触发更新（`flush`），遍历 `dirty_components`, 触发每一个 component 的 `p()`
