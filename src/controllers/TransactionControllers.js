const {db} = require('./../connections')

const queryProm = (sql) => {
    return new Promise((resolve, reject)=> {
        db.query(sql, (err, results)=> {
            if (err) {
                reject(err)
            } else {
                resolve(results)
            }
        })
    })
}

module.exports = {
    addtocart: (req, res) => {
        const {userid, medid} = req.body

        let sql = `select * from transactions where status = 'onCart' and users_id = ${db.escape(userid)}`
        db.query(sql, (err, transacres)=> {
            if (err) {
                return res.status(500).send(err)
            }

            if(transacres.length) {
                sql = `select * from transactionsdetail where medicines_id = ${db.escape(medid)} and transactions_id = ${db.escape(transacres[0].id)} and isdeleted = 0`

                db.query(sql, (err, transdetres)=> {
                    if (err) {
                        res.status(500).send({message: err.message})
                    }

                    if(transdetres.length) { //jika transdetresnya ada tinggal update qty
                        if(req.body.qty) {
                            let upQty = {
                                qty: req.body.qty
                            }

                            sql = `update transactionsdetail set ? where medicines_id = ${db.escape(transdetres[0].medicines_id)} and transactions_id = ${db.escape(transdetres[0].transactions_id)}`
                            db.query(sql, upQty, (err)=> {
                                if (err) {
                                    res.status(500).send({message: err.message})
                                }
    
                                sql = `select m.photo, m.drugname, m.price, m.package, td.qty, m.id as idmed, t.id as idtrans from medicines m
                                join transactionsdetail td on m.id = td.medicines_id
                                join transactions t on t.id = td.transactions_id
                                where status = 'onCart' and t.users_id = ? and td.isdeleted = 0`
                                db.query(sql, [userid], (err, cartData)=> {
                                    if (err) {
                                        res.status(500).send({message: err.message})
                                    }
    
                                    return res.send(cartData)
                                })
                            })
                        } else {
                            let upQty = {
                                qty: parseInt(transdetres[0].qty) + 1
                            }
    
                            sql = `update transactionsdetail set ? where medicines_id = ${db.escape(transdetres[0].medicines_id)} and transactions_id = ${db.escape(transdetres[0].transactions_id)}`
                            db.query(sql, upQty, (err)=> {
                                if (err) {
                                    res.status(500).send({message: err.message})
                                }
    
                                sql = `select m.photo, m.drugname, m.price, m.package, td.qty, m.id as idmed, t.id as idtrans from medicines m
                                join transactionsdetail td on m.id = td.medicines_id
                                join transactions t on t.id = td.transactions_id
                                where status = 'onCart' and t.users_id = ? and td.isdeleted = 0`
                                db.query(sql, [userid], (err, cartData)=> {
                                    if (err) {
                                        res.status(500).send({message: err.message})
                                    }
    
                                    return res.send(cartData)
                                })
                            })
                        }

                    } else { //jika cart terisi tapi obat yang dipilih belum ada di cart
                        let insertData = {
                            medicines_id: medid,
                            transactions_id: transacres[0].id,
                            qty: 1
                        }

                        sql = `insert into transactionsdetail set ?`
                        db.query(sql, insertData, (err)=> {
                            if (err) {
                                res.status(500).send({message: err.message})
                            }

                            sql = `select m.photo, m.drugname, m.price, m.package, td.qty, m.id as idmed, t.id as idtrans from medicines m
                            join transactionsdetail td on m.id = td.medicines_id
                            join transactions t on t.id = td.transactions_id
                            where status = 'onCart' and t.users_id = ? and td.isdeleted = 0`
                            db.query(sql, [userid], (err, cartData)=> {
                                if (err) {
                                    res.status(500).send({message: err.message})
                                }

                                return res.send(cartData)
                            })
                        })
                    }
                })
            } else { // jika cart benar2 kosong sama sekali
                let newDrugInsert = {
                    date: new Date(),
                    status: 'onCart',
                    users_id: userid
                }

                db.beginTransaction((err)=> {
                    if (err) {
                        return res.status(500).send(err)
                    }

                    sql = `insert into transactions set ?`
                    db.query(sql, newDrugInsert, (err, transres)=> {
                        if (err) {
                            return db.rollback(()=> {
                                res.status(500).send({message: err.message})
                            })
                        }

                        newDrugInsert = {
                            medicines_id: medid,
                            transactions_id: transres.insertId,
                            qty: 1
                        }
                        
                        sql = `insert into transactionsdetail set ?`
                        db.query(sql, newDrugInsert, (err)=> {
                            if (err) {
                                return db.rollback(()=> {
                                    res.status(500).send({message: err.message})
                                })
                            }

                            db.commit(err=> {
                                if (err) {
                                    return db.rollback(()=> {
                                        res.status(500).send({message: err.message})
                                    })
                                }

                                sql = `select m.photo, m.drugname, m.price, m.package, td.qty, m.id as idmed, t.id as idtrans from medicines m
                                join transactionsdetail td on m.id = td.medicines_id
                                join transactions t on t.id = td.transactions_id
                                where status = 'onCart' and t.users_id = ? and td.isdeleted = 0`
                                db.query(sql, [userid], (err, cartData)=> {
                                    if (err) {
                                        res.status(500).send({message: err.message})
                                    }

                                    return res.send(cartData)
                                })
                            })
                        })
                    })
                })
            }
        })
    },
    getcart: (req, res)=> {
        const {userid} = req.query
        let sql = `select m.photo, m.drugname, m.price, m.package, td.qty, m.id as idmed, t.id as idtrans from medicines m
        join transactionsdetail td on m.id = td.medicines_id
        join transactions t on t.id = td.transactions_id
        where status = 'onCart' and t.users_id = ? and td.isdeleted = 0`
        db.query(sql, [userid], (err, cartData)=> {
            if (err) return res.status(500).send(err)
            
            return res.send(cartData)
        })
    },
    onpaycc: (req, res)=> {
        const {idtrans, ccnumber, cartdata} = req.body
        let sql = `update transactions set ? where id = ${db.escape(idtrans)}`
        let updateData = {
            date: new Date(),
            status: 'completed',
            paymethod: 'cc',
            payinvoice: ccnumber
        }

        db.query(sql, updateData, (err)=> {
            if (err) return res.status(500).send(err)

            let arr = []
            cartdata.forEach(val => {
                arr.push(queryProm(`update transactionsdetail set buyprice = ${val.price} where transactions_id = ${val.idtrans} and medicines_id = ${val.idmed}`))
            });

            Promise.all(arr).then(()=> {
                return res.send('berhasil') //tidak perlu getcart lagi karena jika berhasil, di front otomatis kosong
            }).catch((err)=> {
                console.log(err);
                return res.status(500).send(err)
            })
        })

    }
}
