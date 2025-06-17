import FrontOffice from "../models/FrontOffice.js";
import Salesmanager from "../models/Salesmanager.js";
import Executive from "../models/Executive.js";
import Billing from "../models/Billing.js";
import Booking from "../models/Booking.js";
import Purchase from "../models/Purchase.js";
import Agency from "../models/Agency.js";
import CustomerCare from "../models/CustomerCare.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateOTP, sendOTPEmail } from "../Utils/Otp.js";

// Helper function to find user by email across all models
const findUserByEmail = async (email) => {
  let user = await FrontOffice.findOne({ email }); 
  if (!user) user = await Salesmanager.findOne({ email });
  if (!user) user = await Executive.findOne({ email });
  if (!user) user = await Billing.findOne({ email });
  if (!user) user = await Booking.findOne({ email });
  if (!user) user = await Purchase.findOne({ email });
  if (!user) user = await Agency.findOne({ email });
  if (!user) user = await CustomerCare.findOne({ email });

  return user;
};

//_______________TOKEN CREATION_______________
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "15d",
    }
  );
};

//_______________LOGIN_______________
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email across all models
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      status: true,
      message: "Successfully logged in",
      token,
      data: user,
      role: user.role,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: false, message: "Failed to login" });
  }
};

// _______________VERIFYOTP_______________
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find user by email across all models
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update the user's authentication status and clear the OTP fields
    user.authentication = true;
    user.otp = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// _______________RESET PASSWORD_______________
export const resetPassword = async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;
  try {
    // Find user by email across all models
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP matches
    if (user.verifyotp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password and clear OTP fields
    user.password = hashedPassword;
    user.verifyotp = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// _______________COMPANY-REGISTRATION_______________
export const registerCompany = async (req, res) => {
  const {
    name,
    email,
    password,
    country, 
    state,
    district,
    pincode,
    landLineNumber,
    mobileNumber,
    logo,
    gstNumber,            // Include GST Number
    buildingName,         // Include Building Name
    streetOrLocality,     // Include Street/Locality
  } = req.body;

  try {
    // Check if email already exists
    const user = await findUserByEmail(email);

    if (user) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if phone number already exists
    const phoneNumberExists = await Agency.findOne({ mobileNumber });

    if (phoneNumberExists) {
      return res.status(400).json({ message: "Mobile number already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();

    // Create a new company instance
    const newAgency = new Agency({
      name,
      email,
      password: hashedPassword,
      country,
      state,
      district,
      pincode,
      landLineNumber,
      mobileNumber,
      logo,
      gstNumber,            // Store GST Number
      buildingName,         // Store Building Name
      streetOrLocality,     // Store Street/Locality
      authentication: false,
      otp,
    });

    // Save the company to the database
    await newAgency.save();

    // Send OTP email (adjust this part based on your email sending logic)
    sendOTPEmail(email, otp);

    res.status(201).json({ message: "OTP sent to registered email" });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } already exists`,
      });
    }

    res.status(500).json({ message: "Server error", error: error.message });
    console.log(error.message);
  }
};

// ______________SEND VERIFICATION OTP______________
export const sendVerificationOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Find user by email across all models
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in the user's document
    user.verifyotp = otp;
    await user.save();

    // Send OTP email
    sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent to registered email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
