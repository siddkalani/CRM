const asyncHandler = require('express-async-handler');
const User = require('../models/userModell')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken')


const registerUser = asyncHandler(async (req, res) => {

    console.log(`this is the req body: ${req.body}`)

    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400);
        throw new Error("All fields are required")
    }
    // check if user already exists
    const userAvaliable = await User.findOne({ email });
    if (userAvaliable) {
        res.status(400);
        throw new Error("User already exists")
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create(
        {
            username,
            email,
            password: hashedPassword,
        }
    )
    console.log(`if user created ${user}`)
    if (user) {
        res.status(201).json({ email: user.email, _id: user.id });
    } else {
        res.status(400)
        throw new Error("User data not")
        // res.status(201).json(user)
    }
})

const loginUser = asyncHandler(async (req, res) => {
    console.log(process.env.ACCESS_TOKEN_SECRET)
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400)
        throw new Error("all fields are mandatory")
    }
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            }
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1y' })
        res.status(200).json({ accessToken, userId: user.id, messgae: "successfull" });
    } else {
        res.status(401)
        throw new Error("Invalid email or password")
    }
});

const currentUser = asyncHandler(async (req, res) => {
    // `req.user` is populated by validateToken middleware
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json(req.user);
});

const updateUser = asyncHandler(async (req, res) => {
    // req.user is from validateToken middleware
    const userId = req.user.id;
    const { username, password } = req.body;
  
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
  
    // Update fields if they were passed in the request
    if (username) user.username = username;
    if (password) {
      // be sure to hash the new password
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }
  
    await user.save();
    // Return the updated fields as JSON
    res.status(200).json({ username: user.username, password: user.password });
});
  

module.exports = { registerUser, loginUser, currentUser , updateUser }