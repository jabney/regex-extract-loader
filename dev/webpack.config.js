
module.exports = {
  entry: './dev/index.js',
  output: {
    filename: './tmp/main.bundle.js'
  },
  module: {
    rules: [{
      test: /\.svg$/,
      use: {
        loader: './lib/index.js',
        options: {
          regex: '(\\w+?)="(.+?)"',
          flags: 'g',
          project: function (match) {
            return match.reduce(function (map, value) {
              map[value[1]] = value[2]
              return map
            }, {})
          }
        }
      }
    }]
  }
}
