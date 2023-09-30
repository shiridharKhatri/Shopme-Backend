const express = require("express");
const Admin = require("../model/Admin");
const router = express.Router();
const secret = process.env.JWT_SECRET_ADMIN;
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const fetchAdmin = require("../middleware/fetchadmin");
const User = require("../model/User");
const getAdminToken = require("../mail/adminToken");

router.post(
  "/adminSignup",
  [
    body("admin_name").isLength({ min: 3 }),
    body("position").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password").isStrongPassword(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ success: false, errors: errors.array() });
    }
    try {
      let admin = await Admin.findOne({ email: req.body.email });
      let user = await User.findOne({ email: req.body.email });
      if (admin) {
        res.status(401).json({
          success: false,
          msg: "Admin with this email already recorded in the system",
        });
      } else if (user) {
        res.status(401).json({
          success: false,
          msg: "Costumer email dont have access to login as a admin",
        });
      } else {
        let salt = await bcrypt.genSalt(10);
        let secPassword = await bcrypt.hash(req.body.password, salt);
        admin = await Admin.create({
          admin_name: req.body.admin_name,
          email: req.body.email,
          password: secPassword,
          position: req.body.position,
        });
        res.status(200).json({
          success: true,
          msg: "Admin Created",
        });
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

router.post(
  "/adminLogin",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ success: false, errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      let admin = await Admin.findOne({ email: email });
      let compPass = await bcrypt.compare(password, admin.password);
      // let user = await User.findOne({ email: email });
      if (!admin) {
        res.status(401).json({
          success: false,
          msg: "You dont have access to login as a admin",
        });
      } else if (!compPass) {
        res.status(401).json({
          success: false,
          msg: "Invalid crediential",
        });
      } else {
        function generateRandomNumber() {
          var minm = 100000;
          var maxm = 999999;
          return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
        }
        let genToken = generateRandomNumber();
        let salt = await bcrypt.genSalt(10);
        let secToken = await bcrypt.hash(String(genToken), salt);
        getAdminToken(admin.email, genToken, admin.name);
        admin = await Admin.findByIdAndUpdate(
          admin._id,
          { $set: { token: secToken } },
          { new: true }
        );
        res.json({
          success: true,
          email: admin.email,
          msg: "Logged in successfully! Now verify your email to procceed",
        });
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);
router.post("/two-step-verification", async (req, res) => {
  try {
    const { email, token } = req.body;
    let admin = await Admin.findOne({ email: email });
    let compareToken = await bcrypt.compare(token, admin.token);
    if (!admin) {
      res.status(401).json({
        success: false,
        msg: "You dont have access to login as a admin",
      });
    } else if (token === "" || null || undefined) {
      res.status(401).json({
        success: false,
        msg: "Input field can't be empty",
      });
    } else if (!compareToken) {
      res.status(401).json({
        success: false,
        msg: "You have provided wrong code",
      });
    } else {
      admin = await Admin.findByIdAndUpdate(
        admin._id,
        { $set: { token: null } },
        { new: true }
      );
      let data = {
        admin: {
          id: admin.id,
        },
      };
      let tokens = jwt.sign(data, secret);
      res.status(200).json({
        success: true,
        msg:"Verification successful!",
        token: tokens,
      });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});
router.get("/fetchallusers", fetchAdmin, async (req, res) => {
  try {
    let user = await User.find().select("-password");
    res.json({ totalUser: user.length, user });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});
module.exports = router;
