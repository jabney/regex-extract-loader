'use strict'

var loaderUtils = require('loader-utils')

var NAME = 'Regex Extract Loader'

/**
 * The Regex Extract Loader.
 *
 * Extract values from the source via a regular expression.
 *
 * @param {string} source
 * @returns {string}
 */
function regexExtractLoader(source) {
  var options = loaderUtils.getOptions(this)
  var regex = getRegex(options.regex, options.flags)
  var projectFn = getProjectFn(options)
  var value = projectFn(exec(regex, source, options))
  return 'export default ' + JSON.stringify(value)
}

/**
 * Return the type of an object as a string.
 *
 * @param {any} object
 * @returns {string}
 */
function typeOf(object) {
  return Object.prototype.toString.call(object).slice(8, -1)
}

/**
 * Transform options.regex into a RegExp if it isn't one already.
 *
 * @param {any} regex
 * @param {string} flags
 * @returns {RegExp}
 */
function getRegex(regex, flags) {
  var type = typeOf(regex)

  if (type === 'String') {
    return new RegExp(regex, flags || '')
  } else if (type === 'RegExp') {
    return regex
  } else {
    throw new Error(
      NAME + ': option "regex" must be a string or a RegExp object')
  }
}

/**
 * Return the project function if specified, or the identity function.
 *
 * @param {any} options
 * @returns {(matches: any[]) => any}
 */
function getProjectFn(options) {
  var projectFn = typeof options.project !== 'undefined'
    ? options.project
    : identityFn

  if (typeof projectFn !== 'function') {
    throw new Error(NAME + ': option "project" must be a function')
  }

  return projectFn
}

/**
 * Return the match function if specified, or the identity function.
 *
 * @param {{match: (RegExpMatchArray) => void}} options
 * @returns {(match: RegExpMatchArray) => any}
 */
function getMatchFn(options) {
  var matchFn = typeof options.match !== 'undefined'
    ? options.match
    : identityFn

  if (typeof matchFn !== 'function') {
    throw new Error(NAME + ': option "match" must be a function')
  }

  return matchFn
}

/**
 * Return the passed value.
 *
 * @param {any} value
 * @returns
 */
function identityFn(value) {
  return value
}

/**
 * Execute a regular rexpression and return the match or matches.
 * If the global flag used, return a list of matches; otherwise
 * return the found match or null.
 *
 * @param {RegExp} regex
 * @param {string} source
 * @param {any} options
 * @returns {RegExpMatchArray|RegExpMatchArray[]}
 */
function exec(regex, source, options) {
  var match, matches
  var matchFn = getMatchFn(options)

  if (regex.global) {
    matches = []
    while ((match = regex.exec(source)) !== null) {
      matches.push(matchFn(match))
    }
    return matches
  } else {
    match = regex.exec(source)
    return matchFn(match)
  }
}

module.exports = regexExtractLoader
