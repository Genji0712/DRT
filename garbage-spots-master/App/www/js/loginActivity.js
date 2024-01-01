"use strict";

class LoginActivity {

    /** @private */ static _instance;

  /**
       * Tạo và khởi tạo hoạt động.
       * Để triển khai mẫu Singleton, nó không bao giờ được gọi trực tiếp. Sử dụng {@link LoginActivity.getInstance}
       * để lấy thể hiện Singleton của lớp.
       *
       * @người xây dựng
       */
    constructor() {

        this.screen = $("#page--log-in");

        // Mã thông báo và id người dùng của người dùng hiện tại
        this.token  = null;
        this.userId = null;


        // Ẩn chân trang trong hoạt động này và trong hoạt động đăng ký khi bàn phím điện thoại được hiển thị
        let $authFooter = $(".auth-footer");
        window.addEventListener("keyboardWillShow", () => $authFooter.hide());
        window.addEventListener("keyboardWillHide", () => $authFooter.show());


        // Link mở hoạt động đặt lại mật khẩu
        $("#link--reset-password").click(() => {

            // Nếu không có kết nối
            if (!navigator.onLine) {

                // Mở hộp thoại hỏi hộp thoại đăng nhập offline
                this.openOfflineDialog();

                // Trở lại
                return;

            }

            //  Mở hoạt động đặt lại mật khẩu
            utils.switchActivity(ResetPasswordActivity.getInstance());

        });

        // Nút thực hiện đăng nhập
        $("#btn--login").click(() => {

            // Nếu không có kết nối
            if (!navigator.onLine) {

                // Mở hộp thoại hỏi hộp thoại đăng nhập offline
                this.openOfflineDialog();

                // Trở lại
                return;

            }

            // Thực hiện đăng nhập
            this.login();

        });

        // Liên kết để mở hoạt động đăng ký
        $("#link--register").click(() => {

            // Nếu không có kết nối
            if (!navigator.onLine) {

                // Mở hộp thoại hỏi hộp thoại đăng nhập offline
                this.openOfflineDialog();

                // Trở lại
                return;

            }

            // Mở hoạt động đăng ký
            utils.switchActivity(RegisterActivity.getInstance(), true, this);

        });

    }

   /**
        * Trả về phiên bản LoginActivity hiện tại nếu có, nếu không thì tạo phiên bản đó.
        *
        * @returns {LoginActivity} Phiên bản hoạt động.
        */
    static getInstance() {

        if (!LoginActivity._instance)
            LoginActivity._instance = new LoginActivity();

        return LoginActivity._instance;

    }


    /** Mở hoạt động. */
    open() {

        // Đẩy hoạt động vào ngăn xếp
        utils.pushStackActivity(this);

        // Hiển thị màn hình
        this.screen.show();

        // Nếu không có kết nối, hãy mở hộp thoại hỏi hộp thoại đăng nhập ngoại tuyến
        if (!navigator.onLine) this.openOfflineDialog();

    }

    /** Đóng hoạt động và đặt lại các trường của nó. */
    close() {

       // Bật hoạt động từ ngăn xếp
        utils.popStackActivity();

        // Ẩn màn hình
        this.screen.scrollTop(0).hide();

        // Đặt lại các trường
        $("#field--login-email").val("");
        $("#field--login-password").val("");

    }

    /** Xác định hành vi của nút quay lại cho hoạt động này */
    onBackPressed() {

        // Nếu đây là lần đầu tiên người dùng nhấp vào nút
        if (app._backPressedCount === 0) {

            // Cảnh báo người dùng
            utils.logOrToast(i18next.t("messages.backButton"), "short");

            // Tăng số lượng
            app._backPressedCount++;

            // Đặt một khoảng thời gian mà sau đó số đếm được đặt lại về 0
            setInterval(() => app._backPressedCount = 0, 2000);

        }

        // Khác, đóng ứng dụng
        else navigator.app.exitApp();

    }


    /**
     * Checks if there is a valid session stores.
     *
     * @returns {boolean} True if there is a valid session stored.
     */
    getAuthStatus() {

       // Trích xuất mã thông báo và ngày hết hạn từ localStorage
        const token      = localStorage.getItem("token");
       // ngày hết hạn   = localStorage.getItem("Ngày hết hạn");

               // Nếu không có mã thông báo hoặc ngày hết hạn, trả về false
               // if (!token || !expireDate) trả về false;
        if (!token) return false;

     // Nếu token hết hạn
             // if (Ngày mới(ngày hết hạn) <= Ngày mới()) {
             //
             //     // Đăng xuất
             // this.logout();
             //
             // // Trả về sai
             // trả về sai;
             //
             // }

             // Lưu mã thông báo và id người dùng
        this.token  = token;
        this.userId = localStorage.getItem("userId");

        // Return true
        return true;

    }


 /** Đăng nhập vào ứng dụng. */
    login() {

        // Open the loader
        utils.openLoader();

        // Save the value of the fields
        const email    = $("#field--login-email").val(),
              password = $("#field--login-password").val();

      // Nếu không cung cấp email hoặc mật khẩu, flash thông báo lỗi
        if (email === "" || password === "") {
            utils.closeLoader();
            utils.logOrToast(i18next.t("messages.validCredentials"), "long");
            return;
        }

     // Gửi yêu cầu đến máy chủ để đăng nhập người dùng
        fetch(
            `${settings.serverUrl}/auth/login`,
            {
                method : "POST",
                headers: { "Content-Type": "application/json" },
                body   : JSON.stringify({ email: email, password: password })
            }
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
            .then(resData => {

                // Lưu token và id của người dùng
                this.token  = resData.token;
                this.userId = resData.userId;
                localStorage.setItem("token", resData.token);
                localStorage.setItem("userId", resData.userId);

               // Tính ngày hết hạn của phiên (1 ngày)
                               // const còn lại Milliseconds = 24 * 60 * 60 * 1000,
                               // ngày hết hạn = Ngày mới(Ngày mới().getTime() + còn lạiMilli giây);

                               // Lưu ngày hết hạn
                               // localStorage.setItem("ngày hết hạn", ngày hết hạn.toISOString());

                               // Nếu một phiên bản của hoạt động bản đồ đã tồn tại, hãy xóa nó
                if (MapActivity.hasInstance()) MapActivity.deleteInstance();

                // Open the map activity
                utils.switchActivity(MapActivity.getInstance(), true, this);

                // Close the loader
                utils.closeLoader();

            })
            .catch(err => {

                console.error(err);

                // Reset the password fields
                $("#field--login-password").val("");

                // Close the loader
                utils.closeLoader();

                // Alert the user of the error
                switch (err.code) {

                    // Wrong email or password
                    case 401:
                        utils.logOrToast(i18next.t("messages.login401"), "long");
                        break;

                    // Email not confirmed
                    case 460:
                        this.createResendEmailDialog();
                        break;

                    // Generic server error
                    default:
                        utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.login500"), i18next.t("dialogs.btnOk"));
                        break;

                }

            });

    }


   /** Tạo hộp thoại để cung cấp cho người dùng khả năng gửi lại email xác nhận. */
    createResendEmailDialog() {
        // Cache phần tử dom
        const $alertOverlay = $("#alert-dialog-overlay");

        // Đặt tiêu đề hộp thoại
        $alertOverlay.find(".dialog-title").html(i18next.t("auth.login.notVerifiedTitle"));

     // Đặt văn bản hộp thoại
        $alertOverlay.find(".dialog-text").html(`
            <p>${i18next.t("auth.login.notVerifiedMessage")}</p>
            <p class="dialog-link" onclick="LoginActivity.getInstance().resendConfirmationEmail()">
                ${i18next.t("auth.login.resendEmailLink")}
            </p>
        `);

    // Đặt nút đóng
        $("#alert-first-button")
            .html(i18next.t("dialogs.btnOk"))
            .unbind("click")
            .click(() => utils.closeAlert());

       // Hiện hộp thoại
        $alertOverlay.find(".dialog-wrapper").show();
        $alertOverlay.show();

    }

    /** Gửi lại email để xác nhận địa chỉ email của người dùng.*/
    resendConfirmationEmail() {

        // Đóng hộp thoại
        utils.closeAlert();

        // Mở bộ nạp
        utils.openLoader();

        // Lưu giá trị của các trường
        const email = $("#field--login-email").val();

        // Nếu không có email nào được cung cấp, hãy nhấp nháy thông báo lỗi
        if (email === "") {
            utils.closeLoader();
            utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
            return;
        }

        // Gửi yêu cầu đến máy chủ
        fetch(
            `${settings.serverUrl}/auth/confirmation/resend`,
            {
                method : "POST",
                headers: { "Content-Type": "application/json", },
                body   : JSON.stringify({ email: email })
            }
        )
            .then(res => {

                // Nếu máy chủ phản hồi với thứ gì đó lớn hơn 201 (tài nguyên được tạo), hãy đưa ra lỗi
                if (res.status !== 201) {
                    const err = new Error();
                    err.code  = res.status;
                    throw err;
                }

                // Đóng bộ nạp
                utils.closeLoader();

                // Hiển thị hộp thoại thành công
                utils.createAlert(
                    i18next.t("auth.login.resendEmailSuccessTitle"),
                    i18next.t("auth.register.successMessage"),
                    i18next.t("dialogs.btnOk")
                );

            })
            .catch(err => {

                console.error(err);

                // Đóng bộ nạp
                utils.closeLoader();

                // Thông báo lỗi cho người dùng
                switch (err.code) {

                   // Không tìm thấy người dùng
                    case 404:
                        utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.resendConfEmail404"), i18next.t("dialogs.btnOk"));
                        break;

                    // Email already confirmed
                    case 409:
                        utils.createAlert(i18next.t("dialogs.titleResendConfEmail409"), i18next.t("dialogs.resendConfEmail409"), i18next.t("dialogs.btnOk"));
                        break;

                   // Nhập sai dữ liệu
                    case 422:
                        utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
                        break;

                    // Lỗi máy chủ chung
                    default:
                        utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.resendConfEmail500"), i18next.t("dialogs.btnOk"));
                        break;

                }

            });

    }


    /** Đăng xuất khỏi ứng dụng. */
    logout() {

       // Đặt mã thông báo và id người dùng thành null
        this.token  = null;
        this.userId = null;

        // Xóa mã thông báo, id người dùng và ngày hết hạn mã thông báo khỏi bộ lưu trữ cục bộ
        localStorage.removeItem("token");
        // localStorage.removeItem("Ngày hết hạn");
        localStorage.removeItem("userId");

    }


    /**Mở hộp thoại hỏi người dùng xem họ có muốn tiếp tục vào ứng dụng với tư cách khách không. */
    openOfflineDialog() {

        utils.createAlert(
            "",
            i18next.t("auth.login.loginGuest"),
            i18next.t("dialogs.btnNo"),
            null,
            i18next.t("dialogs.btnYes"),
            () => {

                // Đặt chế độ thành "khách"
                app.isGuest = true;

                // Mở hoạt động bản đồ
                utils.switchActivity(MapActivity.getInstance(), true, this);

            }
        )

    }

}
