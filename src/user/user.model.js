import { Schema, model } from "mongoose";

const userSchema = Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        maxLenght: [25, "Max is 25 characters"]
    },
    username: {
        type: String,
        required: [true, "Name is required"],
        maxLenght: [25, "Xant ve overcome 25 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minLenght: 8
    },
    role: {
        type: String,
        required: true,
        enum: ["ADMIN_ROLE", "USER_ROLE"],
    },
    status: {
        type: Boolean,
        default: true,
    },
},
    {
        timestamps: true,
        versionKey: false
    }
);

export default model('User', userSchema);