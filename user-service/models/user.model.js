import mongoose from "mongoose";
import argon2 from "argon2";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        select: false,
        trim: true,
        minlength: [6, "Password must be at least 6 characters long"]
    },
    profilePic: {
        type: String,
        default: ""
    }
})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return
    }
    this.password = await argon2.hash(this.password)
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await argon2.verify(this.password, password);
};

const User = mongoose.model("User", userSchema)

export default User