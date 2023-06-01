---
title: 博客改版及 Tailwind CSS 实践
layout: '../../layouts/Post.astro'
tags: blog
date: 2019-11-12
---

如您所见，本博客在前不久进行了微小的改版，改版的目的是做一个可以承载更多元内容的版式，如无意外，在未来的不久，我会增加「摄影」和「乐评」两个新的版块。

但本文想要讨论的是 [Tailwind CSS](https://tailwindcss.com) 这个框架，我用 Tailwind CSS 重写了整个博客的 UI, 减少了 90% 的 CSS 代码，开发时间加起来只有短短数小时，就完成了这个 Mobile First 的 Redesign (如果这也算 design 的话).

传统的 CSS 框架 —— 如 [Bulma](https://bulma.io/) 之流，会预设很多组件样式，例如你只需给 `<button>` 一个 `btn` 的 class name, 你就能得到一个好看的 button. 但 Tailwind 不同，它没有提供任何的预设样式，

所以 Tailwind CSS 声称自己为：

> A utility-first CSS framework for rapidly building custom designs.
>
> Instead of opinionated predesigned components, Tailwind provides low-level utility classes that let you build completely custom designs without ever leaving your HTML.
>
> —— Tailwind CSS 官网

可以看出，Tailwind CSS 的目的不是直接把设计过的东西给你，而是帮助你更快地实现你的设计。我想大家或多或少也有对流行 UI 框架审美疲劳的感受，Tailwind CSS 就是为此而设的。

为了解释 utility-first 的含义，我想了很久 utility 如何翻译比较信达雅，但我没有想到。所以下面我将通过亲身体验来解释 utility-first 这一词。

一直以来我很怕写 CSS, 一是我没有什么设计天赋，我只有审美天赋 —— 我知道什么是好看，但不知道怎么做才会好看。二是写 CSS 很无聊 —— 为了给一个元素定位，我需要给 HTML 元素命名，然后到样式文件写一堆无聊又重复的 CSS, 但又不想用现有框架写好的设计。 最怕的是写响应式的页面，一想到 media query 我就很头疼。

写自己博客的 CSS，时常遇到多个元素的样式有些交集：

```html
<div class="foo">
	字体颜色是黑色，需要加粗且文本居中
</div>
<div class="footer">
	字体颜色是灰色，需要加粗且文本居中
</div>
```

遇到这种情况，我有以下选择：

1. 在 css 文件里给 `.foo` `.footer` 都写上 `font-weight: bold; text-align: center;`
2. 直接给这两个 div 写 inline css `font-weight: bold; text-align: center;`
3. 给 `font-weight: bold; text-align: center;` 单独写成一个 class, 应用到两个 div 上

这些选择我都不喜欢，我更喜欢像这样：

```html
<style>
.text-center {
	text-align: center
}
.font-bold {
	font-weight: bold;
}
</style>

<div class="foo text-center font-bold">
	字体颜色是黑色，需要加粗且文本居中
</div>
<div class="footer text-center font-bold">
	字体颜色是灰色，需要加粗且文本居中
</div>
```

我喜欢像这样把一些常用的 CSS 原子化，这样可以直接通过 class name 复用到任何的元素。这些原子化的通用的 class 我们可以称为 utility. Tailwind CSS 提供的就是一些 utility, 这就是 utility-first 的含义。

在我博客首页有一个这样的导航：

![首页导航](https://gbstatic.djyde.com/blog/%E6%88%AA%E5%B1%8F2019-11-12%E4%B8%8B%E5%8D%887.59.44.png)

HTML 结构如下：

```html
<nav>
  <div>
    <div :key="navItem.title" v-for="navItem in $themeConfig.navs">
      <a class="hover:text-gray-900 text-center" :href="navItem.url">
        <div>{{ navItem.title }}</div>
        <div>{{ navItem.alias }}</div>
      </a>
    </div>
  </div>
</nav>
```

使用 Tailwind CSS, 我不必费神给几个 div 命名，也不用给 div 写一堆 flex 布局，Tailwind CSS 提供了 flex 而已要用到的预设：

```html
<nav>
  <div class="flex flex-col sm:flex-row w-full justify-center p-8">
    <div :key="navItem.title" v-for="navItem in $themeConfig.navs" class="mt-6 sm:mt-0 sm:ml-6 sm:mr-6 text-gray-600">
      <a class="hover:text-gray-900 text-center" :href="navItem.url">
        <div>{{ navItem.title }}</div>
        <div class="text-center text-sm font-serif">{{ navItem.alias.toUpperCase() }}</div>
      </a>
    </div>
  </div>
</nav>
````

如果你没看过 Tailwind CSS 的文档，你可能对这些 class 比较模糊，在这里我按顺序稍作解释：

- `flex`: 声明这是一个 flex
- `flex-col`: 声明 `flex-direction` 为 `column`
- `justify-center`: 声明 `justify-content` 为 `center`
- `p-8`: padding 为 8 个单位
- `mt`: margint-top / `ml`: margin-left / `mr`: margin-right

几个 class 就能完成 flex 布局。

你还会注意到有 `hover:text-gray-900`, 这代表在 hover 的时候，color 为 gray.

这个导航在小屏幕时会变成竖向：

![响应式导航](https://gbstatic.djyde.com/blog/nav-demo.gif)

在上面的代码可以看到，这是通过 `sm:flex-flow` 实现的，意思是当屏幕大小超过 `sm` 时，就用 `flex-flow`. 在 Tailwind CSS 的 [Responsive utility](https://tailwindcss.com/docs/responsive-design) 里，预设了 `sm`, `md`, `lg`, `xl` 几个大小。这个 utility 减少了非常多的响应式设计代码量。

除了自己博客的例子，我特意到 dribbble 随便搜了一个设计来实现：

<img alt="A singup form" class="sm:w-2/3" src="https://gbstatic.djyde.com/blog/%E6%88%AA%E5%B1%8F2019-11-12%E4%B8%8B%E5%8D%887.27.31.png" />

<br />

<iframe height="265" style="width: 100%;" scrolling="no" title="tailwind-signup-form" src="https://codepen.io/djyde-1474473388/embed/RwwYPEv?height=265&theme-id=default&default-tab=html,result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/djyde-1474473388/pen/RwwYPEv'>tailwind-signup-form</a> by Randy
  (<a href='https://codepen.io/djyde-1474473388'>@djyde-1474473388</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

Tailwind CSS 满足了我几点：

1. 可以方便地做到响应式设计
2. 丰富的预设，如字体大小，预设颜色
3. 不用再想 class name

第二点很重要，也是为什么使用 Tailwind CSS 可以很容易做到好看的设计。读过 [Refactoring UI](https://refactoringui.com/book/) 这本小书里面提到，Bad design 有时候是因为间距大小，字体大小，颜色的不统一导致的。如果没有一个固定的 Design system 规定了可以选用的这些参数，设计容易变得混乱。例如一个页面里面如果同时有 12px, 11px, 10px, 9px 大小的字，就会很难看。

Tailwind CSS 的 utility 对大小都有预设，像字体大小有 `text-sm`, `text-md`, `text-lg` 等等，颜色有 `gray`, `pink`, `orange` 等等（当然有可以自行扩展），这其实已经是一个很好的 Design system.

但 Tailwind CSS 毕竟不是一个组件框架，开发现代 Web App 的时候，只有 CSS 显然是不够的。如果选择 Tailwind CSS, 那就代表很有可能很多 (React, Vue) 组件需要自己动手实现。

另一个需要注意的地方是使用 Tailwind CSS 有一定的学习曲线，刚开始不可避免要不断翻文档，但是用她做一个页面之后基本就记住了，我的经验是用了一两天就不太需要看文档了。有点像学习 vim, 如果因为有一定的学习曲线所以错过这么好的东西，那未免太可惜了。

强烈推荐对 UI 设计感兴趣的朋友读一读 [Refactoring UI](https://refactoringui.com/book/), Refactoring UI 的两位作者，一个是 Tailwind CSS 的作者，一个是 Tailwind CSS Design system 的设计。

如果觉得这本书太贵，那至少读一读这篇 [7 Practical Tips for Cheating at Design](https://medium.com/refactoring-ui/7-practical-tips-for-cheating-at-design-40c736799886).