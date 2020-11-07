const jwt = require('jsonwebtoken')

module.exports = {
    auth: (req, res, next)=> {
        if (req.method !== "OPTIONS") {
            console.log(req.token);
            jwt.verify(req.token, "mcadrug", (error, decoded)=> {
                if(error) {
                    return res.status(401).json({messsage: "User not authorized.", error: "user not authorized."})
                }
                console.log(decoded, 'this is decoded');
                req.user = decoded
                next()
            })
        } else {
            next()
        }
    }
}