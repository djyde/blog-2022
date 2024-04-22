---
title: 在 Electron 中使用 SQLite 的最好方式
layout: '../../layouts/Post.astro'
date: 2024-04-22
tags: blog
---

上周刚刚发布了一个用 Electron 的应用 [EpubKit](https://epubkit.app). EpubKit 是一个把网页制作成电子书的工具。在 EpubKit 里，我需要一个数据库来存储内容，最好的选择是 SQLite.

![](https://epubkit.app/intro.png)

但是，由于 Electron 有 renderer 和 main 区分开的机制，所以在 Electron 中使用 SQLite 会非常麻烦 —— SQLite 的执行要在 Main process, 但调用要在 Renderer process. 在 Electron 里，Renderer 和 Main process 之间的通信是通过 IPC (Inter-Process Communication) 实现的。也就是说，我可能需要把每一个有关数据库操作的业务逻辑单独写成一个 IPC 通信的事件，然后在 Renderer 里调用这些事件。

我想要做到的是，我在 Renderer process 中直接调用 ORM, 但实际的执行是在 Main process 中。这样一来我就不需要单独地写很多个 IPC 事件了。

例如：

![](/imgs/191923.png)


万幸的是 [drizzle](https://orm.drizzle.team/) 居然有一个 [HTTP Proxy](https://orm.drizzle.team/docs/get-started-sqlite#http-proxy) 的机制。这个机制能让你所有的 ORM 操作都流到一个地方，在这个地方你能拿到最终生成的 sql 语句，然后你可以自己决定怎么执行这个 sql 语句。

也就是说，我可以在这个 proxy 里，把 sql 语句通过 IPC 发送到 Main process, 然后在 Main process 里执行这个 sql 语句。

接下来我会简单描述一下我在 EpubKit 里是怎么做的。

## 编写 Schema

在你的项目里找一个地方，把 drizzle schema 写下来:

```ts
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable('posts', {
  id: int("id").primaryKey().default(0),
  title: text("title").notNull().default(""),
})
```

## 在 Renderer 里创建一个 drizzle database 实例

根据 [文档](https://orm.drizzle.team/docs/get-started-sqlite#http-proxy), 在创建 drizzle db 实例的时候，可以传入一个函数，这就是 proxy 的本体。我们要做的是在这个 proxy 里，拿到 ORM 最终生成的 sql 语句、执行方法、变量，然后通过 IPC 发送到 Main process.

```ts
export const database = drizzle(async (...args) => {
  try {
    // 通过 IPC 把 SQL 发送到 Main process
    const result = await window.api.execute(...args)
    return {rows: result}
  } catch (e: any) {
    console.error('Error from sqlite proxy server: ', e.response.data)
    return { rows: [] }
  }
}, {
  schema: schema
})
```

这里有一个 `window.api.execute()`, 是怎么来的呢？其实是在 [preload](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload) 进程里面定义然后暴露的, 它的作用就是通过 IPC 发送 sql 语句到 Main process:

```ts
// preload.ts

const api = {
  execute: (...args) => ipcRenderer.invoke('db:execute', ...args),
}
```

也就是说，实际上我们以上做的事情就是，通过 proxy, 把 SQL 语句通过 Main process 里的 `db:execute` handler 最终执行。

## Main process

在 Main process, 我们创建一个 IPC handler:

```ts
// main.ts
ipcMain.handle('db:execute', execute)
```

这里的 `execute` 就是 Main process 里最终执行 SQL 语句的函数。

```tsx
import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '../renderer/src/db/schema'
import fs from 'fs'
import { app } from 'electron'
import path from 'path'

// 初始化 sqlite
const dbPath = '../databse.db'

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const sqlite = new Database(
  dbPath
)

// 创建 drizzle 实例
export const db = drizzle(sqlite, { schema })

// 这里是 execute 方法
export const execute = async (e, sqlstr, params, method) => {
  // 得到执行需要的参数后，用 better-sqlite3 执行
  const result = sqlite.prepare(sqlstr)
  const ret = result[method](...params)
  return toDrizzleResult(ret)
}

function toDrizzleResult(row: Record<string, any>)
function toDrizzleResult(rows: Record<string, any> | Array<Record<string, any>>) {
   if (!rows) {
    return []
  }
  if (Array.isArray(rows)) {
    return rows.map((row) => {
      return Object.keys(row).map((key) => row[key])
    })
  } else {
    return Object.keys(rows).map((key) => rows[key])
  }
}

```

在上面的代码中，我额外实现了一个 `toDrizzleResult` 的方法，是为了把 better-sqlite3 的返回值按照 drizzle 需要的结构返回。

到这里，你就已经可以在 Renderer process 里直接用 drizzle 了：

```tsx
function App(): JSX.Element {

  const [postList, setPosts] = useState([] as any[])

  useEffect(() => {
    database.query.posts.findMany().then(result => {
      setPosts(result)
    })
  }, [])

  return (
    <div>
      <div>
        <form onSubmit={async e => {
          e.preventDefault()

          const formData = new FormData(e.target as HTMLFormElement)
          const title = formData.get('title') as string
          if (title) {
            await database.insert(posts).values({
              id: Math.floor(Math.random() * 1000),
              title
            })

            // refetch
            const result = await database.query.posts.findMany()
            setPosts(result)
          }
        }}>
          <input name="title" type="text" placeholder="title" />
          <button>add</button>
        </form>
      </div>
      {postList.map(post => {
        return (
          <div key={post.id}>
            {post.title}
          </div>
        )
      })}
    </div>
  )
}

export default App
```

但这时候执行，会报错。原因是我们还没有初始化数据库。我们需要在 Main process 里初始化数据库。

首先需要用 drizzle-kit 生成 migration 文件。在 `drizzle.config.ts` 中指定了 migration 文件的地址：

```ts
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite'
} satisfies Config

```

然后写一个 `runMigrations` 方法，用来初始化数据库：

```ts
export const runMigrate = async () => {
  migrate(db, {
    // 在 drizzle.config.ts 里指定的路径
    migrationsFolder: path.join(__dirname, '../../drizzle')
  })
}
```

这个方法需要在 Main process 启动时执行的：

```ts
async function createWindow() {
  // ...

  await runMigrate()
  createWindow()

  //...
}
```

## 实例源码

你可以在 [这里](https://github.com/djyde/electron-drizzle-sqlite-demo) 找到这个示例的完整源码。