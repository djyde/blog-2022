---
title: 现代的 React
layout: post
tags: blog
categories:
  - Coding
date: 2019-03-08
---

我一直很想写一本关于 React 的小书，因为我看到很多刚入门前端或刚开始使用 React 的开发者，对 React 有一些误解。也许是因为 JSX, 让很多人误以为 React 是一种黑魔法 —— 竟然能在 JS 文件里写 HTML! 还有很多围绕 React 的问题，像「状态管理」，就让很多人焦头烂额了。也正是因为 JSX, 让很多人依然用模板的思维去写 React.

但实际上，如果你理解 React 解决问题的方式的本质，你会发现 React 没有那么难。我写这本小书的主要目的，就是想让还觉得 React 难用的开发者们知道，React 很简单。

React 是一种构建 UI 的思想，关于 [React 的思想](https://github.com/reactjs/react-basic)，我觉得已经是老生常谈了。在所有从本质层面讲解 React 的文章或书里，总不免提到这样的公式：

```
UI = f(state)
```

意思就是，UI 是基于状态的一个函数返回值。这也是 Sebastian (React 设计者) 设想的理想状态。直到当我们真正拿 React 来写 UI 的时候，却发现我们很难遵循这个公式——组件的内部状态需要依靠 Class. 而写 Class 是导致 React 使用者困惑的重要原因。

用 Class 实现内部状态同时也带来了另一个问题——我们怎么复用这些逻辑？常见的做法就是使用 [Function as Child Component](https://medium.com/merrickchristensen/function-as-child-components-5f3920a9ace9).

先不说 Function as Child Component 容不容易被初学者理解, 光是它带来的嵌套问题，就已经足够我们烦恼了——可以想像我们只能用 callback 写 JavaScript 的时代。

```js
const MyForm = () => (
  <DataFetcher>
    {data => (
      <Actions>
        {actions => (
          <Translations>
            {translations => (
              <Styles>
                {styles => (
                  <form styles={styles}>
                    <input type="text" value={data.value} />
                    <button onClick={actions.submit}>
                      {translations.submitText}
                    </button>
                  </form>
                )}
              </Styles>
            )}
          </Translations>
        )}
      </Actions>
    )}
  </DataFetcher>
)
```

还有，我们应该怎么解决组件之间的状态共享问题？Redux? MobX? 还是其它状态管理工具？

React 应该是简单直接的，但越来越多人「谈 React 色变」，正是由于以上的（或者以上没有提到的）问题，认为 React 复杂，难学。很多关于 React 的文章和书都花了不少篇幅来介绍这些解决问题的「设计模式」。

但随着 React 的不断迭代，有了 Context API, 有了 Hooks API, 一切都变得简单了。我们可以抛开种种「模式」，真正用「函数式」的思维去构建 UI. 这也是标题想表达的意思 —— 我们应该使用「现代」的 React, 去避免不必要的学习成本。

和著名的《设计模式》一样，很多「设计模式」是为了弥补面向对象的缺陷而出现的。React 通过自身 API 的完善，使我们能少写更多不必要的代码，少学习很多不必要的「模式」。

我的目的不是在教你怎么用各种 React 相关的库，而是想让读者知道，我们在解决什么样的问题？我们解决问题的方法是什么？别人的库是怎么解决的？

这个专栏会陆续发布循序渐进的文章。如果你完全没有接触过 React, 那么读完这个专栏后，你就完全能驾驭了 React 了，而且是用优雅的方式去驾驭他。你会发现，**写 React 就是写函数那么简单，只不过这个函数的返回值是 Virtual DOM 罢了**。

初学者们，请不必因为不懂所谓的「模式」而感到惭愧，尽情享受技术发展带来的红利吧。

---

这是我在小专栏付费连载的[《Modern React》](https://xiaozhuanlan.com/modern-react)的前言，目前正在限时打折，有兴趣的朋友可以订阅。

之所以选择连载的方式，是因为我想要通过读者的反馈去决定我接下来连载的内容。欢迎读者们积极地来信反馈。