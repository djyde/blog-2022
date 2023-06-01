---
title: 我在 UC 做的前端工程化探索
layout: '../../layouts/Post.astro'
date: 2019-09-27
tags: blog
categories:
  - Coding
# cover https://gbstatic.djyde.com/blog/what-i-have-done-at-uc/IMG_185.jpg?x-oss-process=style/cover
pin: true
---

我在 2016 年初加入 UC 的国际业务部，负责为 UC News 搭建运营后台。随着前端团队人数越来越多，我开始推动团队的前端技术栈统一以及前端工程化，开发了一个叫 Cans 用于快速搭建中后台前端应用的框架。直到了 2019 年我离开 UC, Cans 仍然服务于 UC 的国际业务。

本文主要记录了我如何从 UC News 运营后台孵化出这个内部框架，以及其背后的设计理念。虽然 Cans 没有开放源代码。但我认为相比这些工具的源码，那些我在开发这些工具背后的理念、思考，更有被分享的价值。也算作是对我在 UC 工作的一个总结。遂有此文。

---

我们在做 UC News 运营后台的时候，面临的最大问题是：当有新的业务需要我们团队支撑开发一个新运营后台的时候，我们应该怎么做？

这种情况在不断地发生。2017 年我们的 UC News 运营后台趋于成熟，业务需求响应的速度在不断提高。越来越多业务方问我们同一个问题：「我们 xxx 业务想有一个运营后台，我们可以快速接入吗？」

如何让 UC News 运营后台的开发经验可以被快速地复制出去，帮助更多业务？在回答这个问题之前，我想先说说我是怎么设计 UC News 运营后台的前端工程以提高需求响应速度的。

第一点是保证业务开发尽量不被构建环节干扰，只须关注业务逻辑本身。这一点很好保证，因为构建配置基本是不需要更改的。

第二点是降低新页面接入的成本。所谓的成本指的是：

- 页面绑定对应的路由
- 在左侧菜单栏添加菜单项并指向对应的路由

![](https://gbstatic.djyde.com/blog/what-i-have-done-at-uc/IMG_185.JPG?x-oss-process=style/80)

![](https://gbstatic.djyde.com/blog/what-i-have-done-at-uc/IMG_186.JPG?x-oss-process=style/80)

我把这两点变成配置项，可以直接在项目里的 routes 文件配置。这样新页面接入只需配置菜单项的标题和路由，以及对应的页面组件即可。

![](https://gbstatic.djyde.com/blog/what-i-have-done-at-uc/IMG_E5C7A707793A-1.jpeg?x-oss-process=style/80)

第三点是规范项目目录结构。这一点我在 [Egg](https://eggjs.org) 上受到很大的启发。在内部，我们的 Node.js 系统都使用 Egg. 我借鉴 Egg 把项目配置、路由配置、应用启动代码等作了规范：

![](https://gbstatic.djyde.com/blog/what-i-have-done-at-uc/IMG_15A76FD02171-1.jpeg?x-oss-process=style/80)

要用这一套模式赋能更多不断冒出的新业务，首先要做的是统一。

在社区上做开源软件和做公司内部的软件不同，前者通常需要考虑兼容性。处理兼容性的代价是越来越复杂的配置项。但做内部软件，则可以通过「统一」简化配置（甚至无需配置）。例如，两个业务如果分别使用 less 和 sass, 那么在新建项目时，两个业务都要各自配置。相反，如果早已约定所有业务都使用 less, 那么 less 的配置可以固化到统一的工具里，两个业务都不需配置。

首先是技术栈的统一：

- React
- 组件库：Ant.Design
- 构建工具：Webpack
- 语言：TypeScript
- css 预编译：Less

技术栈的选型背后没有什么高深的思量，不过是这一套在 UC News 运营后台经过了考验：Ant.Design 的组件覆盖了 90% 的需求；纯 EcmaScript 写运营后台这种复杂应用是灾难，尤其在新人接手的时候；

**技术栈的统一带来的是构建配置可以全部收敛**，当然除了技术相关的工具，还有业务层面的工具可以统一收敛：

- 构建产物发布到 cdn
- 打点、错误监控的封装
- 网络请求库统一
- i18n 方案统一

做好了这些统一的准备，我开始开发一个叫 Cans 的前端解决方案，它的宗旨是快速搭建中后台类的项目。

## 框架设计
「开箱即用，没有多余的东西」是我从 zeit.co 领会到的软件设计哲学。**如果说一个框架设计得美，那么其实是说它用最简单且符合直觉的接口封装了最复杂的逻辑**。

和 next.js 一样，我希望开发者只要用 `cans start` 这一条命令，就能开始开发一个页面。

![](https://gbstatic.djyde.com/blog/what-i-have-done-at-uc/IMG_5861AF8C8CB1-1.jpeg?x-oss-process=style/80)

在最基本的应用，`cans start` 的背后会做这样的工作：

![](https://gbstatic.djyde.com/blog/what-i-have-done-at-uc/IMG_366CDF4D0EEB-1.jpeg?x-oss-process=style/80)

也就是收集所有运行时将要用到的数据，然后生成一个入口 js 文件。

另外，在构建中还引入了 tree shaking, code splitting (with react-loadable) 等等优化手段。

构建时分析的应用数据，可以在运行时、页面中通过 import app 实例来获取：

![](https://gbstatic.djyde.com/blog/what-i-have-done-at-uc/IMG_4F51DBF1C4FE-1.jpeg?x-oss-process=style/80)

这种注入机制是为了提供扩展性，为了通过这种扩展性建立「生态」，Cans 引入了 addon 机制，以一个打点 addon 为例：

![](https://gbstatic.djyde.com/blog/what-i-have-done-at-uc/IMG_F7A689CCF2ED-1.jpeg?x-oss-process=style/80)

开发者可以在 npm 发布以 `cans-addon-` 为前缀的库贡献生态。

Cans 自带了一些业务常用的 addon:

- cans-addon-cookies
	- 通过`app.cookies.get` 和 `app.cookies.set` 读写 cookies
- cans-addon-storage
	- 通过`app.storage` 做离线数据持久化（如本地数据缓存）
- cans-addon-http
	- http 请求方法封闭

虽然中后台的布局千篇一律，但为了尽量覆盖所有定制化的需求，Cans 也开放了 theme, 开发者可以定制自己的主题，用 `app.theme()` 引入。也可以在 npm 上贡献主题。像我们最常用的运营后台 theme：

![](https://gbstatic.djyde.com/blog/what-i-have-done-at-uc/0653a32a-c51b-4a14-9bb3-a3298c151d87.png?x-oss-process=style/80)

![](https://gbstatic.djyde.com/blog/what-i-have-done-at-uc/IMG_44DD0DC7FA9F-1.jpeg?x-oss-process=style/80)

而在业务层，尽可能将可复用的业务组件封装出去，让更多业务可以使用。如 [antd-data-table](https://github.com/NewbeeFE/antd-data-table) 这个业务组件，就是从 UC News 运营后台独立出来的。

![](https://gbstatic.djyde.com/blog/what-i-have-done-at-uc/IMG_3BCAB3A24856-1.jpeg?x-oss-process=style/80)

以上是 Cans 这个框架的大概模样, 或有其它细节，但不是本文的重点。

在设计这个框架的时候，我无时无刻在考虑的是如何使开发者要写的代码越来越少，同时开放的接口是要符合开发者直觉的。就像「建立一个页面就是创建一个页面文件然后运行 `cans start` 一样简单。

几年前我读了《乔布斯传》，使我对用户体验有了极致的追求，也把这种追求带到了软件开发。这种体验不是一句 Simple is better 就可以说明的。你在同时面对一堆电路板和一台 Macintosh 的时候可能才会体会到所谓的「科技与人文的十字路口」，但，软件设计同样有这样的十字路口，它可能出现在一份完整、漂亮的文档（像 Vue）, 可能出现在一个屏蔽了所有复杂细节 (and it just works!) 的命令（像 next.js）, 可能出现在它的小而美，可以接入到任何地方。

后来蚂蚁金服发布了 Umi, 比 Cans 做得更全面，但两者的思路都如出一辙。我想这证明了这套模式背后的价值所在。最近看到[《Umi 架构、生态和未来》](https://www.yuque.com/preview/yuque/0/2019/pdf/84184/1569318486837-37eeba0d-ebc1-452a-9f6a-a6a02cd27726.pdf) ，让我更确信当初的想法和 Umi 在做的是契合的。推荐各位在下一个项目可以试试 Umi.

记得有一次面试的时候，我提到我主要是做一些前端基建的工作，面试官问我，觉得什么样的前端基建是做得好的基建？我回答说，**如果我做的基建可以让同事少加班，那么我做的基建就是好的**。
