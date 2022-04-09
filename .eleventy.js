
const rss = require("@11ty/eleventy-plugin-rss");
const dayjs = require('dayjs')
const modern = require('eleventy-plugin-modern')
module.exports = config => {
  config.addPlugin(modern)
  config.addPlugin(rss) 
  config.addPassthroughCopy("_redirects");
  config.addShortcode("date", (content) => {
    return dayjs(content).format('YYYY/MM/DD')
  })
  return {
    markdownTemplateEngine: false
  };
}