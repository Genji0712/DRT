"use strict";


const user = {


   /**
        * Truy xuất thông tin về người dùng.
        *
        * @param {string} id - Id của người dùng.
        * @returns {Promise<object>} Một lời hứa chứa dữ liệu của người dùng.
        */
    get(id) {

        // Return a promise
        return new Promise((resolve, reject) => {

            // Nếu phiên hết hạn
            if (utils.isTokenExpired()) {

                // Reject the promise
                reject();

                // Return
                return;

            }

           // Gửi yêu cầu đến máy chủ để lấy dữ liệu
            fetch(
                `${settings.serverUrl}/profile/${id}`,
                { headers: { Authorization: `Bearer ${LoginActivity.getInstance().token}` } }
            )
                .then(res => {

                    // Nếu máy chủ phản hồi hơn 200 (thành công), sẽ báo lỗi
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
                    resolve(data.user);

                })
                .catch(err => {

                    console.error(err);

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user of the error
                    switch (err.code) {

                      // Không được phép
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getUser401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.getUser404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Lỗi máy chủ chung
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getUser500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },


 /**
      * Thay đổi email của người dùng.
      *
      * @param {string} id - Id của người dùng.
      * @param {string} newEmail - Thư mới.
      * @returns {Promise<>} - Một lời hứa suông.
      */
    putEmail(id, newEmail) {

        // Return a promise
        return new Promise((resolve, reject) => {

           // Nếu phiên hết hạn
            if (utils.isTokenExpired()) {

                // Reject the promise
                reject();

                // Return
                return;

            }

         // Gửi yêu cầu đến server thay đổi mail
            fetch(
                `${settings.serverUrl}/profile/${id}/change-email`,
                {
                    method : "PUT",
                    headers: {
                        Authorization : `Bearer ${LoginActivity.getInstance().token}`,
                        "Content-Type": "application/json"
                    },
                    body   : JSON.stringify({ email: newEmail })
                }
            )
                .then(res => {

                    // If the server responds with something over than 200 (success), throw an error
                    if (res.status !== 200) {
                        const err = new Error();
                        err.code  = res.status;
                        throw err;
                    }

                    // Resolve the promise
                    resolve();

                })
                .catch(err => {

                    console.error(err);

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.changeEmail401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Email already in use
                        case 409:
                            utils.logOrToast(i18next.t("messages.changeEmail409"), "long");
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.changeEmail404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Incorrect data
                        case 422:
                            utils.logOrToast(i18next.t("messages.changeEmail422"), "long");
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.changeEmail500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },


    /**
     * Change the password of the user.
     *
     * @param {string} id - The id of the user.
     * @param {string} oldPw - The old password.
     * @param {string} newPw - The new password.
     * @param {string} confirmPw - The repeated new password.
     * @returns {Promise<>} - An empty promise.
     */
    putPassword(id, oldPw, newPw, confirmPw) {

        // Return a promise
        return new Promise((resolve, reject) => {

            // If the session is expired
            if (utils.isTokenExpired()) {

                // Reject the promise
                reject();

                // Return
                return;

            }

            // Send a request to the server to change the password
            fetch(
                `${settings.serverUrl}/profile/${id}/change-password`,
                {
                    method : "PUT",
                    headers: {
                        Authorization : `Bearer ${LoginActivity.getInstance().token}`,
                        "Content-Type": "application/json"
                    },
                    body   : JSON.stringify({
                        oldPassword    : oldPw,
                        newPassword    : newPw,
                        confirmPassword: confirmPw
                    })
                }
            )
                .then(res => {

                    // If the server responds with something over than 200 (success), throw an error
                    if (res.status !== 200) {
                        const err = new Error();
                        err.code  = res.status;
                        throw err;
                    }

                    // Resolve the promise
                    resolve();

                })
                .catch(err => {

                    console.error(err);

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.changePw401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.changePw404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Wrong data
                        case 422:
                            utils.logOrToast(i18next.t("messages.changePw422"), "long");
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.changePw500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },


    /**
     * Updates the user's profile information.
     *
     * @param {string} id - The id of the user.
     * @param {string} json - A JSON string containing the new values to set.
     * @returns {Promise<object>} A promise containing the new data.
     */
    putProfile(id, json) {

        // Return a promise
        return new Promise((resolve, reject) => {

            // If the session is expired
            if (utils.isTokenExpired()) {

                // Reject the promise
                reject();

                // Return
                return;

            }

            // Send a request to the server to change the password
            fetch(
                `${settings.serverUrl}/profile/${id}/update-profile`,
                {
                    method : "PUT",
                    headers: {
                        Authorization : `Bearer ${LoginActivity.getInstance().token}`,
                        "Content-Type": "application/json"
                    },
                    body   : json
                }
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
                    resolve(data.user);

                })
                .catch(err => {

                    console.error(err);

                    // Close the loader
                    utils.closeLoader();

                    // Alert the user of the error
                    switch (err.code) {

                        // Unauthorized
                        case 401:
                            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.editProfile401"), i18next.t("dialogs.btnOk"));
                            break;

                        // Not found
                        case 404:
                            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.editProfile404"), i18next.t("dialogs.btnOk"));
                            break;

                        // Wrong data
                        case 422:
                            utils.logOrToast(i18next.t("messages.editProfile422"), "long");
                            break;

                        // Generic server error
                        default:
                            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.editProfile500"), i18next.t("dialogs.btnOk"));
                            break;

                    }

                    // Reject the promise
                    reject();

                });

        });

    },

};