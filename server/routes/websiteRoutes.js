const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addWebsite,
  getWebsites,
  updateWebsite,
  deleteWebsite
} = require("../controllers/websiteController");


router.post("/", authMiddleware, addWebsite);

router.get("/", authMiddleware, getWebsites);

router.put("/:id", authMiddleware, updateWebsite);

router.delete("/:id", authMiddleware, deleteWebsite);

module.exports = router;