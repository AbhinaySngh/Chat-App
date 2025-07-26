import e from "express";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";


// Signup a new user
export const signup = async (req, res) => {
    const { email, fullName, password, profilePic, bio } = req.body;
    
    
    try {
        // Validate input
        if (!email || !fullName || !password || !bio) {
            return res.json({success: false, message: "Missing Details" });
        }
        // Check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.json({success: false, message: "Account already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName, email, password: hashedPassword, bio
        });

        const token = generateToken(newUser._id);

        res.json({
            success: true,
            userData: newUser,
            token,
            message: "Account created successfully"
        })
    
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false ,message: error.message });
    }
}

//  Controller to login a user
export const login = async (req,res) =>{
    try {
        const { email, password } = req.body;
        const userData = await User.findOne({ email });

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);

        if(!isPasswordCorrect) {
            return res.json({success: false, message: "Invalid Credentials"});
        }

        const token = generateToken(userData._id);

        res.json({
            success: true,
            userData,
            token,
            message: "Login successful"
        });
    } catch (error){
        console.log(error.message);
        res.json({success: false, message: error.message });
    }
}

// Controller to check if user is authenticated
export const checkAuth = (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
}

// Controller to update user profile
export const updateProfile = async (req, res) => {

    try {
        // Validate input
        const { fullName, bio, profilePic } = req.body;

        const userId = req.user._id;
        let updatededUser;

        if (!profilePic) {
            updatededUser = await User.findByIdAndUpdate(userId,{bio, fullName}, {new: true});
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatededUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true});
        }
        res.json({
            success: true,
            user: updatededUser,
            message: "Profile updated successfully"
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
}