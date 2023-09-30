const User = require("../model/User");
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const getToken = require("../mail/tokenMail");
const jwt = require("jsonwebtoken");
const forgetPasgetToken = require("../mail/forgetPasToken");
const fetchusers = require("../middleware/fetchuser");
const multer = require("multer");
const os = require("os");
const UserCart = require("../model/UserCart");
const Products = require("../model/Products");
const secret = process.env.JWT_SECRET;

//signup form submittion
router.post(
  "/signup",
  [
    body("username", "User Name must contain atleast 3 character").isLength({
      min: 3,
    }),
    body("ph_number", "Please enter valid number").isLength({ min: 10 }),
    body("email", "Please Enter valid email").isEmail(),
    body(
      "password",
      "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
    ).isStrongPassword(),
    body("gender").isLength({ min: 3 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ success: false, errors: errors.array() });
    }
    try {
      let userEmail = await User.findOne({ email: req.body.email });
      let userPhnumber = await User.findOne({ ph_number: req.body.ph_number });
      let user = await User.find();
      if (userEmail) {
        res.status(401).json({
          success: false,
          param: "email_address",
          msg: "User with this email address already exist",
        });
      } else if (userPhnumber) {
        res.status(401).json({
          success: false,
          param: "phone_number",
          msg: "User with this Number address already exist",
        });
      } else {
        let salt = await bcrypt.genSalt(10);
        let secPassword = await bcrypt.hash(req.body.password, salt);
        function generateRandomNumber() {
          var minm = 100000;
          var maxm = 999999;
          return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
        }
        let genToken = generateRandomNumber();
        user = await User.create({
          username: req.body.username,
          ph_number: req.body.ph_number,
          email: req.body.email,
          password: secPassword,
          token: genToken,
          gender: req.body.gender,
        });

        getToken(user.email, user.token, user.username);

        setTimeout(async () => {
          if (user.token.length > 1) {
            await User.findByIdAndRemove(user._id);
          }
        }, 60000);
        res.status(200).json({
          success: true,
          msg: "Check your email section or span section to proceed",
          email: req.body.email,
        });
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

//user's email verification process
router.post(
  "/signup-validation",
  [body("token", "code must have length of six digit").isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ success: false, errors: errors.array() });
    }
    try {
      const { token, email } = req.body;
      let user = await User.findOne({ email: email });
      if (!user) {
        res.status(401).json({
          success: false,
        });
      }
      if (user.token !== token) {
        res.status(401).json({
          success: false,
          msg: "Wrong code! Please enter valid code that we have provided to you",
        });
      } else {
        user = await User.findByIdAndUpdate(
          user._id,
          { $set: { token: "", verificationStatus: true } },
          { new: true }
        );
        res.status(200).json({
          success: true,
          msg: "Account created successfully Login to your account",
        });
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

//login user verification
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ success: false, errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      let user = await User.findOne({ email: email });
      let compPass = await bcrypt.compare(password, user.password);
      if (!user) {
        res.status(401).json({
          success: false,
          msg: "Please login with correct crediential",
        });
      } else if (!compPass) {
        res.status(401).json({
          success: false,
          msg: "Please login with correct crediential",
        });
      } else {
        let data = {
          user: {
            id: user.id,
          },
        };
        let expDate = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
        let tokens = jwt.sign({ data, exp: expDate }, secret);
        if (user.token === null) {
          user = await User.findByIdAndUpdate(user._id, {
            $set: { devices: os.type() },
          });
          res.json({ success: true, token: tokens });
        } else {
          res.json({
            success: false,
            msg: "Your account is not verified signup again and enter code provided to you",
          });
        }
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

//if user forget password they click in forget password and submit email for verification code
router.post("/forget-password-email-validation", async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({ email: email });
    if (!user) {
      res.status(401).json({
        success: false,
        msg: "User with this email address doesn't exist",
      });
    } else {
      function generateRandomNumber() {
        var minm = 100000;
        var maxm = 999999;
        return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
      }
      let genToken = generateRandomNumber();
      forgetPasgetToken(user.email, genToken, user.username);
      user = await User.findByIdAndUpdate(
        user._id,
        { $set: { token: genToken } },
        { new: true }
      );
      res.json({
        success: true,
        msg: "Please check your inbox or check spam folder to get code",
      });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

//after submitting email they will get verification code(6digit) and they will verify their code with actual code
router.post(
  "/forget-password-code-verification",
  [body("token", "code must have length of six digit").isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ success: false, errors: errors.array() });
    }
    try {
      const { email, token } = req.body;
      let user = await User.findOne({ email: email });
      if (!user) {
        res.status(401).json({
          success: false,
          msg: "User with this email address doesn't exist",
        });
      }

      if (user.token !== token) {
        res.status(401).json({
          success: false,
          msg: "Please Enter valid six digit code",
        });
      } else {
        user = await User.findByIdAndUpdate(user._id, { $set: { token: 976 } });
        res.status(200).json({ success: true });
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

//after code verification process over user will able to change their password
router.put(
  "/change-forget-password",
  [body("password").isStrongPassword()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ success: false, errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      let user = await User.findOne({ email: email });
      let comparePas = await bcrypt.compare(password, user.password);
      if (!user) {
        res.status(401).json({
          success: false,
        });
      } else {
        let salt = await bcrypt.genSalt(10);
        let secPass = await bcrypt.hash(password, salt);
        if (user.token !== 976) {
          res.status(401).json({ success: false });
        } else if (comparePas) {
          res.status(400).json({
            success: false,
            msg: "You have entered your current password",
          });
        } else {
          user = await User.findByIdAndUpdate(
            user._id,
            { $set: { password: secPass, token: "" } },
            { new: true }
          );
          res.status(200).json({ success: true });
        }
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

//this is to change user password while login
router.post(
  "/changePassword",
  fetchusers,
  [body("new_password").isStrongPassword()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ success: false, errors: errors.array() });
    }
    try {
      const { password, new_password } = req.body;
      let userId = req.user.id;
      let user = await User.findById(userId);
      let comparePas = await bcrypt.compare(password, user.password);
      if (comparePas) {
        let salt = await bcrypt.genSalt(10);
        let secPas = await bcrypt.hash(new_password, salt);
        if (password === new_password) {
          res.json({
            success: false,
            msg: "You have entered your old password, to chamge your password you have to enter new ",
          });
        } else {
          user = await User.findByIdAndUpdate(
            user._id,
            { $set: { password: secPas } },
            { new: true }
          );
          res.json({ success: true, msg: "Password Changed Successfully" });
        }
      } else {
        res.json({ success: false, msg: "Please Enter your correct password" });
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

//post request to edit the profile details of users
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./profile-picture");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${file.originalname}`);
  },
});

const update = multer({
  storage: storage,
  limits: { fileSize: "50mb" },
}).single("avatar");
router.put(
  "/editProfile",
  fetchusers,
  update,
  [body("email").isEmail(), body("ph_number").isLength({ min: 10 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ success: false, errors: errors.array() });
    }
    try {
      const { username, email, ph_number, gender } = req.body;
      if (
        username === "" ||
        email === "" ||
        ph_number === "" ||
        gender === ""
      ) {
        res.json({ success: false, msg: "input field should not be empty" });
      } else {
        await User.findByIdAndUpdate(
          req.user.data.user.id,
          {
            $set: {
              username: username,
              email: email,
              ph_number: ph_number,
              gender: gender,
              profile_picture: req.file.filename || "",
            },
          },
          { new: true }
        );
        // console.log(req.file.filename)
        res.json({ success: true, msg: `User profile has been changed` });
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

//for changing user's email or phone number
// router.put('/changeProfile', fetchusers ,[
//   body('email').isEmail(),
//   body('ph_number').isLength({min:10})
// ],async(req,res)=>{
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(500).json({ success: false, errors: errors.array() });
//   }
//   try {
//    const {email, ph_number} = req.body;
//    function generateRandomNumber() {
//     var minm = 100000;
//     var maxm = 999999;
//     return Math.floor(Math.random() * (maxm - minm + 1)) + minm;
//   }
//   let genToken = generateRandomNumber();

//   let user = await User.findById(req.user.id);

//   } catch (error) {
//     return res.status(400).json({ success: false, msg: error.message });
//   }
// })

//adding shipping address of a user
router.post("/shipping_address", fetchusers, async (req, res) => {
  try {
    const { address_one, address_two, country, city, zip_code } = req.body;
    const userId = req.user.id;
    let user = await User.findById(userId).select("-password");
    if (
      address_one === "" ||
      country === "" ||
      city === "" ||
      zip_code === ""
    ) {
      res
        .status(400)
        .json({ success: false, msg: "Address field must not be empty" });
    } else {
      user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            address_one: address_one,
            address_two: address_two,
            country: country,
            city: city,
            zip_code: zip_code,
          },
        },
        { new: true }
      );
      res
        .status(200)
        .json({ success: true, msg: "Shipping address added successfully" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

//fetching all users from the database
router.get("/fetchusers", fetchusers, async (req, res) => {
  try {
    let userId = req.user.data.user.id;
    let user = await User.findById(userId).select("-password");
    if (!userId || !user) {
      res.status(400).json({ success: false, msg: "User not found" });
    } else {
      res.status(200).json({ success: true, user: user });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

//Adding to cart of a user
router.post(
  "/addToCart",
  [body("ItemId").isLength({ min: 6 })],
  fetchusers,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ success: false, errors: errors.array() });
    }
    try {
      const {
        name,
        size,
        color,
        ItemId,
        quantity,
        image,
        price,
        totalItemQuantity,
        ram,
        rom,
        category,
        discount
      } = req.body;
      let userId = req.user.data.user.id;
      let user = await User.findById(userId);
      if (userId !== user.id) {
        res.json({ success: false, msg: "Failed to add to cart" });
      } else {
        await UserCart.create({
          user: userId,
          ItemId,
          quantity,
          name,
          size,
          color,
          image,
          price,
          totalItemQuantity,
          ram,
          rom,
          category,
          discount
        });
        res.json({ success: true, msg: "Item added to cart" });
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

// fetching all the cart of a user
router.get("/fetchCart", fetchusers, async (req, res) => {
  try {
    let userId = req.user.data.user.id;
    if (userId) {
      let items = await UserCart.find({ user: userId });
      res.json({ success: true, totalItems: items.length, items });
    } else {
      res.json({ success: false, msg: "Failed to fetch cart" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

router.post(
  "/changeProductQuantity-Increment/:id",
  fetchusers,
  async (req, res) => {
    try {
      let product = await UserCart.findById(req.params.id);
      if (!product) {
        res.status(401).json({ success: false, msg: "Failed to edit" });
      } else {
        product = await UserCart.findByIdAndUpdate(
          req.params.id,
          { $set: { quantity: product.quantity + 1 } },
          { new: true }
        );
        res
          .status(200)
          .json({ success: true, msg: "Quantity added", price: product.price });
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

router.post(
  "/changeProductQuantity-Decrement/:id",
  fetchusers,
  async (req, res) => {
    try {
      let product = await UserCart.findById(req.params.id);
      if (!product) {
        res.status(401).json({ success: false, msg: "Failed to edit" });
      } else {
        product = await UserCart.findByIdAndUpdate(
          req.params.id,
          { $set: { quantity: product.quantity - 1 } },
          { new: true }
        );
        res
          .status(200)
          .json({ success: true, msg: "Quantity added", price: product.price });
      }
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);
//detele user cart in one click
router.delete("/deleteCart/:id", fetchusers, async (req, res) => {
  try {
    let cart = await UserCart.findById(req.params.id);
    if (!cart) {
      res.json({ success: false, msg: "No item found to delete" });
    } else {
      cart = await UserCart.findByIdAndRemove(req.params.id);
      res.json({ success: true, msg: "Item deleted successfully" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});
module.exports = router;
