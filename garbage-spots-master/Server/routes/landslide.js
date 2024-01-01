"use strict";

const express  = require("express"),                 // Express module
      { body } = require("express-validator/check"); // Module for validating the data

const landslideController = require("../controllers/landslide"), // Controller module
      isAuth              = require("../middleware/is-auth");    // Authorization checking middleware


// Xác thực dữ liệu được gửi cùng với yêu cầu đăng bài
const postValidation = [
    body("coordinates")
        .not().isEmpty().withMessage("Bạn phải chỉ định tọa độ của điểm rác"),
    body("type")
        .not().isEmpty().withMessage("Bạn phải chỉ định tọa độ của điểm rác."),
    body("notes")
        .trim()
        .escape()
];

// Xác thực dữ liệu được gửi với yêu cầu đặt
const putValidation = [
    body("type")
        .not().isEmpty().withMessage("Bạn phải chỉ định tọa độ của điểm rác."),
    body("notes")
        .trim()
        .escape()
];

const patchValidation = [
    body("preciseCoordinates")
        .not().isEmpty().withMessage("Bạn phải chỉ định tọa độ của điểm rác")
];


// Create a router
const router = express.Router();


// GET /landslide/get-all
router.get("/get-all", landslideController.getLandslides);

// GET /landslide/user/:userId
router.get("/user/:userId", isAuth, landslideController.getUserLandslides);

// GET /landslide/:landslideId
router.get("/:landslideId", isAuth, landslideController.getLandslide);

// POST /landslide/post
router.post("/post", isAuth, postValidation, landslideController.postLandslide);

// PUT /landslide/:landslideId
router.put("/:landslideId", isAuth, putValidation, landslideController.updateLandslide);

router.patch("/:landslideId/precise-coordinates", isAuth, patchValidation, landslideController.addPreciseCoordinates);

// DELETE /landslide/:landslideId
router.delete("/:landslideId", isAuth, landslideController.deleteLandslide);


// Export the routes
module.exports = router;
