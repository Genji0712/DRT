"use strict";

const mongoose = require("mongoose"), // Nhập mô-đun để xử lý db
      Schema   = mongoose.Schema;     // Lưu đối tượng "lược đồ"

// Tạo đối tượng mô hình một điểm rác
const landslideSchema = new Schema({
    user               : { type: Schema.Types.ObjectId, ref: "User" },
    markedForDeletion  : { type: Boolean, default: false },
    checked            : { type: Boolean, default: false },
    expert             : Boolean,
    coordinates        : [Number],
    preciseCoordinates : [Number],
    coordinatesAccuracy: Number,
    altitude           : Number,
    altitudeAccuracy   : Number,
    type               : String,
    materialType       : String,
    water              : String,
    mitigation         : String,
    imageUrl           : String
}, { timestamps: true });

// Xuất mô hình
module.exports = mongoose.model("Garbage", landslideSchema);
