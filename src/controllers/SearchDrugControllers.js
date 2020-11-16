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
        const {page} = req.query
        if(page) {
            var sql = `select * from medicines limit ${(page-1)*8}, 8`
        } else {
            var sql = `select * from medicines`
        }
        try {
            const dataMedicines = await dbPromSelect(sql)
            sql = `select count(*) as amountofmed from medicines`
            const countMedicines = await dbPromSelect(sql)
            return res.send({dataMedicines: dataMedicines, countMedicines: countMedicines})
        } catch (error) {
            return res.status(500).send({message: error.message})
        }
    },
    specifieddrug: async (req, res)=> {
        const {medicname} = req.params
        let sql = `select * from medicines where drugname like '%${medicname}%'`
        try {
            const dataSpecMedic = await dbPromSelect(sql)
            sql = `select count(*) as amountofmed from medicines where drugname like '%${medicname}%'`
            const countMedicines = await dbPromSelect(sql)
            return res.send({dataSpecMedic: dataSpecMedic, countMedicines: countMedicines})
        } catch (error) {
            return res.status(500).send({message: error.message})
        }
    },
    profiledrug: async (req, res)=> {
        const {idMedicines} = req.params
        let sql = `select * from medicines where id = ${idMedicines}`
        try {
            const dataProfMedicines = await dbPromSelect(sql)
            sql = `select tags.tag from tags
            join medicines_tags on tags.id = medicines_tags.tags_id
            where medicines_id = ${idMedicines};`
            const profMedTags = await dbPromSelect(sql)
            return res.send({dataProfMedicines: dataProfMedicines, profMedTags: profMedTags})
        } catch (error) {
            return res.status(500).send({message: error.message})
        }
    }
}