
const rss = require("@11ty/eleventy-plugin-rss");
const dayjs = require('dayjs')
const modern = require('eleventy-plugin-modern')
const toc = require('markdown-it-toc-done-right')
module.exports = config => {
  config.addPlugin(modern({
    markdownIt(md) {
      md.use(toc)
    }
  }))
  config.addPlugin(rss) 
  config.addPassthroughCopy("_redirects");
  config.addPassthroughCopy("favicon.ico");

  config.addShortcode("date", (content) => {
    return dayjs(content).format('YYYY/MM/DD')
  })
  return {
    markdownTemplateEngine: false
  };
}