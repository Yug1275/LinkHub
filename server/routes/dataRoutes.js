const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { exportData, importData } = require("../controllers/dataController");

router.get("/export", authMiddleware, exportData);
router.post("/import", authMiddleware, importData);

module.exports = router;
