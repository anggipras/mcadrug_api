const multer = require('multer')
const fs = require('fs')

module.exports = {
    uploader(destination, fileNamePrefix) {
        //parameter biasa, destination: path dimana foto disimpan
        //fileNamePrefix: nama depan filenya
        let defaultpath = './public'; 

        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const dir = defaultpath + destination;
                if (fs.existsSync(dir)) {
                    console.log(dir, "exists")
                    cb(null, dir);
                } else {
                    fs.mkdir(dir,{recursive:true}, err => cb(err, dir));
                    console.log(dir, "make");
                }
            },
            filename: (req, file, cb) => {
                let originalname = file.originalname
                let ext = originalname.split('.')
                let filename = fileNamePrefix + Date.now() + '.' + ext[ext.length - 1];
                cb(null, filename);
            }
        });

        const imageFilter = (req, file, cb) => {
            const ext = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xlsx)$/;
            if(!file.originalname.match(ext)) {
                return cb(new Error('Only selected file type are allowed'), false);
            }
            cb(null, true);
        };

        return multer({
            storage: storage,
            fileFilter: imageFilter,
            limits: {
                fileSize: 1 * 1024 * 1024 //1MB
            }
        });
    }
}