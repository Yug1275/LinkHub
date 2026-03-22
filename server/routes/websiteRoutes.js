const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addWebsite,
  getWebsites,
  updateWebsite,
  deleteWebsite,
  deleteCategoryWebsites
} = require("../controllers/websiteController");


router.post("/", authMiddleware, addWebsite);

router.get("/", authMiddleware, getWebsites);

router.put("/:id", authMiddleware, updateWebsite);

router.delete("/category/:categoryName", authMiddleware, deleteCategoryWebsites);

router.delete("/:id", authMiddleware, deleteWebsite);

module.exports = router;