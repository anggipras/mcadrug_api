const {db} = require('./../connections')
const {encrypt} = require('./../helpers')
const nodemailer = require('nodemailer')
const fs = require('fs')
const handlebars = require('handlebars')
const {createJWToken} = require('./../helpers/jwt')

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'anggiprastianto30@gmail.com',
        pass: 'scftufihozxzbjcg'
    },
    tls : {
        rejectUnauthorized: false
    }
})

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
                        const link = `http://localhost:3000/verified?token=${tokenuser}`
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
                const tokenuser = createJWToken({id: datausers[0].id, username: datausers[0].username})
                datausers[0].token = tokenuser
                return res.send(datausers[0])
            })
        })
    },
    keeplogin: (req, res)=> {
        const {id} = req.params
        let sql = `select * from users where id = ${db.escape(id)}`
        db.query(sql, (err, datalogin)=> {
            if (err) return res.status(500).send({message: err.message})
            const tokenuser = createJWToken({id: datalogin[0].id, username: datalogin[0].username})
            datalogin[0].token = tokenuser
            return res.send(datalogin[0])
        })
    }
}