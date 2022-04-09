---
title: 我是如何监听 APP 价格变动的
layout: post
tags: blog
date: 2016-03-16
categories:
  - Coding
---
## 动机

自从入手了 iPad mini 之后，我剁手入了很多游戏。有些游戏太贵，希望等降价或者限免才入。于是我开始找一些提供降价限免资讯的网站。

找到比较靠谱的是 [少数派](http://sspai.com/) 和 [Appshopper](http://appshopper.com/) ，区别是前者是编辑筛选，后者是程序监听价格变动。Appshopper 还能把 APP 加入 wishlist，当价格出现变动的时候会发邮件到你的邮箱。

Appshopper 在功能上无可挑剔，但是十分蛋疼的是搜索引擎不认中文：

![](http://blogscdn.qiniudn.com/2016-02-16.12.01.23.png)

于是，我有了自己写一个类似的程序的想法。

## 思路

整个程序的思路是：

1. 把 APP 在 App Store 上的 URL 添加到一个订阅列表里
2. 程序通过 URL 分析出 APP 的信息保存到数据库
3. 设定一个定时任务，遍历所有 URL 得到新的 APP 信息然后对比原有价格
4. 当新价格与旧价格不同时，触发事件

## Catchem

我把这个程序起名叫 **Catchem**, 是 Catch them 的意思。因为目标是 selft-host, 不必太在意数据库的性能，这种情况用 serverless 的 database 是最方便的，serverless 首选 SQLite. 逻辑用 JavaScript 写，Express 暴露一些 API (比如添加应用) 给前端调用。前端选 Vue.js。

### 获取 APP 信息

首先我们应该怎么通过 APP 的 URL 获取 APP 的信息，比如 Shadowmatic 的 URL 是 https://itunes.apple.com/cn/app/shadowmatic/id775888026?mt=8 。在我观察页面 DOM 结构的时候，我发现这种 APP 页面是有 [semantic schema](https://www.wikiwand.com/en/Schema_matching) 的。并且提供的内容非常多，包括应用的名字、截屏、评分、价格等等。

于是二话不说写了个 [解析 APP 页面信息的方法](https://github.com/djyde/Catchem/blob/master/utils%2Fappstore.js)，这个方法解析后的整合到的信息是：

```javascript
{ 
  url: 'https://itunes.apple.com/cn/app/shadowmatic/id775888026?mt=8',
  name: [ 'Shadowmatic', 'TRIADA Studio LLC' ],
  screenshot:
   [ 'http://a3.mzstatic.com/us/r30/Purple69/v4/81/bc/33/81bc33fd-5597-8b5e-fed7-bf99927e29f9/screen640x640.jpeg',
     'http://a4.mzstatic.com/us/r30/Purple69/v4/d7/8a/2a/d78a2a8f-7367-e8b5-fb03-22de6523d996/screen640x640.jpeg',
     'http://a3.mzstatic.com/us/r30/Purple49/v4/62/45/0e/62450e8d-193b-6942-7750-a64e86b5c102/screen640x640.jpeg',
     'http://a3.mzstatic.com/us/r30/Purple69/v4/d9/a5/ce/d9a5ce19-e751-083e-d7d5-17fc552b0b10/screen640x640.jpeg',
     'http://a1.mzstatic.com/us/r30/Purple69/v4/89/67/32/896732ba-19d0-d8f1-ed8a-aedd4ca02e61/screen640x640.jpeg',
     'http://a5.mzstatic.com/us/r30/Purple49/v4/e7/3f/25/e73f252d-b0c0-bb00-8dc9-4b67d5b6ff67/screen480x480.jpeg',
     'http://a4.mzstatic.com/us/r30/Purple49/v4/b7/49/97/b74997a5-127b-e1e3-76ab-c8681217f244/screen480x480.jpeg',
     'http://a1.mzstatic.com/us/r30/Purple69/v4/42/6e/e7/426ee72d-7b55-b5ad-cba6-b0b1b79f67f2/screen480x480.jpeg',
     'http://a1.mzstatic.com/us/r30/Purple69/v4/e7/ac/2f/e7ac2f8c-067a-6b28-0cf4-c3621470d6e8/screen480x480.jpeg',
     'http://a1.mzstatic.com/us/r30/Purple49/v4/6e/e1/9f/6ee19f6d-457a-a0ef-f9f5-e3b465b85877/screen480x480.jpeg' ],
  textDescription: '** 2015年Apple Design Award得主 **** App Store. iPhone 年度最佳游戏 2015 **** App Store. iPad 年度创新游戏 2015 **Shadowmatic是一款能够激发想象力的谜题游戏，游戏过程中，你将在聚光灯下旋转抽象物体，在墙上找出可辨认的投影。这款游戏融合了精彩的视觉效果和既轻松又令人爱不释手的游戏玩法。在探索的旅程中，您将惊喜地发现很多超乎想象、变幻无穷的投影。游戏有12个房间，每个房间都有独特的概念设计、环境氛围以及音乐效果。提示。游戏中包含一系列的提示。为能够充分享受游戏的乐趣，我们建议您仅在个别情况下进行求助。音乐。每个房间都有自己独特的音乐编排，形成了独特的氛围和与众不同的感受。佩戴耳机可获得最佳音乐效果，同时，这些音乐还可在iTunes单独购买。-- 12个独特环境中特设的100多个关卡-- 炫酷的画面-- 次级目标-- 非线性关卡进度-- 3D视差效果-- 街机模式** Shadowmatic要求设备为iPhone 3GS及更高版本。-----------------------------------------------------Triada Studio是一个拥有20多年行业经验的计算机图形及动画工作室。Shadowmatic是该公司的首个项目，该项目结合了其丰富的计算机图形经验以及实验性的内部3D引擎。',
  image: 'http://a5.mzstatic.com/us/r30/Purple49/v4/63/2f/f1/632ff1ab-4019-48d1-fdbd-b3b9e1e50e43/icon175x175.png',
  offers: '¥18.00',
  price: '¥18.00',
  applicationCategory: '游戏',
  datePublished: '2016年02月03日',
  softwareVersion: '1.9',
  author: 'TRIADA Studio LLC',
  operatingSystem: '需要 iOS 6.0 或更高版本。与 iPhone、iPad、iPod touch 兼容。',
  aggregateRating: '4.88354     395 份评分\n',
  ratingValue: '4.88354',
  reviewCount: '395 份评分' 
}
```

### 监听任务

```javascript
// https://github.com/djyde/Catchem/blob/master/models%2Fapp.js#L141-L147

function cronJob(){
  check().then(() => console.log('Checking finsihed'))
}

cronJob()

let job = schedule.scheduleJob('0 */2 * * *', () => cronJob())
```

监听任务本质上就是一个 cron job, 定时执行获取所有 APPS 的最新信息并对照原有价格。

### Integrations

对比得出变动后，我希望远不止发送 email。所以我加入了 Integration, 使 Catchem 可以对价格变动作出更灵活的反应。

目前只有 WebHook 这个 Integration, 当检测出价格变动，Catchem 会自动触发这个 hook， 把相关数据 POST 给所提供的 URL, 这样一来，价格变动后的动作取决于 hook 而不是 Catchem 本身。由此你可以写各种 hook，比如用来发送 Slack 信息的 hook，当你想要的 APP 降价后会给你的 Slack 发送信息。

## 表现

![](http://blogscdn.qiniudn.com/2016-02-16.1.35.03.png)

![](http://blogscdn.qiniudn.com/2016-02-16.1.35.11.png)

### 发送微信消息的 hook

由于我经常用微信，如果 Catchem 可以及时把降价信息推送到我微信的话那是极好的。于是我写了一个给自己发送微信消息的 hook，这个 hook 使用测试订阅号的 token。

hook 相关的代码段：https://github.com/djyde/lean-hook/blob/master/routes%2Fwechat.js#L31-L54

我伪造了一个价格来测试：

<img src="http://blogscdn.qiniudn.com/WeChat_1455600212.png" width="320px" />

于是乎，现在只要我心仪的 APP 降价或限免，我的微信就能收到降价信息。

## 开源

整个项目开源在 https://github.com/djyde/Catchem ，大家可以拿来自己用，前提是遵循 MIT License。

会编程非常酷，对吧。