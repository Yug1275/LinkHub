const express = require("express");
const router = express.Router();

const {
  getSettings,
  updateSettings,
  uploadPomodoroSound
} = require("../controllers/settingsController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getSettings);

router.put("/", authMiddleware, updateSettings);
router.post("/pomodoro-sound", authMiddleware, uploadPomodoroSound);

module.exports = router;