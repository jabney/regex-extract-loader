import compiler from './compiler.js'
import helpers from './helpers'

test('Throws when options.regex isn\'t a RegExp or string', async () => {
  const options = {
    regex: null
  }

  const stats = await compiler('data/poems.txt', options)
  const output = stats.toJson().modules[0].source
  expect(output).toContain('throw new Error')
  expect(output).toContain('Regex Extract Loader')
  expect(output).toContain(
    'option \\"regex\\" must be a string or a RegExp object')
})

test('Throws when options.match isn\'t a function', async () => {
  const options = {
    regex: '.*',
    match: null
  }

  const stats = await compiler('data/poems.txt', options)
  const output = stats.toJson().modules[0].source
  expect(output).toContain('throw new Error')
  expect(output).toContain('Regex Extract Loader')
  expect(output).toContain(
    'option \\"match\\" must be a function')
})

test('Throws when options.project isn\'t a function', async () => {
  const options = {
    regex: '.*',
    project: null
  }

  const stats = await compiler('data/poems.txt', options)
  const output = stats.toJson().modules[0].source
  expect(output).toContain('throw new Error')
  expect(output).toContain('Regex Extract Loader')
  expect(output).toContain(
    'option \\"project\\" must be a function')
})

test('Compiler rejects on error', async () => {
  const options = {}
  const stats = await compiler('data/poems.txt', options)
  // console.log(stats)
  // try {
  // } catch (e) {
  //   expect(e.toString()).toContain(
  //     'WebpackOptionsValidationError: Invalid configuration object')
  // }
})