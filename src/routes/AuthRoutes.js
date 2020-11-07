const Router = require('express').Router()
const {AuthControllers} = require('./../controllers')
const {auth} = require('./../helpers/auth')

Router.post('/register', AuthControllers.register)
Router.get('/verified', auth,AuthControllers.verified)
Router.post('/login', AuthControllers.login)
Router.get('/keeplogin/:id', AuthControllers.keeplogin)

module.exports = Router