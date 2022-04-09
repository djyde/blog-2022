---
title: 国内自建图床指南
layout: post
date: 2020-03-07
tags: blog
---
[[toc]]

我的博客很长一段时间在使用新浪微博作为图床，自从新浪微博开始防外链，我博客文章很多配图丢失了。我意识到我需要一个稳定可靠的图床，所以开始用阿里云自建一个我自己的图床，目前已经稳定使用了大半年。

我起初以为很难，而且费用不底。但是在这半年，我每个月的 CDN 费用不高（当然这也取决于访问量）。我自诩自己的博客不至于荒废或者没什么人访问，所以对于那些和我的博客规模差不多的独立博客博主，本篇应该算得上是一个十分贴切的参考。

当然，虽然我用的是阿里云，但套用到其它云服务都是一样的，读者可以读完后价比三家再作选择。

> 声明：本文和阿里云没有任何利益关系。

## 本文的目标读者
- 有自建图床的需求，且对国内访问速度有要求的。例如独立博客、独立摄影站，甚至独立播客主于用存放音频文件。

## 云服务做图床的原理
![原理图](https://gbstatic.djyde.com/uPic/Untitled%20%28Draft%29-1%206.jpg?x-oss-process=style/80)

云服务产品有很多，搭建图床只需要关注 OSS 和 CDN. OSS 是对象存储服务，通俗来说就是用来存文件的。OSS 都有对应的域名，文件保存在 OSS 后，可以通过 URL 下载它。

但是直接通过 OSS 下载的成本很高，价格十分昂贵，所以我们需要 CDN 来分发，节约成本。在阿里云，可以把 CDN 绑定到 OSS, 通过 CDN 去访问这个文件时，如果是首次访问，CDN 会从 OSS 取得这个文件，这个过程叫「回源」。之后再访问会直接从 CDN 读取。

## 步骤详解
因为我自己用的是阿里云，所以以阿里云为例（假设你已经注册好帐号）。

### 创建一个 OSS Bucket

一个 Bucket 相当于 OSS 中的一个存储空间，在 [OSS 控制台](https://oss.console.aliyun.com/overview) 点击创建 Bucket:

![创建 Bucket](https://gbstatic.djyde.com/uPic/截屏2020-03-07下午4.30.25.png?x-oss-process=style/80)

填好 Bucket 名称和区域，其它选项按照默认即可。

创建成功后，在 Bucket 的文件管理可以上传文件：

![上传文件](https://gbstatic.djyde.com/uPic/B2l6dV.png?x-oss-process=style/80)

查看上传文件的信息，你可以看到文件有 URL, 但由于在创建 Bucket 的时候，为了防止盗用，我们选的 Bucket 权限为私有，所以从 URL 其实无法访问这个文件：

![文件详情](https://gbstatic.djyde.com/uPic/HUFU2y.png?x-oss-process=style/80)

### 创建 CDN 配置

在 [CDN 控制台](https://cdn.console.aliyun.com/) 进入域名管理，就可以开始配置 CDN 域名。

所以，在创建 CDN 前，你需要买一个域名。这个域名可以随便买个便宜的不主流的，因为没人在意一个图床的域名。

创建域名后，有一个要注意的地方，就是如果你需要国内加速，你的域名必须备案。备案其实是整个自建图床成本最高的一个环节。如果你的博客或者网站域名已经备案，那么可以直接用这个域名分配一个二级域名给 CDN 用。省去再备案的麻烦。

![添加域名](https://gbstatic.djyde.com/uPic/guk3mO.png?x-oss-process=style/80)

比如你的域名是 blabla.com, 那么你的加速域名可以是 static.blabla.com. 

源站信息选「OSS域名」，选中之后会出现一个下拉选择，可以选中刚刚创建的 Bucket 源站：

![源站域名](https://gbstatic.djyde.com/uPic/GPlUFe.png?x-oss-process=style/80)

如果你的网站用 https, 端口选 443.

如果你域名已经备案，就选全球或中国大陆。

#### 设置域名的 CNAME

创建完后，你需要把你域名的 CNAME 指定为提供的值。如果你域名解析也是用阿里云，可以查看 [这篇文档](https://help.aliyun.com/document_detail/27144.html?spm=5176.11785003.0.0.6402142fn9IEPG) 。

![CNAME](https://gbstatic.djyde.com/uPic/j5Vvuk.png?x-oss-process=style/80)

### 开启 HTTPS

![https](https://gbstatic.djyde.com/uPic/TezAat.png?x-oss-process=style/80)

### 开启私有 Bucket 回源

因为前面在创建 Bucket 的时候权限设置为私有，所以需要给 CDN 开启私有 Bucket 回源的权限。

![私有Bucket回源](https://gbstatic.djyde.com/uPic/G0K6M4.png?x-oss-process=style/80)

### 配置 Refer 防盗链

CDN 防盗是有必要的，如果你的图片被别处盗用，会增加不必要的流量。所以推荐设置 Refer 防盗白名单，只对允许指定的域名访问。例如我设置了除了我自己博客以外的一些 RSS Reader 以及 V2EX 可以访问：

![Refer 防盗链](https://gbstatic.djyde.com/uPic/ZST89j.png?x-oss-process=style/80)

## 使用 uPic 方便上传图片

以上的准备都做完后，你已经拥有了一个图床。现在就需要一个方便的工具把图片上传到图床。如果你用 macOS, 我推荐开源的 [uPic](https://github.com/gee1k/uPic) 

![upic](https://gbstatic.djyde.com/uPic/cqSMIR.gif) 

### 配置 uPic

添加阿里云 OSS 配置：

![](https://gbstatic.djyde.com/uPic/AisKxQ.png?x-oss-process=style/80)

这里需要填 AccessKey 和 SecretKey：

![](https://gbstatic.djyde.com/uPic/VkPsCc.png?x-oss-process=style/80)

你可以在 [RAM 控制台](https://ram.console.aliyun.com/users) 创建一个用户，然后创建 AccessKey.

创建后给这个 AccessKey 授 AliyunOSSFullAccess 这个权限：

![](https://gbstatic.djyde.com/uPic/m3KaPP.png?x-oss-process=style/80)

# 我博客的 CDN 用量

![](https://gbstatic.djyde.com/uPic/Pit7QZ.png?x-oss-process=style/80)

从 2019 年 10 月 1 号至 2020 年 3 月 7 号总计 11.28GB. 按流量计费，每 GB 0.24 元，也才几块钱。

# 相关链接

如果你觉得本指南受用，可以通过 [此链接](https://www.aliyun.com/minisite/goods?userCode=n7qobwbd) 注册阿里云。
