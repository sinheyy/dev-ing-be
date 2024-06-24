const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const USER_DEFAULT_IMAGE = process.env.USER_DEFAULT_IMAGE;
const formatDateTime = require("../utils/formatDateTime");

const stackEnum = [
    "Python",
    "C",
    "C++",
    "Java",
    "C#",
    "Javascript",
    "TypeScript",
    "R",
    "Go",
    "Object-C",
];

const rankEnum = [
    "Entry",
    "Bronze",
    "Silver",
    "Gold",
    "Platinum",
    "Diamond",
    "Master",
    "Challenger",
];

const userSchema = Schema({
    userName: { type: String, required: true },
    nickName: { type: String, unique: true },
    userId: {
        type: String,
        default: function () {
            return this._id.toString();
        },
        unique: true,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: USER_DEFAULT_IMAGE },
    description: { type: String, default: "" },
    gender: { type: String, required: true },
    rank: { type: String, enum: rankEnum, default: "Entry" },
    stacks: [{ type: String, default: [] }],
    following: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    followers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
    isDelete: { type: Boolean, default: false },
    isBlock: { type: Boolean, default: false },
    level: { type: String, default: "user" },
    report: { type: Number, default: 0 },
    createAt: { type: Date, default: Date.now },
});

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.updateAt;
    delete obj.__v;
    obj.createAt = formatDateTime(obj.createAt); // createAt 포맷팅
    return obj;
};

userSchema.methods.generateToken = async function () {
    const token = await jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
        expiresIn: "1d",
    });
    return token;
};

userSchema.methods.follow = async function (userId) {
    if (!this.following.includes(userId)) {
        this.following.push(userId);
        await this.save();
    }
};

userSchema.methods.unfollow = async function (userId) {
    this.following = this.following.filter(
        (followingId) => followingId.toString() !== userId.toString()
    );
    await this.save();
};

userSchema.methods.addReport = async function (userId) {
    this.report += 1;
    if (this.report >= 10) this.isBlock = true;
    await this.save();
};

const User = mongoose.model("User", userSchema);

module.exports = User;
