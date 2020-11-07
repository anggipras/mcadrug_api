const {db} = require('./../connections')

const dbPromSelect = (sql) => {
    return new Promise((resolve, reject)=> {
        db.query(sql,(err, results)=> {
            if (err) {
                reject(err)
            } else {
                resolve(results)
            }
        })
    })
}

// where drugname = 'paracetamol'

module.exports = {
    searchdrug: async (req, res)=> {
        let sql = `select * from medicines`
        try {
            const dataMedicines = await dbPromSelect(sql)
            return res.send(dataMedicines)
        } catch (error) {
            return res.status(500).send({message: error.message})
        }
    },
    specifieddrug: async (req, res)=> {
        const {medicname} = req.params
        let sql = `select * from medicines where drugname like '%${medicname}%'`
        try {
            const dataSpecMedic = await dbPromSelect(sql)
            return res.send(dataSpecMedic)
        } catch (error) {
            return res.status(500).send({message: error.message})
        }
    }
}