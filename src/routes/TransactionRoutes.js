const Router = require('express').Router()
const {TransactionControllers} = require('./../controllers')
const {auth} = require('./../helpers/auth')

Router.post('/addtocart', auth, TransactionControllers.addtocart)

module.exports = Router