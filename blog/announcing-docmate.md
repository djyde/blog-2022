---
title: Docmate - 一个可以自由部署的文档平台
layout: post
date: 2020-08-15
tags: blog
pin: true
---

建议阅读本文的英文版: [Announcing Docmate](https://docs.docmate.io/5b597b6b-595a-4e88-9350-3694f7754916#/UNLXdip7)

![](https://gbstatic.djyde.com/uPic/MvPTCD.png?x-oss-process=style/80)

对我来说，文档和代码同等重要，如果写出来的代码没有写文档，那么等于没写代码。互联网上有很多文档平台，但有些团队或公司会基于数据安全的考虑不能使用外部平台，只好通过自建的 Gitlab Wiki 或者其它一些开源的 wiki system 解决文档问题，或者用一些静态文档生成工具配合 Gitlab 生成文档。

我调研了一些开源的 wiki system, 发现国外开源的 wiki system 对中文内容并不友好，尤其是在内容组织上，基于 slug 来编排目录对于中文标题来说是非常困难的. 国内的开源 wiki system 相对比较少，所以这些天，作为一个 Side Project, 我尝试按照自己的思路做出来了 [Docmate](https://docmate.io). 

## Docmate 可以做什么

1.编写 Markdown 文档，得到可以分享的 [Docute](https://docute.org/) 或 [Docsify](https://docsify.js.org/) (暂不支持) 文档

2.建立团队，邀请团队成员，共同维护文档

3.文档可以设置为仅团队成员可见

## 如何获得 Docmate

Docmate 分为 Docmate Cloud 和自己部署的 Docmate, 两者功能目前完全相同。你可以按照[官方文档](https://docs.docmate.io/5a7c975f-8438-46fa-b202-81029241975f#/)部署自己的 Docmate, 也可以在 https://docmate.io 可以直接使用 Docmate Cloud. 所有功能暂时不收取费用。

## 谁应该使用 Docmate

1.对数据安全敏感、希望自己部署文档库的团队

2.工具开发者，需要给用户编写使用手册，可以直接使用 Docmate Cloud

## Docmate 的计划

在团队合作中，编写文档是软件工程师很重要的素养，我希望 Docmate 能给需要文档库的团队多一个选择，让更多工程师愿意编写文档。

还有很多计划中的功能尚未完成，包括：

- 支持 Docsify
- 支持更多级目录编排
- 支持一个文档多种语言
- 支持一个文档多个版本
- Docmate Cloud 支持自定义域名
- etc...

另外，在代码结构稳定后，我将开源全部代码。