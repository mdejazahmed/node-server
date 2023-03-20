const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");

//Register
router.post("/register", async (req, res) => {
  try {
    //hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    //create user
    const newUser = new User({
      username: req.body.username,
      mobile: req.body.mobile,
      email: req.body.email,
      password: hashedPassword,
    });
    //save user
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
    console.log(err)
  }
});

//Log in
router.post("/login", async (req, res) => {
  try {
    const existingUser = await User.findOne({mobile:req.body.mobile});
    !existingUser && res.status(404).json("User Not Found");

    const validatePassword=await bcrypt.compare(req.body.password,existingUser.password);
    !validatePassword && res.status(400).json("Invalid Password");

    res.status(200).json(existingUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
