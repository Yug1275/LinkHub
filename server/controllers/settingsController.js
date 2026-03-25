const Settings = require("../models/Settings");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const soundUploadDir = path.join(__dirname, "..", "uploads", "sounds");
if (!fs.existsSync(soundUploadDir)) {
  fs.mkdirSync(soundUploadDir, { recursive: true });
}

const soundStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, soundUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const soundFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/webm",
    "audio/mp4",
    "audio/x-m4a",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only MP3, WAV, OGG, M4A, or WebM audio files are allowed"), false);
  }
};

const soundUpload = multer({
  storage: soundStorage,
  fileFilter: soundFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

exports.uploadPomodoroSound = [
  soundUpload.single("sound"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const soundPath = `/uploads/sounds/${req.file.filename}`;
      let settings = await Settings.findOne({ userId: req.user.id });

      if (!settings) {
        settings = await Settings.create({ userId: req.user.id });
      }

      const previousSound = settings.pomodoro?.alarmSound;
      if (previousSound && previousSound.startsWith("/uploads/sounds/")) {
        const oldFilename = path.basename(previousSound);
        const oldAbsolutePath = path.join(soundUploadDir, oldFilename);
        if (fs.existsSync(oldAbsolutePath)) {
          fs.unlinkSync(oldAbsolutePath);
        }
      }

      settings.pomodoro = {
        workMinutes: settings.pomodoro?.workMinutes || 25,
        breakMinutes: settings.pomodoro?.breakMinutes || 5,
        alarmSound: soundPath,
      };

      await settings.save();

      return res.json({
        message: "Pomodoro alarm sound uploaded successfully",
        alarmSound: soundPath,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
];

exports.getSettings = async (req, res) => {

  let settings = await Settings.findOne({
    userId: req.user.id
  });

  if (!settings) {
    settings = await Settings.create({
      userId: req.user.id
    });
  }

  if (!settings.pomodoro) {
    settings.pomodoro = {
      workMinutes: 25,
      breakMinutes: 5,
      alarmSound: "",
    };
    await settings.save();
  }

  res.json(settings);
};

exports.updateSettings = async (req, res) => {

  const settings = await Settings.findOneAndUpdate(
    { userId: req.user.id },
    req.body,
    { returnDocument: "after", upsert: true }
  );

  res.json(settings);
};