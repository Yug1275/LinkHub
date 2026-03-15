const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getMe, uploadProfileImage } = require("../controllers/userController");

router.get("/me", authMiddleware, getMe);
router.post("/upload-profile-image", authMiddleware, uploadProfileImage);

module.exports = router;
