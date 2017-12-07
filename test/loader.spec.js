import compiler from './compiler.js'
import helpers from './helpers'

test('Extracts text from title tag', async () => {
  const options = {
    regex: /<title>.+<\/title>/i,
  }

  const stats = await compiler('data/webpack-logo.svg', options)
  const output = stats.toJson().modules[0].source
  const match = helpers.value(output)

  expect(match[0]).toBe('<title>webpack-logo</title>')
})

test('Extracts text as group from title tag', async () => {
  const options = {
    regex: /<title>(.+)<\/title>/i,
  }

  const stats = await compiler('data/webpack-logo.svg', options)
  const output = stats.toJson().modules[0].source
  const match = helpers.value(output)

  expect(match[0]).toBe('<title>webpack-logo</title>')
  expect(match[1]).toBe('webpack-logo')
})

test('Extracts path lines from svg', async () => {
  const options = {
    regex: /<path.+\/>/gi,
  }

  const stats = await compiler('data/webpack-logo.svg', options)
  const output = stats.toJson().modules[0].source
  const matches = helpers.value(output)

  expect(matches.length).toBe(3)
  matches.forEach((match) => {
    expect(match.length).toBe(1)
    expect(match[0]).toContain('<path class=')
  })
})

test('Extracts class and fill from path lines', async () => {
  const options = {
    regex: /<path class="(\w+)" fill="(.+?)".+\/>/gi,
  }

  const stats = await compiler('data/webpack-logo.svg', options)
  const output = stats.toJson().modules[0].source
  const matches = helpers.value(output)

  expect(matches.length).toBe(3)
  expect(matches[0][1]).toBe('back')
  expect(matches[1][1]).toBe('outer')
  expect(matches[2][1]).toBe('inner')
  expect(matches[0][2]).toBe('#FFF')
  expect(matches[1][2]).toBe('#8ED6FB')
  expect(matches[2][2]).toBe('#1C78C0')
})
