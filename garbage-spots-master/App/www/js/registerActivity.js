"use strict";

class RegisterActivity {

    /** @private */ static _instance;

    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link RegisterActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        // Cache các trang
        this.disclaimer = $("#page--register-disclaimer");
        this.screen     = $("#page--register");

      // Gắn cờ cho biết tuyên bố miễn trừ trách nhiệm hiện đang được mở
        this._isDisclaimerOpen = false;

// Nếu người dùng chấp nhận tuyên bố từ chối trách nhiệm, hãy mở trang đăng ký
        $("#btn--register-disclaimer-accept").click(() => {

          // Hiển thị màn hình đăng ký
            this.screen.show();

          // Ẩn tuyên bố từ chối trách nhiệm
            this.disclaimer.scrollTop(0).hide();

            // Đặt cờ thành false
            this._isDisclaimerOpen = false;

        });

        // Nếu người dùng không chấp nhận tuyên bố từ chối trách nhiệm, hãy quay lại hoạt động đăng nhập
        $("#link--register-disclaimer-back").click(() => utils.switchActivity(LoginActivity.getInstance(), true, this));

        // Thực hiện đăng ký
        $("#btn--register-done").click(() => this.register());

       // Đưa về trang đăng nhập
        $("#link--login").click(() => utils.switchActivity(LoginActivity.getInstance(), true, this));


        // Lắng nghe những thay đổi của bộ chọn và cập nhật nhãn của chúng cho phù hợp
        $("#register-age").change(() => utils.changeSelectorLabel("register-age", true));
        $("#register-gender").change(() => utils.changeSelectorLabel("register-gender", true));
        $("#register-occupation").change(() => utils.changeSelectorLabel("register-occupation", true));

    }

    /**
     * Returns the current RegisterActivity instance if any, otherwise creates it.
     *
     * @returns {RegisterActivity} The activity instance.
     */
    static getInstance() {

        if (!RegisterActivity._instance)
            RegisterActivity._instance = new RegisterActivity();

        return RegisterActivity._instance;

    }


    /** Opens the activity. */
    open() {

       // Đẩy hoạt động vào ngăn xếp
        utils.pushStackActivity(this);

       // Hiển thị tuyên bố từ chối trách nhiệm
        this.disclaimer.show();

        // Đặt cờ thành true
        this._isDisclaimerOpen = true;

    }

    /** Đóng hoạt động và đặt lại các trường của nó. */
    close() {
// Bật hoạt động từ ngăn xếp
        utils.popStackActivity();

       // Ẩn tuyên bố từ chối trách nhiệm
        this.disclaimer.scrollTop(0).hide();

        // Ẩn màn hình
        this.screen.scrollTop(0).hide();

        // Đặt lại các trường
        $("#field--register-email").val("");
        $("#field--register-password").val("");
        $("#field--register-confirm-password").val("");

        //Đặt lại bộ chọn
        utils.resetSelector("register-age");
        utils.resetSelector("register-gender");
        utils.resetSelector("register-occupation");

        //Đặt cờ thành sai
        this._isDisclaimerOpen = false;

    }

   /** Xác định hành vi của nút quay lại cho hoạt động này */
    onBackPressed() {

       // Nếu trang biểu mẫu đang mở
        if (!this._isDisclaimerOpen) {

          // Hiển thị tuyên bố từ chối trách nhiệm
            this.disclaimer.show();

           // Hiển thị màn hình đăng ký
            this.screen.scrollTop(0).hide();

           // Đặt cờ thành true
            this._isDisclaimerOpen = true;

            // Return
            return;

        }

      //Chuyển sang hoạt động đăng nhập
        utils.switchActivity(LoginActivity.getInstance(), true, this);

    }


/** Đăng ký trong ứng dụng. */
    register() {

      // Mở bộ nạp
        utils.openLoader();

        // Lưu giá trị của các trường
        const email           = $("#field--register-email").val(),
              password        = $("#field--register-password").val(),
              confirmPassword = $("#field--register-confirm-password").val(),
              age             = $("#register-age").val(),
              gender          = $("#register-gender").val(),
              occupation      = $("#register-occupation").val();

        // Nếu không có email nào được cung cấp, flash một thông báo lỗi
        if (email === "") {
            utils.closeLoader();
            utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
            return;
        }

// Nếu không có email nào được cung cấp hoặc nếu mật khẩu không đủ mạnh, sẽ hiển thị thông báo lỗi
        if (password === "" || password.length < 8 || !(/\d/.test(password.toString()))) {
            utils.closeLoader();
            utils.logOrToast(i18next.t("messages.weakPassword"), "long");
            return;
        }

        // Nếu các giá trị trong trường "mật khẩu" và "xác nhận mật khẩu" không khớp, sẽ hiển thị thông báo lỗi
        if (password !== confirmPassword) {
            utils.closeLoader();
            utils.logOrToast(i18next.t("messages.passwordsNotMatch"), "long");
            return;
        }

        fetch(
            `${settings.serverUrl}/auth/signup`,
            {
                method : "PUT",
                headers: { "Content-Type": "application/json" },
                body   : JSON.stringify({
                    email          : email,
                    password       : password,
                    confirmPassword: confirmPassword,
                    age            : age,
                    gender         : gender,
                    occupation     : occupation
                })
            }
        )
            .then(res => {

                // Nếu máy chủ phản hồi hơn 200 (thành công), sẽ báo lỗi
                if (res.status !== 201) {
                    const err = new Error();
                    err.code  = res.status;
                    throw err;
                }

               // Đóng bộ nạp
                utils.closeLoader();

               // Mở trang đăng nhập
                utils.switchActivity(LoginActivity.getInstance(), true, this);

// Hiển thị hộp thoại về email xác nhận
                // utils.createAlert(i18next.t("auth.register.successTitle"), i18next.t("auth.register.successMessage"), i18next.t("dialogs.btnOk"));
            })
            .catch(err => {

                console.error(err);

              // Đóng bộ nạp
                utils.closeLoader();

          // Thông báo lỗi cho người dùng
                switch (err.code) {

                    // Email đã được sử dụng
                    case 409:
                        utils.logOrToast(i18next.t("messages.register409"), "long");
                        break;

                    // Nhập sai dữ liệu
                    case 422:
                        utils.logOrToast(i18next.t("messages.register422"), "long");
                        break;

                    // Lỗi máy chủ chung
                    default:
                        utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.register500"), i18next.t("dialogs.btnOk"));
                        break;

                }

            });

    }

}
