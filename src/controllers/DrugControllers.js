const {db} = require('./../connections')
const fs = require('fs')
const {uploader} = require('./../helpers/uploader')

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

module.exports = {
    adddrug: (req, res)=> {
        try {
            const path = '/drug'
            const upload = uploader(path, 'DRUG').fields([{name: 'drugImage'}])
    
            upload(req, res, (err)=> {
                if(err) {
                    return res.status(500).json({message: 'upload picture failed !', error: err.message})
                }
    
                console.log('upload drug succeed');
                const {drugImage} = req.files
                console.log(drugImage);
    
                const imagePath = drugImage ? path + '/' + drugImage[0].filename : null
                console.log(imagePath);
    
                const dataMedfromUser = JSON.parse(req.body.drugData)
                let drugDatatoSql = {
                    drugname: dataMedfromUser.drugname, 
                    stock: dataMedfromUser.stock, 
                    price: dataMedfromUser.price, 
                    package: dataMedfromUser.package, 
                    photo: imagePath, 
                    description: dataMedfromUser.description, 
                    indication: dataMedfromUser.indication, 
                    category: dataMedfromUser.category, 
                    composition: dataMedfromUser.composition,
                    doses: dataMedfromUser.doses,
                    storagecond: dataMedfromUser.storagecond,
                    caution: dataMedfromUser.caution,
                    sideeffect: dataMedfromUser.sideeffect,
                    class: dataMedfromUser.class
                }
    
                db.query('insert into medicines set ?', drugDatatoSql, (err)=> {
                    if (err) {
                        fs.unlinkSync('./public' + imagePath)
                        return res.status(500).send(err)
                    }
                    
                    db.query('select * from medicines', (err, dataMedicines)=> {
                        if (err) return res.status(500).send(err)
                        console.log(dataMedicines);
                        return res.send(dataMedicines)
                    })
                })
            })
        } catch (error) {
            return res.status(500).send(error)
        }
    },
    getalldrug: async (req, res)=> {
        let sql = 'select * from medicines'
        try {
            const dataMedicines = await dbPromSelect(sql)
            sql = 'select * from tags order by tag'
            const dataTags = await dbPromSelect(sql)
            sql = `select medicines_tags.medicines_id, tags.tag from tags
            join medicines_tags on tags.id = medicines_tags.tags_id`
            const eachTags = await dbPromSelect(sql)
            return res.send({dataMedicines: dataMedicines, dataTags: dataTags, eachTags: eachTags})
        } catch (error) {
            return res.status(500).send({message: error.message})
        }
    },
    inserttag: (req, res)=> {
        const {idDrug, idTag} = req.body
        let dataMedicinesTags = {
            medicines_id: idDrug,
            tags_id: idTag,
            date: new Date()
        }

        let sql = `insert into medicines_tags set ?`
        db.query(sql, dataMedicinesTags, (err)=> {
            if (err) return res.status(500).send({message: err.message})
            
            sql = `select medicines_tags.medicines_id, tags.tag from tags
            join medicines_tags on tags.id = medicines_tags.tags_id
            where medicines_id = ${db.escape(idDrug)}`
            db.query(sql, (err, resdataTags)=> {
                if (err) return res.status(500).send({message: err.message})
                return res.send(resdataTags)
            })
        })
    }
}