const Router = require('express').Router()
const {DrugControllers} = require('./../controllers')

Router.post('/adddrug', DrugControllers.adddrug)
Router.get('/getalldrug', DrugControllers.getalldrug)
Router.post('/inserttag', DrugControllers.inserttag)

module.exports = Router