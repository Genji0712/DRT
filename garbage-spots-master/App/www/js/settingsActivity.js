"use strict";

class SettingsActivity {

    /** @private */ static _instance;

/**
     * Tạo và khởi tạo hoạt động.
     * Để triển khai mẫu Singleton, nó không bao giờ được gọi trực tiếp. Sử dụng {@link SettingsActivity.getInstance}
     * để lấy thể hiện Singleton của lớp.
     *
     * @người xây dựng
     */
    constructor() {

       // Cache màn hình
        this._screen = $("#page--settings");

        // Tên của cài đặt hiện đang mở
        this._openedSetting = null;

        // Khởi tạo giao diện người dùng cài đặt
        this.initSettingsUi();

        // Khởi tạo giao diện người dùng cài đặt "tài khoản"
        this.initAccountUi();

    }

  /**
       * Trả về phiên bản SettingsActivity hiện tại nếu có, nếu không thì tạo phiên bản đó.
       *
       * @returns {SettingsActivity} Phiên bản hoạt động.
       */
    static getInstance() {

        if (!SettingsActivity._instance)
            SettingsActivity._instance = new SettingsActivity();

        return SettingsActivity._instance;

    }


   /** Mở hoạt động. */
    open() {

       // Đẩy hoạt động vào ngăn xếp
        utils.pushStackActivity(this);
        // Đặt hộp kiểm chuyên gia dựa trên chế độ hiện tại
        $("#expert-cbx").prop("checked", App.isExpertMode);

       // Hiện màn hình
        this._screen.show();

    }

    /** Đóng hoạt động. */
    close() {

        // Bật hoạt động từ ngăn xếp
        utils.popStackActivity();


       // Ẩn màn hình
        this._screen.scrollTop(0).hide();

        // et cài đặt hiện đang mở thành null
        this._openedSetting = null;

    }

   /** Xác định hành vi của nút quay lại cho hoạt động này */
    onBackPressed() {

        // Nếu một cài đặt đang mở
        if (this._openedSetting) {

          // Đóng cài đặt
            this.closeSetting(this._openedSetting);

            // Return
            return;

        }

        // Đóng hoạt động
        this.close();

    }


    /** Khởi tạo giao diện người dùng của màn hình chính của hoạt động. */
    initSettingsUi() {

        // Khi người dùng nhấp vào nút "đóng", đóng hoạt động
        $("#settings-close").click(() => this.close());


       // Được kích hoạt khi người dùng nhấp vào cài đặt tài khoản
        $("#settings-account-wrapper").click(() => {

        // Nếu người dùng là khách
            if (app.isGuest) {

              // Cảnh báo người dùng
                utils.createAlert(
                    "",
                    i18next.t("dialogs.profileGuest"),
                    i18next.t("dialogs.btnNo"),
                    null,
                    i18next.t("dialogs.btnYes"),
                    () => {

                        // Đăng xuất
                        this.logout();

                        // Đặt cờ khách thành false
                        app.isGuest = false;

                    }
                );

                // Trở lại
                return;

            }

          // Nếu không có kết nối
            if (!navigator.onLine) {

                // Cảnh báo người dùng
                utils.createAlert("", i18next.t("dialogs.profileOffline"), i18next.t("dialogs.btnOk"));

                //Trở lại
                return;

            }

          // Hiện trang
            $("#page--account-settings").show();

            // Đặt tên cài đặt đã mở
            this._openedSetting = "account";

        });


       // Được kích hoạt khi người dùng nhấp vào hộp kiểm chuyên gia
        $("#expert-cbx").click(() => {

           // Thay đổi chế độ
            localStorage.setItem("mode", (!App.isExpertMode).toString());

        });


        // Được kích hoạt khi người dùng nhấp vào cài đặt ngôn ngữ
        $("#settings-language-wrapper").click(() => {

            let targetLng;

            console.log(`Current language: ${App.appLanguage}`);

            if (App.appLanguage === "en") {
                targetLng = "it"
            } else {
                targetLng = "en"
            }

            i18next.changeLanguage(targetLng, err => {

                if (err) {
                    console.error("Error changing language", err);
                    utils.logOrToast(i18next.t("messages.changeLngError"), "long");
                    return;
                }

                $("body").localize();
                localStorage.setItem("lng", targetLng);
                utils.logOrToast(i18next.t("messages.lngChanged", {lng: targetLng}), "long");

            });

        });


        // Được kích hoạt khi người dùng nhấp vào cài đặt trợ giúp
                // $("#settings-help-wrapper").click(() => {
                //
                // utils.logOrToast(i18next.t("settings.notImplemented"), "long");
                //
                // });

    }


   /** Khởi tạo giao diện người dùng của màn hình cài đặt tài khoản. */
    initAccountUi() {

        // Khi người dùng nhấp vào nút "đóng", đóng cài đặt
        $("#account-close").click(() => this.closeSetting("account"));

        // Khi người dùng nhấp vào cài đặt chỉnh sửa hồ sơ
        $("#account-edit-profile").click(() => {

           // Mở bộ nạp
            utils.openLoader();

          // Lấy dữ liệu của người dùng
            user.get(LoginActivity.getInstance().userId)
                .then(data => {

                  // Đặt giá trị cho các trường
                    $("#edit-profile-age").val(data.age);
                    utils.changeSelectorLabel("edit-profile-age", true);

                    $("#edit-profile-gender").val(data.gender);
                    utils.changeSelectorLabel("edit-profile-gender", true);

                    $("#edit-profile-occupation").val(data.occupation);
                    utils.changeSelectorLabel("edit-profile-occupation", true);

                   // Hiện trang
                    $("#page--edit-profile").show();

                    // Đóng bộ nạp
                    utils.closeLoader();

                });

           // Đặt tên cài đặt đã mở
            this._openedSetting = "editProfile";

        });

       // Khi user click vào thay đổi cài đặt mail thì hiện trang
               // $("#account-change-mail").click(() => {
               //
               // // Hiển thị màn hình
               // $("#change-email").show();
               //
               // // Đặt tên cài đặt đã mở
               // this._openedSetting = "changeEmail";
               //
               // });

               // Khi người dùng click vào cài đặt thay đổi mật khẩu thì hiện trang
               // $("#account-change-pw").click(() => {
               //
               // // Hiển thị màn hình
               // $("#change-pw").show();
               //
               // // Đặt tên cài đặt đã mở
               // this._openedSetting = "changePassword";
               //
               // });

               // Được kích hoạt khi người dùng nhấp vào cài đặt đăng xuất
        $("#account-logout").click(() => {

           // Tạo hộp thoại yêu cầu xác nhận người dùng
            utils.createAlert(
                "",
                i18next.t("settings.account.logoutConfirmation"),
                i18next.t("dialogs.btnCancel"),
                null,
                i18next.t("dialogs.btnOk"),
                () => {

                   // Đóng màn hình
                    $("#page--account-settings").scrollTop(0).hide();

                    // Đăng xuất
                    this.logout();

                }
            );

        });


      // Khởi tạo trang email thay đổi
              // this.initChangeEmail();

              // Khởi tạo trang thay đổi mật khẩu
              // this.initChangePw();

              // Khởi tạo trang hồ sơ chỉnh sửa thay đổi
        this.initEditProfile();

    }


    /** Khởi tạo trang email thay đổi. */
    initChangeEmail() {

        // Khi người dùng nhấp vào nút "đóng", đóng trang
        $("#change-email-close").click(() => this.closeSetting("changeEmail"));

        // Khi người dùng click vào nút "xong" thì thay đổi thư
        $("#change-email-done").click(() => {

           // Mở bộ nạp
            utils.openLoader();

            // Lưu email do người dùng cung cấp
            const email = $("#new-email").val();

            // If no email has been provided
            if (email === "") {

                // Đóng bộ nạp
                utils.closeLoader();

               // Cảnh báo người dùng
                utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");

                // Trở lại
                return;

            }

            // Thay đổi email của người dùng
            user.putEmail(LoginActivity.getInstance().userId, email)
                .then(() => {

                   // Đóng bộ nạp
                    utils.closeLoader();

                   //Đóng menu
                    this.closeSetting("changeEmail");

                    // Đóng trang cài đặt tài khoản
                    $("#page--account-settings").scrollTop(0).hide();

                    // Đăng xuất
                    this.logout();

                    // Tạo hộp thoại email xác nhận
                    utils.createAlert(i18next.t("settings.account.changeEmail.successTitle"),
                        i18next.t("settings.account.changeEmail.successMessage"), i18next.t("dialogs.btnOk"));

                })

        });

    }


    /** Khởi tạo trang thay đổi mật khẩu. */
    initChangePw() {

        // Khi người dùng nhấp vào nút "đóng", đóng trang
        $("#change-pw-close").click(() => this.closeSetting("changePassword"));

        // Khi người dùng click vào nút "xong" thì đổi mật khẩu
        $("#change-pw-done").click(() => {

            // Mở bộ nạp
            utils.openLoader();

            // Lưu giá trị của các trường
            const oldPassword     = $("#change-pw-old-password").val(),
                  newPassword     = $("#change-pw-new-password").val(),
                  confirmPassword = $("#change-pw-confirm-password").val();

            // Nếu không cung cấp mật khẩu cũ, trả về
            if (oldPassword === "") {
                utils.logOrToast(i18next.t("messages.insertOldPassword"), "long");
                utils.closeLoader();
                return;
            }

            // Nếu mật khẩu quá yếu (ít hơn 8 ký tự và không có số), hãy trả về
            if (newPassword === "" || newPassword.length < 8 || !(/\d/.test(newPassword))) {
                utils.logOrToast(i18next.t("messages.weakNewPassword"), "long");
                utils.closeLoader();
                return;
            }

            // Nếu mật khẩu cũ bằng mật khẩu mới, trả về
            if (oldPassword === newPassword) {
                utils.logOrToast(i18next.t("messages.samePassword"), "long");
                utils.closeLoader();
                return;
            }

            // Nếu trường "mật khẩu mới" và "xác nhận mật khẩu" không khớp, hãy quay lại
            if (newPassword !== confirmPassword) {
                utils.logOrToast(i18next.t("messages.passwordsNotMatch"), "long");
                utils.closeLoader();
                return;
            }

            // Thay đổi mật khẩu
            user.putPassword(LoginActivity.getInstance().userId, oldPassword, newPassword, confirmPassword)
                .then(() => {

                    // Đóng bộ nạp
                    utils.closeLoader();

                    //Đóng trang
                    this.closeSetting("changePassword");

                    //Cảnh báo người dùng
                    utils.logOrToast(i18next.t("messages.changePwSuccess"), "long");

                })

        });

    }


    /** Khởi tạo trang hồ sơ chỉnh sửa. */
    initEditProfile() {

        // Khi người dùng nhấp vào nút "đóng", chuyển sang hoạt động hồ sơ
        $("#edit-profile-close").click(() => this.closeSetting("editProfile"));

      // Khi người dùng click vào nút "xong" thì chỉnh sửa hồ sơ
        $("#edit-profile-done").click(() => {

         // Mở bộ nạp
            utils.openLoader();

            // Lưu giá trị của các trường
            const age        = $("#edit-profile-age").val(),
                  gender     = $("#edit-profile-gender").val(),
                  occupation = $("#edit-profile-occupation").val();

            // Gửi yêu cầu chỉnh sửa hồ sơ
            user.putProfile(
                LoginActivity.getInstance().userId,
                JSON.stringify({ age: age, gender: gender, occupation: occupation })
            )
                .then(data => {

                   // Cập nhật dữ liệu hiển thị
                    $("#edit-profile-age").val(data.age);
                    utils.changeSelectorLabel("edit-profile-age", true);

                    $("#edit-profile-gender").val(data.gender);
                    utils.changeSelectorLabel("edit-profile-gender", true);

                    $("#edit-profile-occupation").val(data.occupation);
                    utils.changeSelectorLabel("edit-profile-occupation", true);

                    // Đóng bộ nạp
                    utils.closeLoader();

                    // Đóng trang
                    this.closeSetting("editProfile");

                    // Cảnh báo người dùng
                    utils.logOrToast(i18next.t("messages.editProfileSuccess"), "long");

                });

        });

        // Thay đổi nhãn của selector khi giá trị của chúng thay đổi
        $("#edit-profile-age").change(() => utils.changeSelectorLabel("edit-profile-age", true));
        $("#edit-profile-gender").change(() => utils.changeSelectorLabel("edit-profile-gender", true));
        $("#edit-profile-occupation").change(() => utils.changeSelectorLabel("edit-profile-occupation", true));

    }


  /**
       * Đóng một cài đặt.
       *
       * @param {string} name - Tên của cài đặt cần đóng.
       */
    closeSetting(name) {

        // Bật tên
        switch (name) {

            case "account":

                // Ẩn màn hình
                $("#page--account-settings").scrollTop(0).hide();

                // Đặt cài đặt đã mở thành null
                this._openedSetting = null;

                break;

            case "editProfile":

                // Hide the screen
                $("#page--edit-profile").scrollTop(0).hide();

                // Reset the fields
                $("#edit-profile-age").val("");
                utils.changeSelectorLabel("edit-profile-age", true);

                $("#edit-profile-gender").val("");
                utils.changeSelectorLabel("edit-profile-gender", true);

                $("#edit-profile-occupation").val("");
                utils.changeSelectorLabel("edit-profile-occupation", true);

                // Đặt cài đặt đã mở thành "tài khoản"
                this._openedSetting = "account";

                break;

            case "changeEmail":

                // Hide the screen
                $("#change-email").scrollTop(0).hide();

                // Reset the field
                $("#new-email").val("");

                // Đặt cài đặt đã mở thành "tài khoản"
                this._openedSetting = "account";

                break;

            case "changePassword":

                // Hide the screen
                $("#change-pw").scrollTop(0).hide();

                // Reset the fields
                $("#change-pw-old-password").val("");
                $("#change-pw-new-password").val("");
                $("#change-pw-confirm-password").val("");

                // Set the opened setting to "account"
                this._openedSetting = "account";

                break;

        }


    }


    /** Đóng các hoạt động và đăng xuất khỏi ứng dụng. */
    logout() {

        // Đóng hoạt động
        this.close();

        // Đóng hoạt động bản đồ
        MapActivity.getInstance().close();

        // Đăng xuất
        LoginActivity.getInstance().logout();

        // Mở hoạt động đăng nhập
        LoginActivity.getInstance().open();

    }

}
