const Crypto = require('crypto')

module.exports = (password) => {
    var thekey = 'mcadrug'
    return Crypto.createHmac('sha256', thekey).update(password).digest('hex')
}