import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    console.log("🔵 Register API hit");
    console.log("BODY:", req.body); // 🔥 DEBUG

    const { name, email, password } = req.body;

    // ✅ Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log("✅ User saved:", user); // 🔥 DEBUG

    // ✅ Remove password from response
    const { password: pwd, ...userData } = user._doc;

    res.status(201).json(userData);

  } catch (error) {
    console.error("❌ Register Error:", error); // 🔥 DEBUG
    res.status(500).json({ message: "Server error" });
  }
};


// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    console.log("🟢 Login API hit");
    console.log("BODY:", req.body);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ ADD THIS BLOCK (VERY IMPORTANT)
    if (user.isGoogleUser) {
      return res.status(400).json({
        message: "Please login with Google",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: pwd, ...userData } = user._doc;

    res.json({
      token,
      user: userData,
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
}; 

// ================= GOOGLE AUTH =================
export const googleAuth = async (req, res) => {
  try {
    const { name, email, photo } = req.body;

    let user = await User.findOne({ email });

    // ✅ If user exists but is NOT Google user
   if (user && !user.isGoogleUser) {
  // 🔥 Convert existing user to Google user
  user.isGoogleUser = true;
  user.photo = photo || user.photo;
  await user.save();
}

    // ✅ Create user if not exists
    if (!user) {
      user = await User.create({
        name,
        email,
        photo,
        isGoogleUser: true,
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: pwd, ...userData } = user._doc;

    res.json({
      token,
      user: userData,
    });

  } catch (error) {
    console.error("❌ Google Auth Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};