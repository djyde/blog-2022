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
    customData:  `<follow_challenge>
    <feedId>41147805272531968</feedId>
    <userId>41343255271334912</userId>
</follow_challenge>`,
    items: Object.values(posts).map(post => ({
      title: post.frontmatter.title,
      link: post.url,
      content: sanitizeHtml(post.compiledContent()),
      pubDate: post.frontmatter.date,
    }))
  });
}