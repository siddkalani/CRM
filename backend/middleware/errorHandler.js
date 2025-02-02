
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

module.exports= (errorHandler)