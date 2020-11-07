const Router = require('express').Router()
const {SearchDrugControllers} = require('./../controllers')

Router.get('/searchdrug', SearchDrugControllers.searchdrug)
Router.get('/specifieddrug/:medicname', SearchDrugControllers.specifieddrug)

module.exports = Router