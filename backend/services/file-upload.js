   const aws = require('aws-sdk');
   const multer = require('multer');
   const multerS3 = require('multer-s3');
  

   aws.config.update({
    accessKeyId: "",
    secretAccessKey: "",
    region: 'us-east-2' 
   });

   const s3 = new aws.S3();

//    /* In case you want to validate your file type */
//    const fileFilter = (req, file, cb) => {
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//      cb(null, true);
//     } else {
//      cb(new Error('Wrong file type, only upload JPEG and/or PNG !'), 
//      false);
//     }
//    };

   const upload = multer({
//    fileFilter: fileFilter,
   storage: multerS3({
    acl: 'public-read',
    s3,
    bucket: 'insta-posts',
    metadata: function (req, file, cb) {
        cb(null, {fieldName: "TESTING"});
    },
    key: function(req, file, cb) {
      console.log("entered upload")
      req.file = Date.now() + file.originalname;
      cb(null, Date.now() + file.originalname);
     }
    })
   });

   module.exports = upload;
