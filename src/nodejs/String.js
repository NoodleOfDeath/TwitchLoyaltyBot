

String.prototype.pre = function() {
  return '`' + this + '`'
}

String.prototype.em = function() {
  return '_' + this + '_'
}

String.prototype.strong = function() {
  return '**' + this + '**'
}

String.prototype.uline = function() {
  return '__' + this + '__'
}

String.prototype.strike = function() {
  return '~~' + this + '~~'
}

String.prototype.quote = function() {
  return '\'' + this + '\''
}

String.prototype.qquote = function() {
  return '"' + this + '"' 
}

String.prototype.parseArgs = function() {
  return this
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .split(' ')
  //.match(/(?<=")(\\"|.)*?(?=")|(?<=')(\\'|.)*?(?=')|\b[^\s]+\b/g)
}

module.exports.String = String