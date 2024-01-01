"use strict";

// Built in modules for path manipulation
const fs   = require("fs"),
      path = require("path");

const Landslide            = require("../models/landslide"),     // Model
      User                 = require("../models/user"),          // Model of the user
      { validationResult } = require("express-validator/check"); // Module for retrieving the validation results


/* Retrieves all the garbage. */
exports.getLandslides = (req, res, next) => {

    // Tìm tất cả rác
    Landslide.find({})
        .then(landslides => {

            // Gửi phản hồi thành công
            res.status(200).json({ message: "Fetched data successfully", landslides: landslides })

        })
        .catch(err => {

            console.error(err);

            // Nếu lỗi không có mã trạng thái, hãy gán 500 cho nó
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Gọi phần mềm trung gian tiếp theo
            next(err);

        });

};


/* Truy xuất tất cả rác được ánh xạ bởi người dùng. */
exports.getUserLandslides = (req, res, next) => {

    // Trích xuất id từ mẫu yêu cầu
    const id = req.params.userId;

    // Nếu id của người dùng không phải là id của người gọi, hãy báo lỗi 401
    if (id !== req.userId) {
        const error      = new Error("Not authorized.");
        error.statusCode = 401;
        throw error;
    }

    // Tìm tất cả rác của người dùng chưa được đánh dấu để xóa
    Landslide.find({ user: id, markedForDeletion: false })
        .then(landslides => {

            // Gửi phản hồi thành công
            res.status(200).json({ message: "Fetched data successfully", landslides: landslides })

        })
        .catch(err => {

            console.error(err);

            // Nếu lỗi không có mã trạng thái, hãy gán 500 cho nó
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Gọi phần mềm trung gian tiếp theo
            next(err);

        });

};


/*Lấy một rác duy nhất. */
exports.getLandslide = (req, res, next) => {

    // Trích xuất id từ yêu cầu
    const id = req.params.landslideId;

   // Tìm rác theo id
    Landslide.findById(id)
        .then(landslide => {

            // Nếu không tìm thấy rác thì báo lỗi 404
            if (!landslide) {
                const error      = new Error("Could not find garbage.");
                error.statusCode = 404;
                throw error;
            }

            // Nếu người dùng đã ánh xạ rác không phải là người dùng đang gọi, hãy đưa ra lỗi 401
            if (landslide.user.toString() !== req.userId) {
                const error      = new Error("Not authorized.");
                error.statusCode = 401;
                throw error;
            }

            // Send a success response
            res.status(200).json({ message: "Garbage found!", landslide: landslide });

        })
        .catch(err => {

            console.error(err);

            // Nếu lỗi không có mã trạng thái, hãy gán 500 cho nó
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

           // Gọi phần mềm trung gian tiếp theo
            next(err);

        });

};


/* Chèn một rác mới vào cơ sở dữ liệu. */
exports.postLandslide = (req, res, next) => {

    // Trích xuất kết quả xác thực
    const errors = validationResult(req);

   // Nếu có một số lỗi xác thực, hãy đưa ra lỗi 422
    if (!errors.isEmpty()) {
        const error      = new Error("Garbage validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    //Nếu không có hình ảnh nào được chuyển theo yêu cầu, hãy báo lỗi 422
    if (!req.file) {
        const error      = new Error("Garbage validation failed. Entered data is incorrect.");
        error.errors     = [{ location: "body", msg: "You must provide a photo", param: "imageUrl", value: "" }];
        error.statusCode = 422;
        throw error;
    }

    // Tạo một rác mới
    const landslide = new Landslide({
        user               : req.userId,
        expert             : req.body.expert,
        coordinates        : JSON.parse(req.body.coordinates),
        coordinatesAccuracy: req.body.coordinatesAccuracy,
        altitude           : req.body.altitude,
        altitudeAccuracy   : req.body.altitudeAccuracy,
        type               : req.body.type,
        materialType       : req.body.materialType,
        hillPosition       : req.body.hillPosition,
        water              : req.body.water,
        vegetation         : req.body.vegetation,
        mitigation         : req.body.mitigation,
        mitigationList     : JSON.parse(req.body.mitigationList),
        monitoring         : req.body.monitoring,
        monitoringList     : JSON.parse(req.body.monitoringList),
        damages            : req.body.damages,
        damagesList        : JSON.parse(req.body.damagesList),
        notes              : req.body.notes,
        imageUrl           : req.file.path.replace("\\", "/")
    });

    //Lưu rác mới
    landslide.save()
        .then(() => {

            // Tìm người dùng đã lập bản đồ rác
            return User.findById(req.userId);

        })
        .then(user => {

            // Lưu rác giữa những người dùng
            user.landslides.push(landslide);

            // Cập nhật người dùng
            return user.save();

        })
        .then(() => {

            // Gửi phản hồi thành công
            res.status(201).json({ message: "Garbage created", landslide: landslide });

        })
        .catch(err => {

            console.error(err);

            // Nếu lỗi không có status code thì gán 500 cho nó
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Gọi phần mềm trung gian tiếp theo
            next(err);

        });

};


/* Cập nhật một điểm rác hiện có. */
exports.updateLandslide = (req, res, next) => {

   //Trích xuất id mẫu yêu cầu
    const id = req.params.landslideId;

    //Trích xuất kết quả xác thực
    const errors = validationResult(req);

    // Nếu có một số lỗi xác thực, hãy đưa ra lỗi 422
    if (!errors.isEmpty()) {
        const error      = new Error("Garbage validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    //Tìm rác theo id
    Landslide.findById(id)
        .then(landslide => {

            //Nếu không tìm thấy rác, hãy báo lỗi 404
            if (!landslide) {
                const error      = new Error("Could not find Garbage.");
                error.statusCode = 404;
                throw error;
            }

            // Nếu người dùng đã lập bản đồ rác không phải là người dùng đang gọi, hãy đưa ra lỗi 401
            if (landslide.user.toString() !== req.userId) {
                const error      = new Error("Not authorized.");
                error.statusCode = 401;
                throw error;
            }

            // Lưu các giá trị mới
            landslide.type           = req.body.type;
            landslide.materialType   = req.body.materialType;
            landslide.hillPosition   = req.body.hillPosition;
            landslide.water          = req.body.water;
            landslide.vegetation     = req.body.vegetation;
            landslide.mitigation     = req.body.mitigation;
            landslide.mitigationList = JSON.parse(req.body.mitigationList);
            landslide.monitoring     = req.body.monitoring;
            landslide.monitoringList = JSON.parse(req.body.monitoringList);
            landslide.damages        = req.body.damages;
            landslide.damagesList    = JSON.parse(req.body.damagesList);
            landslide.notes          = req.body.notes;

            // If a new photo is provided
            if (req.file) {

                // Delete the old one
                clearImage(landslide.imageUrl);

                // Đặt cái mới
                landslide.imageUrl = req.file.path.replace("\\", "/");

            }
            // Update the rác
            return landslide.save();

        })
        .then(result => {

            // Send a successful response
            res.status(200).json({ message: "Garbage updated.", landslide: result })

        })
        .catch(err => {

            console.error(err);

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Call the next middleware
            next(err);

        });

};

exports.addPreciseCoordinates = (req, res, next) => {

    if (!req.isAdmin) {
        const error      = new Error("Forbidden.");
        error.statusCode = 403;
        throw error;
    }

    // Extract the id form the request
    const id = req.params.landslideId;

    // Extract the validation results
    const errors = validationResult(req);

    // If there are some validation errors, throw a 422 error
    if (!errors.isEmpty()) {
        const error      = new Error("Garbage validation failed. Entered data is incorrect.");
        error.errors     = errors.array();
        error.statusCode = 422;
        throw error;
    }

    // Find the garbage by id
    Landslide.findById(id)
        .then(landslide => {

            // If no garbage is found, throw a 404 error
            if (!landslide) {
                const error      = new Error("Could not find Garbage.");
                error.statusCode = 404;
                throw error;
            }

            // Save the new values
            landslide.preciseCoordinates = req.body.preciseCoordinates;

            // Update the landslide
            return landslide.save();

        })
        .then(result => {

            // Send a successful response
            res.status(200).json({ message: "Garbage updated.", landslide: result })

        })
        .catch(err => {

            console.error(err);

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Call the next middleware
            next(err);

        });

};


/* Deletes a garbage from the database. The entry will not be removed, it will just be marked for deletion. */
exports.deleteLandslide = (req, res, next) => {

    // Extract the id form the request
    const id = req.params.landslideId;

    // Find the garbage by id
    Landslide.findById(id)
        .then(landslide => {

            // If no garbage is found, throw a 404 error
            if (!landslide) {
                const error      = new Error("Could not find Garbage.");
                error.statusCode = 404;
                throw error;
            }

            // If the user who has mapped the garbage is not the calling user, throw a 401 error
            if (landslide.user.toString() !== req.userId) {
                const error      = new Error("Not authorized.");
                error.statusCode = 401;
                throw error;
            }

            // Mark the entry for deletion
            landslide.markedForDeletion = true;

            // Update the landslide
            return landslide.save();

        })
        .then(() => {

            // Send a success response
            res.status(200).json({ message: "Garbage successfully deleted." });

        })
        .catch(err => {

            console.error(err);

            // If the error does not have a status code, assign 500 to it
            if (!err.statusCode) {
                err.statusCode = 500;
                err.errors     = ["Something went wrong on the server."];
            }

            // Call the next middleware
            next(err);

        });

};


/* Utility function for deleting an image from the local storage */
const clearImage = filePath => {

    // Compute the complete path
    filePath = path.join(__dirname, "..", filePath);

    // Remove the image
    fs.unlink(filePath, err => {console.error(err)});

};
