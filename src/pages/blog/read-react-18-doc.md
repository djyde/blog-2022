---
title: 读 React 18 文档有感
layout: '../../layouts/Post.astro'
tags: blog
date: 2024-01-04
---

昨天 Sixian [提到了](https://twitter.com/noworkforsixian/status/1742574959241908434?s=20) React 的新版官方文档，之前一直没有去读，今天抽空读了其中 [Escape Hatches
](https://react.dev/learn/escape-hatches) 的部分，有一些收获，也有一点感想，在这里简单分享一下。

声明：我经常使用 React, 但我不是 React 的专家，我也不再是一个对技术会进行非常深入探究的人了。所以对于 React 最新的一些 API, 可能对某些人来说是老生常谈，但对我来说是新鲜的。所以本文只是简单分享一下我看到的之前不知道的一些 API. 

![sixian 的 Tweet](</imgs/CleanShot 2024-01-04 at 17.41.15@2x.png>)

## 跑两次的 useEffect

开发环境 useEffect 跑两次是故意的，是为了帮助开发者在开发环境中发现你是否正确地给你的 effect 做了 teardown. 
> The right question isn’t “how to run an Effect once”, but “how to fix my Effect so that it works after remounting”. 

如果你的代码因为 useEffect 跑两次所以出问题，很可能你用错了 useEffect.

![Alt text](</imgs/CleanShot 2024-01-04 at 16.30.26@2x.png>)

讨论这样的特性是否是一种傲慢对我来说意义不大，重要的是我理解了其动机。

## flushSync API

React 有一个 flushSync API, 可以强制 update DOM. 在以前我们一般是把希望在 DOM 更新后才执行的代码放在一个 setTimeout 里.

![Alt text](</imgs/CleanShot 2024-01-04 at 16.23.10@2x.png>)

## 如果想重置一个 Component, 直接给它一个新的 key

如果希望某个 component 的 props 被改变的时候做一些重置，应该直接给这个 component 赋一个新的 key, 使 React 直接重建整个 DOM, 而不是用 useEffect 手动做重置工作。

其实以前我也经常这么干，比如 Modal 在关闭和打开后重置里面 Form 的值，我会直接给 Modal 一个新的 key. 一直不知道这是否是一个 best practice, 现在得到了官方认证。

![Alt text](</imgs/CleanShot 2024-01-04 at 16.51.16@2x.png>)

## useSyncExternalStore

这是一个我不知道的 Hook, 看起来很适合用于把别的库移植到 React 时使用，而且它对 SSR 非常友好。

## 一些感想

很多人觉得 React 繁琐，心智负担特别大，我也这么认为。但我一直觉得，这不是 React 本身的问题，而是 JavaScript 的问题。

React 是一个特别函数式编程思维的框架，但很可惜，JavaScript 只是一个半吊子的函数式编程语言，它只是在被设计的时候学了一点 Lisp 的皮毛，也提供了一点点函数式的 API, 但它没有很多真正的函数式编程语言应该有的基本特性，才导致了我们要写额外的代码来解决一些问题。

例如，[Memoization](https://www.wikiwand.com/en/Memoization) 在一些函数式编程语言里是标配，但 JavaScript 里没有，所以你需要给函数手动套一层 `React.useCallback`.

函数式编程语言里, Immutable 也是标配，而在 JavaScript 里，需要用 Immer 之类的第三方库。

所以这就是为什么在多年前我很看好 ReasonML (现在叫 [ReScript](https://rescript-lang.org/)) 这个语言，因为它本身就是真正的函数式编程语言（它是基于 OCaml 的 JavaScript 方言），你会发现，用它来写 React 是多么舒服的一件事，因为语言本身就提供了你在 JavaScript 里需要调 API 才能实现的功能。有趣的是，React 在刚开始设计的时候用的就是 OCaml.

成也 JavaScript,  败也 JavaScript.