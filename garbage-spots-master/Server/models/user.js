"use strict";

const mongoose = require("mongoose"), // Nhập mô-đun để xử lý db
      Schema   = mongoose.Schema;     // Lưu đối tượng "lược đồ"

// Tạo đối tượng mô hình một người dùng
const userSchema = new Schema({
    email                      : { type: String, unique: true },
    password                   : String,
    isAdmin                    : { type: Boolean, default: false },
    age                        : String,
    gender                     : String,
    occupation                 : String,
    isConfirmed                : { type: Boolean, default: false },
    landslides                 : [{ type: Schema.Types.ObjectId, ref: "Garbage" }],
    confirmEmailToken          : String,
    confirmEmailTokenExpiration: Date,
    resetPwToken               : String,
    resetPwTokenExpiration     : Date
}, { timestamps: true });

// Export the model
module.exports = mongoose.model("User", userSchema);
