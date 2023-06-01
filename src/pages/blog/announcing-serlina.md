---
title: "Serlina: 渐进式的 React 服务器渲染框架"
layout: '../../layouts/Post.astro'
date: 2018-08-13
categories:
  - Coding
tags: blog
---

> 副标题: 《可能是最适合 Egg 的 React Serverside-rendering 方案》

上一周周末我花了些时间来完成了一个 React serverside-rendering 框架——[Serlina](https://github.com/djyde/serlina). 在此想通过这篇文章讲讲 Serlina 框架本身，以及我为什么要开发她。

(下文中 React Serverside-rendering 均简称为 "SSR")

## 起因

最直接的起因是我们在内部有一个 React base 的项目的首页希望做服务器渲染，我参考了一些方案，如 Next.js, Fusion.js 等等。我很喜欢 Next.js, 我从他刚发布的时候就在持续关注，我认为他已经是最完美的 SSR 方案。

但是当我试图把 Next.js 接入到我们的服务器端 ([Egg.js](https://eggjs.org) base) 时，我发现 [由于 Next.js 需要控制 http context](https://github.com/eggjs/egg/issues/328), 导致无法兼容 Egg 程序。

我认为 Next.js 的核心应该可以脱离 http context. 只需要完成构建配置、renderToString 这些脏活，然后把渲染后的 HTML String 返回即可。于是我浏览了 Next.js 的代码，试图寻找类似 `nextjs/core` 的东西，然而并没有。Next.js 是一个完整的 Web Framework.

于是我开始设计一个理念是**脱离服务器实现**的 SSR 框架，并取名为 Serlina. 她和 Next.js 拥有同样友好的开发体验，唯一不同之处是，她不关心服务器实现。

## 最简单的例子

安装依赖

```
npm i serlina react react-dom --save
```

创建一个应用目录

```bash
├── index.js
├── page
│   └── page1.js
```

编写一个 React 页面

```js
// page/page1.js

export default () => {
  return <div>Hello Serlina!</div>
}
```

最后是服务器的实现

```js
// index.js

const { Serlina } = require('serlina')
const path = require('path')

const http = require('http')

// 初始化 Serlina
const serlina = new Serlina({
  baseDir: path.resolve(__dirname, './')
})

serlina.prepare()
  .then(() => {
    http.createServer(async (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        if (req.url === '/page1') {
          // 渲染页面
          const rendered = await serlina.render('page1')
          res.write(rendered.string)
        } else {
          res.write('works!')
        }
        res.end()
    }).listen(8090)
  })
  .catch(console.error)
```

通过以上的例子，Serlina 有两个最主要的 API:

- `prepare()` 用于做构建准备
- `render()` 用于渲染 React 页面, 得到 HTML string.

以上的例子也表达了 Serlina 的核心思想——她处理了 React 服务器渲染的一切脏活，然后把处理好的东西交给你自己去渲染到客户端。

这就是「渐进式」的意思：你可以在某些地方用她，也可以在某些地方不用她。你可以只在某个路由里面使用 serlina.render() 去渲染。这有点像是一个模板引擎。

## 在 Egg 中使用

[egg-serlina](https://github.com/serlina-community/egg-serlina)

我之所以认为 Serlina 是最适合 Egg 的 SSR 方案，是因为我认为 Next.js 是最好的 SSR 方案。而 Serlina 把 Next.js 的体验带到了 Egg, 那么她应该就是最适合 Egg 的 SSR 方案。

> 以下内容非 Egg 用户可以跳过。

```
npm i egg-serlina react react-dom --save
```

```js
exports.serlina = {
  map: {
    '/page1': 'page1'
  }
}
```

配置了用 Serlina 渲染的页面后，页面会在 `getInitialProps` 里得到 egg 的 ctx:

```js
// {app_root}/client/page/page1.js

export default class Page1 extends React.Component {

  static async getInitialProps({ ctx }) {
    // ctx is egg `ctx`
    return {
      data: await ctx.service.getData()
    }
  }

  render () {
    return (
      <div>{this.props.data}</div>
    )
  }
}
```

## 常被问到的问题

### 和 Next.js 有什么区别

关于这个问题，上文已经说得很清楚了。另外，Serlina 并不是要取代 Next.js, 而是希望在某些场景，能成为一种合适的选择。
