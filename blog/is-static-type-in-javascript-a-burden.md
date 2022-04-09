---
title: 静态类型在 JavaScript 中是一种负担吗？
layout: post
tags: blog
date: 2016-09-29
categories:
  - Coding
---

最近我在公司的项目中遇到很多由于类型不匹配所导致的不可预估的问题。比如说，我们的程序产生了一个纯数字的 unique id, 存到数据库中被识别为 `number` 类型，但是客户端需要的是字符串，导致一条数据在没有办法在客户端正常显示。

我**年轻**的时候曾经是一位动态类型的忠实拥趸，因为动态类型方便、自由。假设在我需要编写一段为我服务的小程序时，如果 runtime 强制需要我去做一些向上向下转型的工作，恐怕我会崩溃。

但是，在享受自由的同时，我们却很容易写出这样的程序：

```javascript
// config.js
export const appId = 123456
```

```javascript
// utils.js
import { appId } from './config.js'
export function generateSignString (salt) {
  return appId + salt
}
```

这是一个用于生成签名字符串的函数，从逻辑上看，这段代码没有问题。但是，当另一个对这个函数内部实现不了解的开发人员使用它时，会返回意想不到的结果：

```javascript
import { generateSignString } from './utils'
const salt = new Date().getTime()
const signStr = generateSignString(salt)
```

使用者希望把 `timestamp` 用作 `salt`，但是 `signStr` 并不是意料中的由 timestamp 和 appId 拼接而成的 signString, 而是 `appId` 和 `timestamp` 相加的运算结果。而这种错误是**在编译时无法感知的**。

然而，如果我们用静态类型的 TypeScript 做同样的事情：

```javascript
const APPID = 123456
function generateSignString (salt: string): string {
  return APPID + salt
}

const salt = new Date().getTime()
const signStr = generateSignString(salt)
// Error: [ts] Argument of type 'number' is not assignable to parameter of type 'string'.
```

在编译时，就会抛出类型错误的提示，这时就会知道，你的 `salt` 应该用一个 `toString()` 来转换成字符串。

### 类型检查是一种负担吗？

我认为不是。起码在**构建大规模的应用程序**时，静态类型会帮助你避免大多数的运行时错误。

而 code base 并不是衡量应用程序规模的唯一指标。只要符合以下某种情况，就认为这个程序是大规模的：

1. code base 很大
2. 超过 2 人维护的程序
3. 被多人依赖的模块

在以上这些情况下，类型声明变得尤为重要。你可能认为你能记住变量是什么类型，但在程序的世界里生存的不仅仅是字面量。

在团队共同维护代码的时候，如果没有类型声明，你绝对有可能传入一个非预期的参数。所以，**类型声明是开发者与开发者之间的传达信息的过程**——我要的是什么类型，你就只能给我什么类型。

**类型声明也是开发者给编辑器传达信息的手段**。只有显示的类型声明，编辑器和 IDE 才能判断函数中的形参应该有怎样的行为，才能给开发者正确的代码提示，才能安全地为你进行 Refact.

![](https://gbstatic.djyde.com/blog/-----2016-09-29---6.21.31.png)

### 静态类型的 JavaScript

JavaScript 虽然是一门面向对象的语言，但相对于 C++, Java 这类语言来说，它的抽象能力很弱。在构建大规模的 JavaScript 应用程序时，我常常怀念写 Java (Android) 时可以写 `interface`, 可以写 `abstract`. 在编写 JavaScript 程序中，很难舒服地运用一些设计模式。

> We designed TypeScript to meet the needs of the JavaScript programming teams that build and maintain large JavaScript programs.
> —— <cite>TypeScript Language Specification</cite>

TypeScript 引入了 `Interface`, `Enum`, `Generic`, `abstract class` 等等，这些表达能力正是在构建大规模 JavaScript 程序时所缺失的。不是说没有 TypeScript,  ECMAScript 就不能实现这些，而是 TypeScript 在代码层面赋予了这些约定。

比如，用 TypeScript 实现 Singleton:

![](https://gbstatic.djyde.com/blog/-----2016-09-29---8.34.22.png)

理论上，被编译出来的 ECMAScript 代码照样可以顺利地 `new Person()`, 但 TypeScript 会在编译时提醒你，这个类不应该被实例化。

我不打算在本文对 TypeScript 作出详细的指南，我只希望大家可以认识到，**严谨的类型检查和面向对象表达能力对代码的健壮性和可维护性有很大的正面作用**。ECMAScript 是一门自由灵活的语言，但绝不代表我们就应该为这种灵活承担过高的出错概率。况且，TypeScript 在严格类型检查的同时，又保留了 ECMAScript 的自由性（你甚至可以用 `any` 类型来规避类型检查）。

我永远认为使用没有类型验证的  JavaScript 会让我快乐，无论她有多大的坑。我仍然可以用她愉快地写脚本抢这个抢那个，用她来写各种各样的 bot，无须考虑类型转换。但当我用她来写一些不是为了让我快乐的程序的时候，我希望她在运行时不要跑偏，还希望她长得像真正的 OOP 。

静态类型的 JavaScript 就像开始做手机后的罗永浩，你能看出他们的妥协，他们本不是这样。但他们是真正要上场合了，才不得不这样，即使他们根本不是你喜欢的样子。