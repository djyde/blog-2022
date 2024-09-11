import rss, { pagesGlobToRssItems } from '@astrojs/rss';
import config from '../config'
import sanitizeHtml from 'sanitize-html';

export async function GET(context) {
  const posts = import.meta.glob('./blog/*.{md,mdx}', {
    eager: true
  })
  return rss({
    title: config.title,
    description: `Randy is blogging about life, tech and music.`,
    site: context.site,
    follow_challenge: {
      feed_id: "41147805272531968",
      user_id: "41343255271334912"
    },
    items: Object.values(posts).map(post => ({
      title: post.frontmatter.title,
      link: post.url,
      content: sanitizeHtml(post.compiledContent()),
      pubDate: post.frontmatter.date,
    }))
  });
}