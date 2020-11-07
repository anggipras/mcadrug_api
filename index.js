const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const bearerToken = require('express-bearer-token')
const PORT = process.env.PORT || 7777

const {
    AuthRoutes,
    DrugRoutes,
    SearchDrugRoutes
} = require('./src/routes')

app.use(cors())
app.use(bearerToken())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'))

app.use('/auth', AuthRoutes)
app.use('/drug', DrugRoutes)
app.use('/search', SearchDrugRoutes)

app.get('/', (req, res)=> {
    res.send('IT IS WORKING')
})

app.listen(PORT, ()=> console.log('active in PORT ' + PORT))