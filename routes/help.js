const mongoose = require("mongoose");
const express = require("express");
const fetchAdmin = require("../middleware/fetchadmin");
const Help = require("../model/Help");
const router = express.Router();

router.post("/post-help", fetchAdmin, async (req, res) => {
  try {
    const { question, answer } = req.body;
    await Help.create({
      question,
      answer,
    });
    res.status(200).json({ success: true, msg: "Help added successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});

router.get("/fetch-help", async (req, res) => {
  try {
    const helpData = await Help.find();
    if (!helpData || helpData.length === 0) {
      res.status(400).json({ success: false, msg: "No result found" });
    } else {
      res.status(200).json({ success: true, data: helpData });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});
router.get("/search-help", async (req, res) => {
  try {
    const query = req.query.q;
    const results = await Help.find({ $text: { $search: query } });
    if (results.length === 0 || !results) {
      res.status(400).json({
        success: false,
        query: query,
        msg: "No results found",
      });
    } else {
      res.status(200).json({
        success: true,
        query: query,
        results,
      });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});
router.get("/help/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const help = await Help.findById(id);
    if (!help || help.length <= 0) {
      res.status(400).json({
        success: false,
        msg: "Id not found",
      });
    } else {
      res.status(200).json({
        success: true,
        query: help.question,
        help,
      });
    }
  } catch (error) {
    return res.status(400).json({ success: false, msg: error.message });
  }
});
module.exports = router;
