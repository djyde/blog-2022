---
title: 用 Code Snippet 提高开发效率
layout: post
date: 2020-12-25
tags: blog
pin: true
---

写代码的时候总会遇到一些相同的但是反复要写的代码，比方说每次写一个 React Component, 都要这样写一遍：

```js
function App () {
  return (
    <>
    </>
  )
}

export default App
```

这时候很适合把他写成 Code Snippet, 让编辑器帮我去生成。每个编辑器或 IDE 都有 Snippet 功能，我自己常用 VS Code, 所以我会去写一些 VS Code 的 Snippet 文件。

> VS Code code snippet 的配置入口：
>
> ![VS Code code snippet 配置入口](https://gbstatic.djyde.com/uPic/cXvY0y.png?x-oss-process=style/80)

VS Code code snippet 配置是一个 JSON 文件，按照[它的语法](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_creating-your-own-snippets), 我可以这样去实现一个上面提到的，用于生成 React Component 代码的 snippet:

```json
{
  "fc": {
    "scope": "javascript,typescript,typescriptreact",
    "description": "React Function Component",
    "body": [
      "function ${componentName} () {",
      "  return (",
      "    <>",
      "    </>",
      "  )",
      "}",
      "",
      "export default ${componentName}"
    ],
    "prefix": "fc"
  }
}
```

然后我在编辑器里只要输入 `fc`, 就可以选择这个 snippet:

![](https://gbstatic.djyde.com/uPic/8hdVZE.gif)

用 Snippet 很方便，但是编写这个 Snippet 体验非常糟糕，因为需要把代码块一行一行地转换成字符串，空格也要自己加。

我想这也是我身边这么少人用 Snippet 的原因，我自己也深受其害。为了方便管理我的 Snippets 以及方便地导出为 VS Code code-snippets 文件，我写了个程序，可以让我把每个 snippet 写到单独的文件里，然后输出 VS Code code-snippets 格式的 JSON.

## 用 snp 管理 snippets

> 目前只适用于 VS Code

这个程序叫 `snp`, 你可以用 curl 直接安装这个程序：

```bash
$ curl -sf https://gobinaries.com/djyde/snp | sh
```

于是，我现在管理 snippets 非常轻松。创建一个目录，用来存放这些 snippets, 

```bash
$ mkdir snippets
$ cd snippets
```

然后我就可以创建我的 snippets, 以触发的词作为文件名，`.snp` 作为后缀。例如我创建一个输入 `fc` 就会触发的 snippet:

```bash
$ touch fc.snp
```

在 `.snp` 文件里，你可以按照 [snippet 语法](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax) 直接写你需要生成的代码，然后在文件的头部加上必要的信息：

```js
---
scope: javascript,typescript,typescriptreact
description: React Function Component
---

function ${componentName} () {
  return (
    <>
    </>
  )
}

export default ${componentName}
```

> `scope` 指定了这个 snippet 在哪个语言环境生效，具体可以参照 [VS Code 的文档](https://code.visualstudio.com/docs/editor/userdefinedsnippets)

然后执行：

```bash
$ snp -p
```

你会看到命令输出了一段 JSON, 你可以把这段 JSON 写入文件里:

```bash
$ snp -p > my-snippets.code-snippets
```

然后手动复制到 VS Code 的 snippets 文件里。

> 当然，如果你嫌每次更新都要手动复制很麻烦，你可以直接运行：
>
> ```bash
> $ snp -u
> ```
>
> 这样 snippets 会自动写到 VS Code 的目录里，你不需要手动更新。

这样就可以像我一样，在一个文件夹里统一管理 snippets, 用 snp 同步到 VS Code,还能上传到 GitHub:

![我的 snippets 目录](https://gbstatic.djyde.com/uPic/s6ER6t.png?x-oss-process=style/80)

![](https://gbstatic.djyde.com/uPic/fveMJq.gif)

<br />

---

<br />

- snp 是一个开源项目：[https://github.com/djyde/snp](https://github.com/djyde/snp). 用 Go 编写。
- 这是我的 snippets 仓库：[https://github.com/djyde/snippets](https://github.com/djyde/snippets)