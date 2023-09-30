const express = require("express");
const fetchAdmin = require("../middleware/fetchadmin");
const Products = require("../model/Products");
const router = express.Router();
const multer = require("multer");
const fetchusers = require("../middleware/fetchuser");
const User = require("../model/User");
const moment = require("moment");
const SuggestedProduct = require("../model/SuggestedProduct");
const FeaturedProduct = require("../model/FeaturedProduct");
// const { body, validationResult } = require("express-validator");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./productImage");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}${file.originalname}`);
  },
});
const upload = multer({ storage: storage });
router.post(
  "/products",
  fetchAdmin,
  upload.array("productImage", 12),
  async (req, res) => {
    try {
      const {
        name,
        description,
        price,
        atStock,
        stockQuantity,
        category,
        color,
        size,
        ram,
        rom,
        discount,
      } = req.body;
      await Products.create({
        adminId: req.admin.id,
        name,
        description,
        price,
        atStock,
        stockQuantity,
        category,
        color,
        size,
        ram,
        rom,
        discount,
        productImage: req.files,
      });
      res
        .status(200)
        .json({ success: true, msg: "Product added successfully" });
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);

router.delete("/deleteProduct/:id", fetchAdmin, async (req, res) => {
  try {
    let products = await Products.findById(req.params.id);

    if (!products) {
      res.send({ success: false, msg: "Product Not Found" });
    } else {
      products = await Products.findByIdAndDelete(req.params.id);
      res.send({ success: true, msg: "Product deleted successfully" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

router.put("/editProduct/:id", fetchAdmin, async (req, res) => {
  try {
    const { name, description, price, stockQuantity, category } = req.body;
    let products = await Products.findById(req.params.id);
    if (!products) {
      res.json({ success: false, msg: "Product Not Found" });
    } else if (req.admin.id !== products.adminId.toString()) {
      res
        .status(401)
        .json({ success: false, msg: "You dont have access to edit this" });
    } else {
      products = await Products.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            name: name,
            description: description,
            price: price,
            stockQuantity: stockQuantity,
            category: category,
          },
        },
        { new: true }
      );
      res.json({ success: true, msg: "Product edited successfully" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

router.put("/editProductStock/:id", fetchAdmin, async (req, res) => {
  try {
    let products = await Products.findById(req.params.id);
    if (!products) {
      res.json({ success: false, msg: "Product Not Found" });
    } else if (req.admin.id !== products.adminId.toString()) {
      res
        .status(401)
        .json({ success: false, msg: "You dont have access to edit this" });
    } else {
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

//fetch all products
router.get("/All", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if no page parameter is provided
    const limit = 12;
    const offset = (page - 1) * limit;
    let products = await Products.find();
    Products.find()
      .skip(offset)
      .limit(limit)
      .exec((err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send("Internal server error");
        } else {
          res.json({
            success: true,
            totalItems: products.length,
            data: results,
          });
        }
      });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

//findMyCategories
router.get("/product-by-categories", async (req, res) => {
  try {
    let product = await Products.find({
      category: req.body.categories,
    });
    if (!product) {
      res.status(400).json({ success: true, data: "No Products found" });
    } else {
      res
        .status(200)
        .json({ success: true, totalItems: product.length, data: product });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

//ask question about product
router.post("/askQuestion/:id", fetchusers, async (req, res) => {
  try {
    let products = await Products.findById(req.params.id);
    let user = await User.findById(req.user.data.user.id).select("-password");
    if (products) {
      const newQuestion = {
        question: req.body.questions,
        askedBy: user,
        askedAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
      };
      products.questions.push(newQuestion);
      await products.save();
      res
        .status(200)
        .send({ success: true, msg: "Question added successfully" });
    } else {
      res.status(400).send({ success: false, msg: "Something went wrong" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

//Answer to questions
router.put("/updateQuestion/:id", async (req, res) => {
  try {
    let products = await Products.findById(req.params.id);
    if (products) {
      // Find the index of the question by ID
      const questionIndex = products.questions.findIndex(
        (question) => question._id.toString() === req.body.questionId
      );
      console.log(questionIndex);
      if (questionIndex !== -1) {
        // Update the desired property of the question
        products.questions[questionIndex].answer = req.body.newAnswer;
        await products.save();
        return res
          .status(200)
          .send({ success: true, msg: "Answer updated successfully" });
      } else {
        return res
          .status(400)
          .send({ success: false, msg: "Answer not found" });
      }
    } else {
      return res.status(400).send({ success: false, msg: "Product not found" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

//fetch product by their id
router.get("/fetchProduct/:id", async (req, res) => {
  try {
    let products = await Products.findById(req.params.id);
    if (!products) {
      res.status(400).json({ success: false, msg: "Something went wrong" });
    } else {
      res.status(200).json({
        success: true,
        totalQsn: products.questions.length,
        products: products,
      });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

router.post(
  "/suggested-product",
  fetchAdmin,
  upload.single("suggestedProduct"),
  async (req, res) => {
    try {
      const { name, price, color } = req.body;
      await SuggestedProduct.create({
        name,
        price,
        color,
        image: req.file.filename,
      });
      console.log(req.file);
      res.status(200).json({
        success: true,
        msg: "Product added successfully",
      });
    } catch (error) {
      return res.status(400).json({ success: false, msg: error.message });
    }
  }
);
router.get("/fetchSuggestedProduct", async (req, res) => {
  try {
    let suggestedProduct = await SuggestedProduct.find();
    if (!suggestedProduct) {
      res.status(400).json({
        success: false,
        msg: "failed to fetch",
      });
    } else {
      res.status(200).json({
        success: true,
        suggestedProduct,
      });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

//search products
router.get("/products/search", async (req, res) => {
  try {
    const query = req.query.q;
    const sort = req.query.sort;
    const results = await Products.find({ $text: { $search: query } }).sort({
      price: sort,
    });
    if (results.length === 0 || !results) {
      res.status(400).json({
        success: true,
        totalResults: results.length,
        query: query,
        msg: "No results found",
      });
    } else {
      res.status(200).json({
        success: true,
        totalResults: results.length,
        query: query,
        results,
      });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

router.post("/featureProduct", upload.single("feature"), async (req, res) => {
  try {
    const { title, description, price, discount, color, storage } = req.body;
    if (title === "" || description === "" || price === "") {
      res.status(400).json({
        success: false,
        msg: "Input field musn't be empty",
      });
    } else if (title.length < 50 || description.length < 50) {
      res.status(400).json({
        success: false,
        msg: "There must be atleast 100 characters and atleast 15 words",
      });
    } else {
      FeaturedProduct;
      let product = await FeaturedProduct.create({
        title,
        description,
        price,
        discount,
        color,
        storage,
        productImage: req.file.filename,
      });
      if (product) {
        res
          .status(200)
          .json({ success: true, msg: "Product featured successfully" });
      }
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});
router.get("/fetchFeatureProduct", async (req, res) => {
  try {
    let product = await FeaturedProduct.find();
    if (!product) {
      res
        .status(400)
        .json({ success: false, msg: "No Featured Product have been found" });
    } else {
      res.status(200).json({ success: true, product: product });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});
module.exports = router;
