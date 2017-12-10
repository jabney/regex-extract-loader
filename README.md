regex-extract-loader
====================
[![Build Status](https://travis-ci.org/jabney/regex-extract-loader.svg?branch=master)](https://travis-ci.org/jabney/regex-extract-loader)

Use regex to extract values from source files and make them available in code, or transform a source file into another form.

The `regex-extract-loader` takes a file's content as input, runs it against a user-supplied regular expression, and returns match information as its output by default. If the `g` (global) flag is not used, the result is a single RegExp match object. If the `g` flag is used, the resulit is a list of RegExp match objects. The output can be transformed, either on a per-match basis or at the end of the entire operation, using the `match` and/or `project` functions.

## Example usage
Extract the attribute data from path tags in an svg file.

### some.source.svg (input)
```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3046.7 875.7">
  <title>webpack-logo</title>
  <path class="back" fill="#FFF" d="M387 0l387 218.9v437.9L387..."/>
  <path class="outer" fill="#8ED6FB" d="M704.9 641.7L399.8 814..."/>
  <path class="inner" fill="#1C78C0" d="M373 649.3L185.4 546...."/>
</svg>
```

### webpack.config.js (config)
```javascript
module.exports = {
  ...,
  module: {
    rules: [{
      test: /\.source.svg$/,
      use: {
        loader: 'regex-extract-loader',
        options: {
          regex: 'path.+\\bd="(.+?)"',  // can also be a RegExp object (required)
          flags: 'g'                    // ignored if a RegExp is used (optional)
          match: (match) => match,      // called for each match (optional)
          project: (result) => result   // called after processing (optional)
        }
      }
    }]
  }
}
```

### some.module.js (output)
```javascript
const pathData = require('./assets/some.source.svg')

  // Because the global flag was used, the result is an array of RegExp match object arrays.
  [
    // First match
    [
      // 0: the entire match
      'path class="back" fill="#FFF" d="M387 0l387 218.9v437.9L387..."',
      // 1: the first (and only) capture group
      'M387 0l387 218.9v437.9L387...',
      // index: the index of the match in the input
      index: 101,
      // input: the entire input string
      input: '<svg xmlns="http://www.w3.org/2000/svg" viewBox=...>...</svg>'
    ],
    // Second match
    [
      'path class="outer" fill="#8ED6FB" d="M704.9 641.7L399.8 814..."',
      'M704.9 641.7L399.8 814...',
      index: 170,
      input: '<svg xmlns="http://www.w3.org/2000/svg" viewBox=...>...</svg>'
    ],
    // Third match
    [
      'path class="inner" fill="#1C78C0" d="M373 649.3L185.4 546...."',
      'M373 649.3L185.4 546....',
      index: 239,
      input: '<svg xmlns="http://www.w3.org/2000/svg" viewBox=...>...</svg>'
    ]
  ]
```

## Typescript
Using `import` instead of `require` may cause issues when using Typescript to import text files. In this case, include a `declarations.d.ts` file in your project:

### declarations.d.ts
```typescript
declare module '*.svg' {
  const svg: any
  export default svg
}

declare module '*.txt' {
  const txt: any
  export default txt
}
```

Then you should be able to import the file:
```typescript
import pathData from './source.svg'
import text from './somefile.txt'
```

## Options object

```javascript
options: {
  regex: 'path.+\\bd="(.+?)"',
  flags: 'g',
  match: (match) => match,
  project: (result) => result
}
```

`regex (string|RegExp)` **(required)** can be a string or RegExp object. For strings make sure escape characters use a double backslash, e.g., `\\w+`.

`flags (string)` **(optional)** used if `regex` is a string, otherwise ignored. If `g` (global) is specified either in the `flags` property or in the supplied `regex`, an array of RegExp match objects is returned. Otherwise a single RegExp match object is returned.

`match (function)` **(optional)** called for each match. Can be used to modify each match object. Must return a value if used.

`project (function)` **(optional)** called at the end of processing. Can be used to modify the final result. Must return a value if used.

**Output:** If the global flag `g` was used, the output will be a list of [RegExp match objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Description). Otherwise it will be a single [RegExp match object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#Description).

## Using match
The `match` option can be used to modify the content of individual matches. A common use case is to return from the match object only items that would be needed in the final result. Since `regex-extract-loader` by default returns the RegExp match object, which includes the entire source string, it's much more efficient to only send along whatever is needed.

### some.source.svg (input)
```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3046.7 875.7">
  <title>webpack-logo</title>
  <path class="back" fill="#FFF" d="M387 0l387 218.9v437.9L387..."/>
  <path class="outer" fill="#8ED6FB" d="M704.9 641.7L399.8 814..."/>
  <path class="inner" fill="#1C78C0" d="M373 649.3L185.4 546...."/>
</svg>
```

### webpack.config.js (config)
```javascript
module.exports = {
  ...,
  module: {
    rules: [{
      test: /\.source.svg$/,
      use: {
        loader: 'regex-extract-loader',
        options: {
          regex: 'path.+\\bd="(.+?)"',
          flags: 'g'
          // Return the first (and only) caputre group
          match: (match) => match[1]
        }
      }
    }]
  }
}
```

### some.module.js (output)
```javascript
const pathData = require('./assets/some.source.svg')

  // The match function returned the first (and only) capture group,
  // so the final matches array contains only those items.
  [
    'M387 0l387 218.9v437.9L387...',
    'M704.9 641.7L399.8 814...',
    'M373 649.3L185.4 546....'
  ]
```

## Using project
The `project` option can be used to modify the final result after all matches have been processed. It receives a list of items if the `g` (global) flag was specified in the `regex`, or a single item if `g` was not specified. The result passed to `project` will be whatever form was returned from `match`. If `match` is not used, the result passed to `project` will be either a list of RegExp match objects or a single one, depending on whether the `regex` was global or not.

### some.source.svg (input)
```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3046.7 875.7">
  <title>webpack-logo</title>
  <path class="back" fill="#FFF" d="M387 0l387 218.9v437.9L387..."/>
  <path class="outer" fill="#8ED6FB" d="M704.9 641.7L399.8 814..."/>
  <path class="inner" fill="#1C78C0" d="M373 649.3L185.4 546...."/>
</svg>
```

### webpack.config.js (config)
```javascript
module.exports = {
  ...,
  module: {
    rules: [{
      test: /\.source.svg$/,
      use: {
        loader: 'regex-extract-loader',
        options: {
          regex: 'path.+\\bd="(.+?)"',
          flags: 'g'
          // Transform each item in the match object into another form.
          project: (result) => {
            return result.map((match) => {
              return { path: match[1], index: match.index }
            })
          }
        }
      }
    }]
  }
}
```

### some.module.js (output)
```javascript
const pathData = require('./assets/some.source.svg')

  // The project function returned a list of custom objects.
  [
    { path: 'M387 0l387 218.9v437.9L387...', index: 101 },
    { path: 'M704.9 641.7L399.8 814...', index: 170 },
    { path: 'M373 649.3L185.4 546....', index: 239 }
  ]
```

## Examples

### Extract release information from a change log

#### changelog.md (input)
```
## [2.0.0] - 2017-11-20
New version

## [1.0.1] - 2017-11-07
Fix stuff

## [1.0.0] - 2017-11-05
Initial release
```

#### webpack.config.js (config)
```javascript
module.exports = {
  ...,
  module: {
    rules: [{
      test: /changelog.md$/,
      use: {
        loader: 'regex-extract-loader',
        options: {
          regex: '\\s*## \\[(.+)\\] - (\\d{4}-\\d{2}-\\d{2})\n(.+)',
          flags: 'g',
          match: (match) => ({
            version: match[1], date: match[2], note: match[3]
          })
        }
      }
    }]
  }
}
```

#### some.module.js (output)
```javascript
const versions = require('./changelog.md')

  [
    { version: '2.0.0', date: '2017-11-20', note: 'New version' },
    { version: '1.0.1', date: '2017-11-07', note: 'Fix stuff' },
    { version: '1.0.0', date: '2017-11-05', note: 'Initial release' }
  ]
```

### Parse key/value pairs from a source in key=value format

#### some.source.cfg (input)
```
name=Nebula
rank=10
attributes=["female", "blue", "cybernetic", "angry", "nebulicious"]
```

#### webpack.config.js (config)
```javascript
module.exports = {
  ...,
  module: {
    rules: [{
      test: /\.source.cfg$/,
      use: {
        loader: 'regex-extract-loader',
        options: {
          regex: '^(.+)=(.+)$',
          flags: 'mg',
          match: (match) => ({ key: match[1], value: match[2] }),
          project: (result) => {
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
      }
    }]
  }
}
```

#### some.module.js (output)
```javascript
const cfg = require('./assets/some.source.cfg')

{
  name: 'Nebula',
  rank: 10,
  attributes: [ 'female', 'blue', 'cybernetic', 'angry', 'nebulicious' ]
}
```


### Other Examples

See the [match](https://github.com/jabney/regex-extract-loader/blob/master/test/option-match.spec.js) and [project](https://github.com/jabney/regex-extract-loader/blob/master/test/option-project.spec.js) unit tests for additional examples.
