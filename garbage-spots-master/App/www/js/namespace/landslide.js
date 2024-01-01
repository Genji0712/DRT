"use strict";

const landslide = {

    /** Icon rác lưu trên server. */
    _iconRemote: L.icon({
        iconUrl        : "img/ls-marker-remote.png",            // The url of the icon
        iconRetinaUrl  : "img/ls-marker-remote-2x.png",         // The url of the icon for retina displays
        shadowUrl      : "img/ls-marker-shadow.png",     // The url of the shadow
        shadowRetinaUrl: "img/ls-marker-shadow-2x.png",  // The url of the shadow for retina display
        iconSize       : [31, 37],                       // The size of the icon
        shadowSize     : [31, 19],                       // The size of the shadow
        iconAnchor     : [31, 37],                       // The position of the "tip" of the icon
        shadowAnchor   : [18, 18]                        // The position of the shadow anchor
    }),

   /** Biểu tượng rác được lưu trên cơ sở dữ liệu cục bộ. */
    _iconLocal: L.icon({
        iconUrl        : "img/ls-marker-local.png",            // The url of the icon
        iconRetinaUrl  : "img/ls-marker-local-2x.png",         // The url of the icon for retina displays
        shadowUrl      : "img/ls-marker-shadow.png",     // The url of the shadow
        shadowRetinaUrl: "img/ls-marker-shadow-2x.png",  // The url of the shadow for retina display
        iconSize       : [31, 37],                       // The size of the icon
        shadowSize     : [31, 19],                       // The size of the shadow
        iconAnchor     : [31, 37],                       // The position of the "tip" of the icon
        shadowAnchor   : [18, 18]                        // The position of the shadow anchor
    }),


    /** Mảng chứa tất cả các điểm đánh dấu hiện có trên bản đồ tương ứng với điểm rác ở xa. */
    remoteMarkers: [],

    /** Mảng chứa tất cả các điểm đánh dấu hiện có trên bản đồ tương ứng với các điểm rác cục bộ. */
    localMarkers: [],


  /**
       * Hiển thị một điểm rác như một điểm đánh dấu trên bản đồ.
       *
       * @param {string} id - Id của điểm rác.
       * @param {number[]} tọa độ - Tọa độ của điểm rác.
       * @param {number[]} precisionCoordins - Tọa độ chính xác của điểm rác
       * @param {boolean} isLocal - Đúng nếu điểm rác được lưu cục bộ.
       */
    show: (id, coordinates, preciseCoordinates, isLocal) => {

        console.log("Showing " + id);

        let marker;

        if (preciseCoordinates && preciseCoordinates[0] !== undefined && preciseCoordinates[1] !== undefined)
            marker = L.marker(preciseCoordinates, { icon: landslide._iconRemote, draggable: false });
        else
            marker = L.marker(coordinates, { icon: landslide._iconRemote, draggable: false });

        console.log(marker);

      // Đặt id của điểm đánh dấu
        marker._id = id;

        // Khi người dùng click vào mốc mở thông tin điểm rác
        marker.on("click", () => InfoActivity.getInstance().open(id, isLocal));

        // Thêm điểm đánh dấu vào lớp bản đồ
        MapActivity.getInstance().markersLayer.addLayer(marker);

       // Nếu điểm rác cục bộ, hãy thay đổi biểu tượng điểm đánh dấu và đẩy nó vào mảng điểm đánh dấu cục bộ
        if (isLocal) {

            // Change the icon
            marker.setIcon(landslide._iconLocal);

            // Thêm đánh dấu vào mảng
            landslide.localMarkers.push(marker);

        }

        // Khác thêm điểm đánh dấu vào mảng từ xa
        else landslide.remoteMarkers.push(marker);

    },

    /** Truy xuất và hiển thị tất cả các điểm rác của người dùng hiện đang đăng nhập trên bản đồ. */
    showAll: () => {

        // Xóa tất cả các điểm đánh dấu khỏi bản đồ
        MapActivity.getInstance().markersLayer.clearLayers();

        // Làm trống các mảng đánh dấu
        landslide.remoteMarkers = [];
        landslide.localMarkers  = [];

        // Ẩn thông báo đồng bộ
        $("#sync-notification").hide();


        // Truy xuất các điểm rác trong cơ sở dữ liệu cục bộ
        const request = app.db.transaction("landslides", "readwrite").objectStore("landslides").getAll();

        // Kích hoạt nếu xảy ra lỗi
        request.onerror = err => {

            console.error("Error getting data", err);

          // Cảnh báo người dùng
            utils.createAlert("", i18next.t("dialogs.getLocalLsError"), i18next.t("dialogs.btnOk"));

        };

        // Được kích hoạt nếu yêu cầu thành công
        request.onsuccess = e => {

           // Hiển thị các điểm rác
            e.target.result.forEach(ls => landslide.show(ls._id, ls.coordinates, ls.preciseCoordinates, true));

           // Nếu có một số điểm rác trong cơ sở dữ liệu cục bộ, hãy hiển thị thông báo đồng bộ hóa
            if (landslide.localMarkers.length !== 0) $("#sync-notification").show();

        };

        // Nếu ứng dụng ngoại tuyến hoặc người dùng là khách, hãy quay lại
        if (!navigator.onLine || app.isGuest) return;


        // Nếu phiên hết hạn, hãy quay lại
        if (utils.isTokenExpired()) return;

        // Lấy id của người dùng hiện đang đăng nhập
        const id = LoginActivity.getInstance().userId;

       // Lấy từ máy chủ tất cả điểm rác của người dùng đã đăng nhập
        fetch(
            `${settings.serverUrl}/landslide/user/${id}`,
            { headers: { Authorization: `Bearer ${LoginActivity.getInstance().token}` } }
        )
            .then(res => {

               // Nếu máy chủ phản hồi hơn 200 (thành công), sẽ báo lỗi
                if (res.status !== 200) {
                    const err = new Error();
                    err.code  = res.status;
                    throw err;
                }

             // Phân tích cú pháp phản hồi json
                return res.json();

            })
            .then(data => {

                // Hiển thị từng điểm rác được lấy
                data.landslides.forEach(d => landslide.show(d._id, d.coordinates, d.preciseCoordinates, false));

            })
            .catch(err => {

                console.error(err);

                // Thông báo lỗi cho người dùng

               // Không được phép
                if (err.code === 401)
                    utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getLandslides401"), i18next.t("dialogs.btnOk"));

                // Lỗi máy chủ chung
                else
                    utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getLandslides500"), i18next.t("dialogs.btnOk"));

            });

    },


  /**
       * Lấy từ máy chủ thông tin về một điểm rác.
       *
       * @param {string} id - Id của điểm rác.
       * @param {boolean} isLocal - Đúng nếu điểm rác được lưu trong cơ sở dữ liệu cục bộ.
       * @param {(boolean|null)} [showError=true] - Đúng nếu một lỗi cuối cùng phải được hiển thị.
       * @returns {Promise<object>} Một lời hứa chứa dữ liệu về điểm rác
       */
    get: (id, isLocal, showError = true) => {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Nếu rác được lưu trong cơ sở dữ liệu cục bộ
            if (isLocal) {

                // Gửi yêu cầu đến cơ sở dữ liệu cục bộ
                const request = app.db
                    .transaction("landslides", "readwrite")
                    .objectStore("landslides")
                    .get(id);

                // Kích hoạt nếu xảy ra lỗi
                request.onerror = err => {

                    console.error("Retrieving ls failed", err);

                    // Nếu không hiển thị lỗi thì return
                    if (!showError) reject();

                    // Đóng bộ nạp
                    utils.closeLoader();

                    // Cảnh báo người dùng
                    utils.createAlert("", i18next.t("dialogs.info.getLocalLsError"), i18next.t("dialogs.btnOk"));

                    // Reject the promise
                    reject();

                };

                // Kích hoạt khi yêu cầu thành công
                request.onsuccess = e => {

                    // Giải quyết lời hứa
                    resolve(e.target.result);

                }

            }

            // Else
            else {

                //Nếu phiên hết hạn
                if (utils.isTokenExpired()) {

                    // Reject the promise
                    reject();

                    // Return
                    return;

                }

             // Gửi yêu cầu đến máy chủ để lấy dữ liệu
                fetch(
                    `${settings.serverUrl}/landslide/${id}`,
                    { headers: { Authorization: `Bearer ${LoginActivity.getInstance().token}` } }
                )
                    .then(res => {

                        // If the server responds with something over than 200 (success), throw an error
                        if (res.status !== 200) {
                            const err = new Error();
                            err.code  = res.status;
                            throw err;
                        }

                        // Parse the json response
                        return res.json();

                    })
                    .then(data => {

                        // Resolve the promise
                        resolve(data.landslide);

                    })
                    .catch(err => {

                        console.error(err);

                        // If the error does not have to be shown, return
                        if (!showError) reject();

                        // Close the loader
                        utils.closeLoader();

                        // Alert the user of the error
                        switch (err.code) {

                            // Unauthorized
                            case 401:
                                utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getLandslide401"), i18next.t("dialogs.btnOk"));
                                break;

                            // Not found
                            case 404:
                                utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.getLandslide404"), i18next.t("dialogs.btnOk"));
                                break;

                            // Generic server error
                            default:
                                utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getLandslide500"), i18next.t("dialogs.btnOk"));
                                break;

                        }

                        // Reject the promise
                        reject();

                    });

            }

        });

    },



    post: (formData, showError = true) => {

        // Return a new promise
        return new Promise((resolve, reject) => {

            // If the session is expired
            if (utils.isTokenExpired()) {

                // Reject the promise
                reject();

                // Return
                return;

            }

            // Send a request to the server to insert a new garbage
            fetch(
                `${settings.serverUrl}/landslide/post`,
                {
                    method : "POST",
                    headers: { Authorization: `Bearer ${LoginActivity.getInstance().token}` },
                    body   : formData
                }
            )
                .then(res => {

                    // If the server responds with something over than 201 (insert success), throw an error
                    if (res.status !== 201) {
                        const err = new Error();
                        err.code  = res.status;
                        throw err;
                    }

                    // Parse the json response
                    return res.json();

                })
                .then(data => {

                    // Resolve the promise
                    resolve({ id: data.landslide._id, coords: data.landslide.coordinates });

                })
                .catch(err => {

                    console.error(err);

                    // If the error does not have to be shown, return
                    if (!showError) reject();

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.postLandslide401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Wrong data
                        case 422:
                            utils.logOrToast(i18next.t("messages.postLandslide422"), "long");
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.postLandslide500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },

  /**
       * Lưu một điểm rác mới vào cơ sở dữ liệu cục bộ bằng API IndexedDB.
       *
       * @param {object} data - Dữ liệu điểm rác.
       * @return {Promise<object>} Một lời hứa chứa id và tọa độ của điểm rác
       */
    postLocal: data => {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Send a request to the local db to save the landslide
            const request = app.db
                .transaction("landslides", "readwrite")
                .objectStore("landslides")
                .add(data);

            // Fired if an error occurs
            request.onerror = err => {

                console.log("An error occurred during the insert", err);

                // Close the loader
                utils.closeLoader();

                // Alert the user
                utils.createAlert("", i18next.t("dialogs.insert.insertError"), i18next.t("dialogs.btnOk"));

                // Reject the promise
                reject();

            };

            // Fired if the request is successful
            request.onsuccess = () => {

                console.log("Insert done");

                // Resolve the promise
                resolve({ id: data._id, coords: data.coordinates });

            };

        });

    },


   /**
        * Gửi tất cả các điểm rác trong cơ sở dữ liệu cục bộ lên máy chủ.
        *
        * @return {Promise<object>} Một lời hứa chứa kết quả của hoạt động.
        */
    sync: async () => {

        // Lưu số lượng rác cục bộ
        const total = landslide.localMarkers.length;

       // Khởi tạo số lần thành công, chèn lỗi và xóa lỗi
        let success      = 0,
            insertErrors = 0,
            deleteErrors = 0;

        // Đối với từng điểm rác cục bộ
        for (let i = 0; i < total; i++) {

            console.log(`Start ${i}`);

            // Lấy điểm rác
            await landslide.get(landslide.localMarkers[i]._id, true, false)
                .then(async ls => {

                    console.log(`Found ${i}`);

                   // Tạo đối tượng formData
                    const formData = new FormData();

                    //Nối vào formData tất cả dữ liệu
                    formData.append("expert", ls.expert.toString());
                    formData.append("coordinates", JSON.stringify(ls.coordinates));
                    formData.append("coordinatesAccuracy", ls.coordinatesAccuracy);
                    formData.append("altitude", ls.altitude);
                    formData.append("altitudeAccuracy", ls.altitudeAccuracy);
                    formData.append("type", ls.type);
                    formData.append("materialType", ls.materialType);
                    formData.append("hillPosition", ls.hillPosition);
                    formData.append("water", ls.water);
                    formData.append("vegetation", ls.vegetation);
                    formData.append("mitigation", ls.mitigation);
                    formData.append("mitigationList", JSON.stringify(ls.mitigationList));
                    formData.append("monitoring", ls.monitoring);
                    formData.append("monitoringList", JSON.stringify(ls.monitoringList));
                    formData.append("damages", ls.damages);
                    formData.append("damagesList", JSON.stringify(ls.damagesList));
                    formData.append("notes", ls.notes);

                    // Nối hình ảnh
                    await utils.appendFile(formData, ls.imageUrl, false)
                        .then(async formData => {

                            // Post
                            return await landslide.post(formData, false);

                        })
                        .then(async () => {

                            console.log(`Posted ${i}`);

                            // Delete the local
                            await landslide.delete(ls._id, true, ls.imageUrl, false)
                                .then(() => success++)        // If success, increment the successes counter
                                .catch(() => deleteErrors++); // If error, increment the delete errors counter

                        })
                        .catch(() => insertErrors++); // If error, increment the insert errors counter

                })
                .catch(() => insertErrors++); // If error, increment the insert errors counter

        }

        console.log("Done ls");

        // Return the results
        return { total: total, successes: success, insertErrors: insertErrors, deleteErrors: deleteErrors };

    },


   /**
        * Gửi yêu cầu đến máy chủ để cập nhật một điểm rác đã có vào cơ sở dữ liệu.
        *
        * @param {string} id - Id của điểm rác cần cập nhật
        * @param {FormData} formData - Một đối tượng FormData chứa dữ liệu về điểm rác.
        * @returns {Promise<object>} Một lời hứa chứa id của điểm rác
        */
    put: (id, formData) => {

        // Return a new promise
        return new Promise((resolve, reject) => {

            // Nếu phiên hết hạn
            if (utils.isTokenExpired()) {

                // Reject the promise
                reject();

                // Return
                return;

            }

            // Gửi yêu cầu đến máy chủ để chèn một vụ điểm rác mới
            fetch(
                `${settings.serverUrl}/landslide/${id}`,
                {
                    method : "PUT",
                    headers: { Authorization: `Bearer ${LoginActivity.getInstance().token}` },
                    body   : formData
                }
            )
                .then(res => {

                    // Nếu máy chủ phản hồi với thứ gì đó trên 200 (thành công), hãy đưa ra lỗi
                    if (res.status !== 200) {
                        const err = new Error();
                        err.code  = res.status;
                        throw err;
                    }

                    // Parse the json response
                    return res.json();

                })
                .then(data => {

                    // Giải quyết lời hứa
                    resolve({ id: data.landslide._id });

                })
                .catch(err => {

                    console.error(err);

                   // Đóng bộ nạp
                    utils.closeLoader();

                    // Thông báo lỗi cho người dùng
                    switch (err.code) {

                       // Không được phép
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.putLandslide401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Không tìm thấy
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.putLandslide404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Dữ liệu sai
                        case 422:
                            utils.logOrToast(i18next.t("messages.putLandslide422"), "long");
                            break;

                        // Lỗi máy chủ chung
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.putLandslide500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },

   /***
        * Cập nhật một điểm rác đã được lưu trong cơ sở dữ liệu cục bộ.
        *
        * @param {string} id - Id của điểm rác.
        * @param {object} data - Dữ liệu mới cần lưu.
        * @return {Promise<string>} - Một lời hứa chứa id của điểm rác
        */
    putLocal: (id, data) => {

        // Return a new promise
        return new Promise((resolve, reject) => {

            // Truy xuất điểm rác từ cơ sở dữ liệu cục bộ
            const getRequest = app.db
                .transaction("landslides", "readwrite")
                .objectStore("landslides")
                .get(id);

           // Kích hoạt nếu xảy ra lỗi
            getRequest.onerror = err => {

                console.error("Cannot get the landslide", err);

                // Đóng bộ nạp
                utils.closeLoader();

                // Cảnh báo người dùng
                utils.createAlert("", i18next.t("dialogs.insert.putLocalError"), i18next.t("dialogs.btnOk"));

                // Reject the promise
                reject();

            };

            getRequest.onsuccess = e => {

                // Hợp nhất kết quả và dữ liệu mới
                let ls = Object.assign(e.target.result, data);

                // Gửi yêu cầu đến cơ sở dữ liệu cục bộ
                const request = app.db
                    .transaction("landslides", "readwrite")
                    .objectStore("landslides")
                    .put(ls);

                //Kích hoạt nếu xảy ra lỗi
                request.onerror = err => {

                    console.log("An error occurred during the insert", err);

                    // Đóng bộ nạp
                    utils.closeLoader();

                   // Cảnh báo người dùng
                    utils.createAlert("", i18next.t("dialogs.insert.putLocalError"), i18next.t("dialogs.btnOk"));

                    // Từ chối lời hứa
                    reject();

                };

                // Kích hoạt khi yêu cầu thành công
                request.onsuccess = e => {
                // Giải quyết lời hứa
                    resolve({ id: e.target.result._id });

                };

            };

        });

    },


   /**
        * Xóa một điểm rác khỏi cơ sở dữ liệu và xóa nó khỏi bản đồ.
        *
        * @param {string} id - Id của điểm rác
        * @param {boolean} isLocal - Đúng nếu điểm rác được lưu trong cơ sở dữ liệu cục bộ.
        * @param {(string|null)} [localPhotoURL] - RL cục bộ của ảnh (chỉ có giá trị nếu điểm rác cục bộ).
        * @param {(boolean|null)} [showError=true] - Đúng nếu một lỗi cuối cùng phải được hiển thị.
        * @returns {Promise<>} Một lời hứa suông.
        */
    delete: (id, isLocal, localPhotoURL = null, showError = true) => {

        // Return a promise
        return new Promise((resolve, reject) => {

           // Nếu điểm rác được lưu trong cơ sở dữ liệu cục bộ
            if (isLocal) {

               // Gửi yêu cầu đến cơ sở dữ liệu cục bộ
                const request = app.db
                    .transaction("landslides", "readwrite")
                    .objectStore("landslides")
                    .delete(id);

                // Kích hoạt nếu xảy ra lỗi
                request.onerror = err => {

                    console.error("Deleting failed", err);

                    // Nếu không hiển thị lỗi thì return
                    if (!showError) reject();

                   // Đóng bộ nạp
                    utils.closeLoader();

                    // Cảnh báo người dùng
                    utils.createAlert("", i18next.t("dialogs.deleteLocalLsError"), i18next.t("dialogs.btnOk"));

                    // Từ chối lời hứa
                    reject();

                };

                // Kích hoạt khi yêu cầu thành công
                request.onsuccess = () => {

                  // Xóa điểm đánh dấu
                    landslide.removeMarker(id, true);

                    // Nếu không còn điểm rác nào trong cơ sở dữ liệu cục bộ, hãy ẩn thông báo đồng bộ hóa
                    if (landslide.localMarkers.length === 0) $("#sync-notification").hide();

                    // Xóa ảnh cục bộ
                    utils.deleteImage(localPhotoURL, showError)
                        .then(() => {

                            // Giải quyết lời hứa
                            resolve();

                        });

                    resolve();

                };

            }

            //Else
            else {

               // Nếu phiên hết hạn
                if (utils.isTokenExpired()) {

                    // Từ chối lời hứa
                    reject();

                    // Return
                    return;

                }

                // Gửi yêu cầu đến máy chủ để xóa điểm rác
                fetch(
                    `${settings.serverUrl}/landslide/${id}`,
                    {
                        method : "DELETE",
                        headers: { Authorization: `Bearer ${LoginActivity.getInstance().token}` }
                    }
                )
                    .then(res => {

                        // Nếu máy chủ phản hồi hơn 200 (thành công), sẽ báo lỗi
                        if (res.status !== 200) {
                            const err = new Error();
                            err.code  = res.status;
                            throw err;
                        }

                        //Xóa điểm đánh dấu
                        landslide.removeMarker(id, false);

                        //Giải quyết lời hứa
                        resolve();

                    })
                    .catch(err => {

                        console.error(err);

                        // Nếu không hiển thị lỗi thì return
                        if (!showError) reject();

                        //Đóng bộ nạp
                        utils.closeLoader();

                        //Thông báo lỗi cho người dùng
                        switch (err.code) {

                            // Không được phép
                            case 401:
                                utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.deleteLandslide401"), i18next.t("dialogs.btnOk"));
                                break;

                            // Không tìm thấy
                            case 404:
                                utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.deleteLandslide404"), i18next.t("dialogs.btnOk"));
                                break;

                            //Không tìm thấy
                            default:
                                utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.deleteLandslide500"), i18next.t("dialogs.btnOk"));
                                break;

                        }

                        // Từ chối lời hứa
                        reject();

                    });

            }

        });

    },

   /**
        * Xóa khỏi bản đồ điểm đánh dấu điểm rác
        *
        * @param {string} id - Id của điểm rác
        * @param {boolean} isLocal - Đúng nếu điểm rác được lưu trong cơ sở dữ liệu cục bộ.
        */
    removeMarker: (id, isLocal) => {

        // Hàm tiện ích để xóa điểm đánh dấu
        const clear = array => {

            // Tạo một mảng tạm thời
            let newMarkers = [];

            // Đối với mỗi điểm rác
            array.forEach(m => {

               // Nếu đó là điểm cần xóa, hãy xóa điểm đánh dấu tương ứng khỏi bản đồ
                if (m._id === id) MapActivity.getInstance().markersLayer.removeLayer(m);

                // Khác, đẩy điểm đánh dấu vào mảng tạm thời
                else newMarkers.push(m)

            });

            // Lưu mảng tạm thời làm mảng đánh dấu mới
            return newMarkers;

        };

        // Nếu điểm rác cục bộ, sử dụng mảng đánh dấu cục bộ
        if (isLocal) landslide.localMarkers = clear(landslide.localMarkers);

        // Khác, sử dụng mảng đánh dấu từ xa
        else landslide.remoteMarkers = clear(landslide.remoteMarkers);

    },

};
