const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const { findByIdAndUpdate } = require("../models/User");

//get users
router.get("/",async(req,res)=>{
const exUserName=req.query.username
const mobile=req.query.mobile 
try{
const existingUser=exUserName?await User.findOne({username:exUserName}):await User.findOne({mobile:mobile})
const {_id,username,profilePic}=existingUser
res.status(200).json({_id,username,profilePic})
}catch(err){
  console.log(err);
}
});

//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    if (req.body.password) {
      try {
        req.body.password = await bcrypt.hash(req.body.password, 10);
      } catch (err) {
        res.status(500).json(err);
      }
    }
    try {
      const existingUser = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Account has been updated");
    } catch (err) {
      res.status(500).json("failded to update");
    }
  } else {
    res.status(403).json("You can update only your account");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const existingUser = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Your account has been deleted");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can delete only your account");
  }
});

//get a user
router.get("/", async (req, res) => {
  const userId = req.query.userId;
  const username = req.query.username;
  try {
    const existingUser = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });
    const { password, updatedAt, ...other } = existingUser._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(404).json("User not found");
  }
});

//get friends
router.get("/friends/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const friends = await Promise.all(
      user.followings.map((followerId) => {
        return User.findById(followerId);
      })
    );
    let friendList = [];
    friends.map((eachFriend) => {
      const { _id, username, profilePic } = eachFriend;
      friendList.push({ _id, username, profilePic });
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const otherUser = await User.findById(req.params.id);
      const cuurentUser = await User.findById(req.body.userId);
      if (!otherUser.followers.includes(req.body.userId)) {
        await otherUser.updateOne({ $push: { followers: req.body.userId } });
        await cuurentUser.updateOne({ $push: { followings: req.params.id } });

        res.status(200).json("User has been followed");
      } else {
        res.status(403).json("You allredy follow the user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't follow yourself");
  }
});

//unfollow user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const otherUser = await User.findById(req.params.id);
      const cuurentUser = await User.findById(req.body.userId);
      if (otherUser.followers.includes(req.body.userId)) {
        await otherUser.updateOne({ $pull: { followers: req.body.userId } });
        await cuurentUser.updateOne({ $pull: { followings: req.params.id } });

        res.status(200).json("User has been unfollowed");
      } else {
        res.status(403).json("You don't follow the user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You can't unfollow yourself");
  }
});

module.exports = router;
