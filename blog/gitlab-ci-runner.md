---
title: 搭建自己的 Gitlab CI Runner
layout: post
tags: blog
categories:
  - Coding
date: 2017-04-20
---

[[toc]]

> 假定你已经有一台可用的，可联网的机器

## Preface

这篇文章将介绍如何使用自己的机器来搭建用于 Gitlab CI 的 runner.  在搭建自己的 CI Runner 之前，需要先明确一些概念：

### CI (Continuous Integration)

CI 的全称是 Continuous Integration (持续集成)，是 extreme programming (极限编程) 的一部分。我们常用 CI 来做一些自动化工作，这种自动化工作会运行在一台集中的机器上，比如程序的打包，单元测试，部署等。这种构建方式避免了了打包环境差异引动的错误，并且通过 Gitlab 的 hook, 在代码提交的各个环节自动地完成一系列的构建工作。

### CI Runner

和第三方的 Travis CI, CircleCI 不同，**Gitlab 本身并不提供机器**，只提供一个注册机器的接口。这些机器用于运行构建逻辑，在 Gitlab 中被称为 Runner.

![runners](https://gbstatic.djyde.com/assets/006tNc79gy1fet5ffxwglj31ac0y2wj8.jpg)

## Gitlab Runner 环境

在这里直接使用 Gitlab Runner 的官方 docker image:

### 安装 Docker

```bash
curl -sSL https://get.daocloud.io/docker | sh
```

### 拉取 gitlab-runner 镜像

因为众所周知的原因，国内 pull docker 镜像非常不稳定，所以在这里用 Daocloud 提供的镜像：

```bash
curl -sSL https://get.daocloud.io/daotools/set_mirror.sh | sh -s http://718dbf2d.m.daocloud.io

sudo service docker restart
```

拉取镜像：

```bash
sudo docker pull gitlab/gitlab-runner:latest
```

### 添加 gitlab-runner container

```bash
sudo docker run -d --name gitlab-runner --restart always \
  -v /srv/gitlab-runner/config:/etc/gitlab-runner \
  -v /var/run/docker.sock:/var/run/docker.sock \
  gitlab/gitlab-runner:latest
```

### 配置用于 runner 的 docker image

> 虽然 Gitlab 支持多种 runner 运行方式，但本文建议使用 docker，因为使用 docker 较为灵活，一台机器可以创建多个 docker images 分别为不同的项目进行 CI, 但仍能保持环境隔离。

配置 Docker image 最简单的方式是写 `Dockerfile`, 比如可以用 Node.js 官方的 Docker image:

```dockerfile
# Dockerfile
FROM node:7.9.0
```

由于每个业务总会有各自的环境要求，比如应用依赖底层的库。这时可以通过 `Dockerfile` 配置：

```dockerfile
# Dockerfile
FROM node:7.9.0

RUN apt-get update && apt-get install -y \
	package-foo
	package-bar
```

### 构建 Docker Image

写好 `Dockerfile` 后，需要把它构建成 Image:

```bash
ls
# Dockerfile

docker build -t IMAGE_NAME .
```

Build 完后，通过 `sudo docker image ls` 查看 image 状态。

### 注册 Runner

接下来就可以注册 Runner:

```bash
sudo docker exec -it gitlab-runner gitlab-ci-multi-runner register
```

程序会要求你填写相关的信息，这些信息可以从 Gitlab 项目的 `Settings -> Runners` 页面中找到：

![Gitlab runner info](https://gbstatic.djyde.com/assets/006tNc79gy1fetavn7r0lj319u0os78u.jpg)

```bash
Please enter the gitlab-ci coordinator URL:
# http://gitlab.alibaba-inc.com/ci

Please enter the gitlab-ci token for this runner:
# 项目的 token

Please enter the gitlab-ci description for this runner:
# Runner 的 description

Please enter the gitlab-ci tags for this runner (comma separated):
# Runner 的 tag

Whether to run untagged builds [true/false]:
# true

Please enter the executor: docker, parallels, shell, kubernetes, docker-ssh, ssh, virtualbox, docker+machine, docker-ssh+machine:
# docker

Please enter the default Docker image (e.g. ruby:2.1):
# 填入构建 Docker image 时填写的 image 名称
```

这时 runner 就会出现在 `runners` 页面：

![](https://gbstatic.djyde.com/assets/006tNc79gy1fetbnh1e12j310008qdgs.jpg)

## FAQ

### CI 运行时出现 `ERROR: Job failed: API error (404): repository xxx not found: does not exist or no pull access`

这是由于 Gitlab 会默认从远程拉取 image，而我们的 image 是在本地构建的，所以需要对 gitlab-runner 进行配置，把 `pull_policy` 设置为 `if-not-present` 或 `never`.

```bash
# 进入 gitlab-runner 的 bash 环境
sudo docker exec -it gitlab-runner bash

# 编辑 config.toml
nano /etc/gitlab-runner/config.toml
```

编辑 `config.toml` 中对应的 runner:

```diff
[[runners]]
  name = ""
  url = ""
  token = ""
  executor = "docker"
  [runners.docker]
    tls_verify = false
    image = "nb-node"
    privileged = false
    disable_cache = false
    volumes = ["/cache"]
+   pull_policy = "if-not-present"
  [runners.cache]
```

## 延伸阅读

- [Run GitLab Runner in a container](https://docs.gitlab.com/runner/install/docker.html)
- [配置 Docker 加速器](https://www.daocloud.io/mirror#accelerator-doc)
- [Best practices for writing Dockerfiles](https://docs.docker.com/engine/userguide/eng-image/dockerfile_best-practices/)
- [Using the if-not-present pull policy](https://docs.gitlab.com/runner/executors/docker.html#using-the-if-not-present-pull-policy)