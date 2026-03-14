const User = require("../models/User");

exports.signup = async (req, res) => {

  try {

    const { name, email, password } = req.body;

    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    res.json({ message: "User created successfully" });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

};