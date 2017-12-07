import compiler from './compiler.js'
import helpers from './helpers'

/**
 * Build a word frequency map from a source text.
 */
test('Builds word frequency map (match, project)', async () => {
  // Set up loader options.
  const options = {
    regex: /\b\w+\b/gi,
    // Match gets called for every match (must return a value).
    match: function (match) {
      return match[0]
    },
    // Project gets called after all matches are found (must return a value).
    project: function (matches) {
      return matches.reduce((map, word) => {
        const lcWord = word.toLowerCase()
        map[lcWord] = (map[lcWord] || 0) + 1
        return map
      }, {})
    }
  }

  const stats = await compiler('data/poems.txt', options)
  const output = stats.toJson().modules[0].source
  const map = helpers.value(output)

  expect(map['all']).toBe(4)
  expect(map['elven']).toBe(1)
  expect(map['dwarf']).toBe(1)
  expect(map['men']).toBe(1)
  expect(map['king']).toBe(1)
  expect(map['road']).toBe(3)
  expect(map['one']).toBe(4)
  expect(map['ring']).toBe(3)
  expect(map['mordor']).toBe(2)
  expect(map['shadows']).toBe(3)
})

/**
 * Parse key/value pairs from a source in "key=value" form.
 */
test('Parses key/value pairs (project)', async () => {
  // Set up loader options.
  const options = {
    regex: '^(.+)=(.+)$',
    flags: 'mg',
    // Match gets called for every match (must return a value).
    match: function (match) {
      return { key: match[1], value: match[2] }
    },
    // Project gets called after all matches are found (must return a value).
    project: function (result) {
      return result.reduce((map, item) => {
        try {
          map[item.key] = JSON.parse(item.value)
        } catch (e) {
          map[item.key] = item.value
        }
        return map
      }, {})
    }
  }

  const stats = await compiler('data/keyvals.txt', options)
  const output = stats.toJson().modules[0].source
  const map = helpers.value(output)

  expect(map.name).toBe('Nebula')
  expect(map.rank).toBe(10)
  expect(map.attributes.length).toBe(5)
  expect(map.attributes[4]).toBe('nebulicious')
})
