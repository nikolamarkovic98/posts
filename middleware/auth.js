const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader){
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1];
    if(!token){
        req.isAuth = false;
        return next();
    }

    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'mysecretkey');
    } catch(err){
        console.log(err);
        req.isAuth = false;
        return next();
    }

    req.isAuth = true;
    req.userId = decodedToken.userId;
    next();
}