const dayjs = require('dayjs')
const modern = require('eleventy-plugin-modern')
module.exports = config => {
  config.addPlugin(modern)
  config.addShortcode("date", (content) => {
    return dayjs(content).format('YYYY/MM/DD')
  })
  return {
    markdownTemplateEngine: false
  };
}