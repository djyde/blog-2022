---
title: 我常用的 macOS 应用
layout: '../../layouts/Post.astro'
tags: blog
date: 2016-08-06
categories:
  - Life
---



在使用 11' Macbook Air 整整两年后的今天换上了 13' Macbook Pro. 我从零开始重新搭配了我的开发环境和日常使用频率很高的工具，在这里跟大家分享一下。也借这个机会给刚开始接触 macOS 的朋友一个参考。

### Google Chrome

主力浏览器

### ShadowsocksX

我在 macOS 上主要的科学上网工具。

### Moom (付费)

窗口管理工具，可以自定义窗口布局，通过快捷键快速定位当前窗口。

### iTerm

macOS 上最好用的 Terminal Emulator. 如果说系统自带的 Terminal 是 IE, 那 iTerm 就是 Google Chrome.

我喜欢把 iTerm 固定在整个屏幕的上半部分，并设置透明度（可通过 `command + u` 进行 toggle），通过 `command + i` (自定义的 hotkey) 快速显示和隐藏。这样无论我当前正在处理任何事情，我都能快速和终端交流。

### Visual Studio Code

我最喜爱的「代码编辑器」。

### Sublime Text 3

我最喜爱的「代码浏览器」。因为有了 Visual Studio Code, 我用 Sublime 的场景更多是快速浏览个项目的代码。 

### iStat Menus (付费)

在 Menubar 中显示更多有用的数据，比如万年历、电池状态、上传下载速度等。

### 1Password (付费)

密码管理工具。我的每一个账户密码都由 1Password 随机生成和储存，登录网站时只需要 `command + \` 自动填充。既安全又节省时间和记忆负担。

### [oh-my-zsh](https://github.com/robbyrussell/oh-my-zsh)

macOS 自带 zsh, 但是 zsh 需要做很多配置才能用得顺手，这时就需要 oh-my-zsh 帮你做好这些。一条命令安装好后，再通过 ~/.zshrc 添加自己的配置。

### [homebrew](http://brew.sh/)

homebrew 是 macOS 上的 apt-get. 安装命令行程序只需要 `$ brew install`

### proxychains-ng

proxychains 是给命令行使用代理的工具，支持 socks5.

`$ brew install proxychains-ng`

### z

z 是类似 autojump 的目录跳转工具，它会根据你的历史路径，在你只输入目录名的情况下，自动分析你要进入的目录路径。

`$ brew install z`

以上这些工具保证了我最基本的生产效率。