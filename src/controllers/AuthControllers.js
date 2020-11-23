const {db} = require('./../connections')
const {encrypt, transporter} = require('./../helpers')
const fs = require('fs')
const handlebars = require('handlebars')
const {createJWToken} = require('./../helpers/jwt')

const DbPROMselect = (sql) => {
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
    register: (req, res)=> {
        const {
            username, 
            email, 
            password, 
            firstname, 
            lastname, 
            phone, 
            birthdate, 
            address
        } = req.body
        
        const hashpass = encrypt(password)
        let sql = `select * from users where username = ${db.escape(username)}`
        db.query(sql, (err, datauser)=> {
            if (err) return res.status(500).send({message: err.message})
            if(datauser.length) {
                return res.status(500).send({message: "username sudah ada"})
            } else {
                let dataRegis = {
                    username: username,
                    email,
                    password: hashpass,
                    firstname,
                    lastname,
                    phone,
                    birthdate,
                    address,
                    lastlogin: new Date()
                }

                sql = `insert into users set ?`
                db.query(sql, dataRegis, (err, results)=> {
                    if (err) return res.status(500).send({message: err.message})
                    sql = `select * from users where id = ?`
                    db.query(sql, [results.insertId], (err, userLogin)=> {
                        if (err) return res.status(500).send({message: err.message})

                        const htmlrender = fs.readFileSync('./templates/email.html','utf8')
                        const template = handlebars.compile(htmlrender)
                        const tokenuser = createJWToken({id: userLogin[0].id, username: userLogin[0].username})
                        const link = `https://mcadrugstore.web.app/verified?token=${tokenuser}`
                        const htmlemail = template({name: userLogin[0].username, link: link})
                        transporter.sendMail({
                            from: 'MCADRUG <anggiprastianto30@gmail.com>',
                            to: email,
                            subject: "MCADRUG account verification",
                            html: htmlemail
                        }, (err)=> {
                            if (err) return res.status(500).send({message: err.message})
                            userLogin[0].token = tokenuser
                            res.status(200).send(userLogin[0])
                        })
                    })
                })
            }
        })
    },
    verified: (req, res)=> {
        const {id} = req.user
        let editdata = {
            isverified: true
        }

        let sql = `update users set ? where id = ${db.escape(id)}`
        db.query(sql, editdata, (err)=> {
            if (err) return res.status(500).send({message: err.message})
            sql = `select * from users where id = ${db.escape(id)}`
            db.query(sql, (err, result)=> {
                if (err) return res.status(500).send({message: err.message})
                result[0].token = req.token
                return res.status(200).send(result[0])
            })
        })
    },
    login: (req, res)=> {
        const {email, password} = req.body
        let hashpass = encrypt(password)
        let sql = `select * from users where email = ? and password = ?`
        db.query(sql, [email, hashpass], (err, datausers)=> {
            if (err) return res.status(500).send({message: err.message})
            if(!datausers.length) {
                return res.status(500).send({message: 'pengguna belum terdaftar'})
            }

            sql = `update users set ? where id = ${db.escape(datausers[0].id)}`
            let updateData = {
                lastlogin: new Date()
            }
            db.query(sql, updateData, (err)=> {
                if (err) return res.status(500).send({message: err.message})

                sql = `select m.photo, m.drugname, m.price, m.package, td.qty, m.id as idmed, t.id as idtrans from medicines m
                join transactionsdetail td on m.id = td.medicines_id
                join transactions t on t.id = td.transactions_id
                where status = 'onCart' and t.users_id = ? and td.isdeleted = 0`
                db.query(sql, [datausers[0].id], (err, cartData)=> {
                    if (err) return res.status(500).send({message: err.message})
                    const tokenuser = createJWToken({id: datausers[0].id, username: datausers[0].username})
                    datausers[0].token = tokenuser
                    return res.send({datalogin: datausers[0], cartData: cartData})
                }) 
            })
        })
    },
    keeplogin: async (req, res)=> {
        const {id} = req.params
        let sql = `select * from users where id = ${db.escape(id)}`
        try {
            const datalogin = await DbPROMselect(sql)
            sql = `select m.photo, m.drugname, m.price, m.package, td.qty, m.id as idmed, t.id as idtrans from medicines m
            join transactionsdetail td on m.id = td.medicines_id
            join transactions t on t.id = td.transactions_id
            where status = 'onCart' and t.users_id = ${db.escape(datalogin[0].id)} and td.isdeleted = 0`
            const cartData = await DbPROMselect(sql)
            const tokenuser = createJWToken({id: datalogin[0].id, username: datalogin[0].username})
            datalogin[0].token = tokenuser
            return res.send({datalogin: datalogin[0], cartData: cartData})
        } catch (error) {
            return res.status(500).send({message: error.message})
        }
    }
}