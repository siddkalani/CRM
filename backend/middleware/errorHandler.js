const multer = require('multer');

const errorHandler = (err , req , res, next) =>{
    const statusCode = res.statusCode ? res.statusCode:600;
    res.status(statusCode)
    switch(statusCode){
        case 401:
            res.json({
                title:"auth error",
                message: err.message
            })
        break;

        case 400:
            res.json({
                title:"validation failed",
                message: err.message
            })
        break;

        case 404:
            res.json({
                title:"Not Found",
                message: err.message
            })
        break;

        case 500:
            res.json({
                title:"server error",
                message: err.message
            })
        break;

        default:
            case 600:
            res.json({
                title:"random",
                message: err.message
            })
        break;

    }
}

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer error:', err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred
      console.error('Unknown upload error:', err);
      return res.status(500).json({ message: `Upload failed: ${err.message}` });
    }
    
    // No error occurred, continue
    next();
  };

module.exports= (errorHandler,handleMulterError)