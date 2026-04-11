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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ REMOVE PASSWORD (IMPORTANT)
    const { password: pwd, ...userData } = user._doc;

    // ✅ SEND BOTH TOKEN + USER
    res.json({
      token,
      user: userData,
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};