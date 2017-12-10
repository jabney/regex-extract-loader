'use strict'

var loaderUtils = require('loader-utils')

var NAME = 'Regex Extract Loader'

/**
 * The Regex Extract Loader.
 *
 * @typedef {Object} LoaderOptions
 * @property {RegExp} regex
 * @property {string?} flags
 * @property {(match: RegExpExecArray) => any} match
 * @property {(match: any) => any} project
 *
 * Extract values from the source via a regular expression.
 *
 * @param {string} source
 * @returns {string}
 */
function regexExtractLoader(source) {
  var options = getOptions(this)
  var regex = getRegex(options.regex, options.flags)
  var matchFn = getMatchFn(options)
  var projectFn = getProjectFn(options)
  var result = projectFn(exec(regex, source, matchFn))
  return 'module.exports = ' + JSON.stringify(result)
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
 * Return the options object.
 *
 * @param {LoaderContext} context
 * @returns {LoaderOptions}
 */
function getOptions(context) {
  return loaderUtils.getOptions(context)
}
/**
 * Transform options.regex into a RegExp if it isn't one already.
 *
 * @param {any} regex
 * @param {string} flags
 * @returns {RegExp}
 */
function getRegex(regex, flags) {
  var result = typeOf(regex) === 'String'
    ? new RegExp(regex, flags || '')
    : regex

  if (typeOf(result) !== 'RegExp') {
    throw new Error(
      NAME + ': option "regex" must be a string or a RegExp object')
  }

  return result
}

/**
 * Return the project function if specified, or the identity function.
 *
 * @param {LoaderOptions} options
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
 * @param {LoaderOptions} options
 * @returns {(match: RegExpExecArray) => any}
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
 * Return the given value (do nothing).
 *
 * @param {any} value
 * @returns
 */
function identityFn(value) {
  return value
}

/**
 * Execute a regular rexpression and return the match or matches.
 * If the global flag is used, return a list of matches; otherwise
 * return the found match (or null if nothing found).
 *
 * @param {RegExp} regex
 * @param {string} source
 * @param {(match: RegExpExecArray) => any} matchFn
 * @returns {RegExpExecArray|RegExpExecArray[]}
 */
function exec(regex, source, matchFn) {
  var match, matches

  if (regex.global) {
    matches = []
    while ((match = regex.exec(source)) !== null) {
      matches.push(matchFn(match || null))
    }
    return matches
  } else {
    match = regex.exec(source)
    return matchFn(match || null)
  }
}

module.exports = regexExtractLoader
