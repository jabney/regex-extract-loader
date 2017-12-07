const reExtract = /export default (.+)$/

module.exports = {
  value(output) {
    const match = reExtract.exec(output)
    return match && JSON.parse(match[1])
  }
}
