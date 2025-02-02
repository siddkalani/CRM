const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const validateToken = asyncHandler((req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded.user; // Assuming `id` is part of the payload
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Not authorized, invalid token");
    }
});

module.exports = validateToken;
