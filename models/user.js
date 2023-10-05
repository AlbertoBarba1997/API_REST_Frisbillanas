const { Schema, model} =require("mongoose");

const UserSchema = Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        default: 2
    },
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: "default_avatar.png"
    },
    dni: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    phone: {
        type: String,
        required: true
    },

})

module.exports = model("User" , UserSchema, "users");
