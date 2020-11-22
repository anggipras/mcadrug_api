const Router = require('express').Router()
const {TransactionControllers} = require('./../controllers')
const {auth} = require('./../helpers/auth')

Router.post('/addtocart', auth, TransactionControllers.addtocart)
Router.get('/getcart', TransactionControllers.getcart)
Router.post('/onpaycc', auth, TransactionControllers.onpaycc)

module.exports = Router