const Router = require('express').Router()
const {SearchDrugControllers} = require('./../controllers')

Router.get('/searchdrug', SearchDrugControllers.searchdrug)
Router.get('/specifieddrug/:medicname', SearchDrugControllers.specifieddrug)
Router.get('/profiledrug/:idMedicines', SearchDrugControllers.profiledrug)
Router.get('/mostboughtmed', SearchDrugControllers.mostboughtmed)


module.exports = Router