import compiler from './compiler.js'
import helpers from './helpers'

/**
 * Build a word frequency map from a source text.
 */
test('Extracts "class" and "d" attributes', async () => {
  const options = {
    regex: /class="(.+?)"\s+fill="(.+?)"\s+d="(.+?)"/gi,
    match: function (match) {
      return { class: match[1], fill: match[2], path: match[3]}
    },
    project: function (items) {
      return items.reduce((map, item) => {
        map[item.class] = { fill: item.fill, path: item.path }
        return map
      }, {})
    }
  }

  const stats = await compiler('data/webpack-logo.svg', options)
  const output = stats.toJson().modules[0].source
  const map = helpers.value(output)

  expect(map.back.fill).toBe('#FFF')
  expect(map.outer.fill).toBe('#8ED6FB')
  expect(map.inner.fill).toBe('#1C78C0')
  expect(map.back.path.slice(0, 20)).toBe('M387 0l387 218.9v437')
  expect(map.outer.path.slice(0, 20)).toBe('M704.9 641.7L399.8 8')
  expect(map.inner.path.slice(0, 20)).toBe('M373 649.3L185.4 546')
})
