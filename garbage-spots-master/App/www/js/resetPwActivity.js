"use strict";


class ResetPasswordActivity {

    /** @private */ static _instance;

    /**
         * Tạo và khởi tạo hoạt động.
         * Để triển khai mẫu Singleton, nó không bao giờ được gọi trực tiếp. Sử dụng {@link ResetPasswordActivity.getInstance}
         * để lấy thể hiện Singleton của lớp.
         *
         * @người xây dựng
         */
    constructor() {

      // Cache màn hình
        this.screen = $("#page--reset-pw");

        // Khi người dùng nhấp vào nút "đóng", đóng trang
        $("#btn--reset-pw-close").click(() => this.close());

        // Khi người dùng nhấp vào nút "xong", đặt lại mật khẩu
        $("#btn--reset-pw-done").click(() => this.resetPassword());

    }

 /**
      * Trả về phiên bản ResetPasswordActivity hiện tại nếu có, nếu không thì tạo phiên bản đó.
      *
      * @returns {ResetPasswordActivity} Phiên bản hoạt động.
      */
    static getInstance() {

        if (!ResetPasswordActivity._instance)
            ResetPasswordActivity._instance = new ResetPasswordActivity();

        return ResetPasswordActivity._instance;

    }


   /** Mở hoạt động. */
    open() {

     // Đẩy hoạt động vào ngăn xếp
        utils.pushStackActivity(this);

        // Hiện màn hình
        this.screen.show();

    }

  /** Đóng hoạt động và đặt lại các trường của nó. */
    close() {

        // Bật hoạt động từ ngăn xếp
        utils.popStackActivity();
        // Ẩn màn hình
        this.screen.scrollTop(0).hide();

        // Đặt lại trường
        $("#field--reset-pw-email").val("");

    }

    /** Xác định hành vi của nút quay lại cho hoạt động này */
    onBackPressed() { this.close() }


    /** Gửi email cho người dùng với hướng dẫn đặt lại mật khẩu của họ. */
    resetPassword() {

        // Mở bộ nạp
        utils.openLoader();

       // Lưu giá trị của các trường
        const email = $("#field--reset-pw-email").val();

       // Nếu không có email nào được cung cấp, flash một thông báo lỗi
        if (email === "") {
            utils.closeLoader();
            utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
            return;
        }

       // Gửi yêu cầu đến máy chủ
        fetch(
            `${settings.serverUrl}/auth/reset-password`,
            {
                method : "POST",
                headers: { "Content-Type": "application/json" },
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

                // Đóng hoạt động và bộ tải
                this.close();
                utils.closeLoader();

                // Hiển thị hộp thoại thành công
                utils.createAlert(
                    i18next.t("auth.login.resetPassword.successTitle"),
                    i18next.t("auth.login.resetPassword.successMessage"),
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
                        utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.resetPw404"), i18next.t("dialogs.btnOk"));
                        break;

                   // Nhập sai dữ liệu
                    case 422:
                        utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
                        break;

                   // Lỗi máy chủ chung
                    default:
                        utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.resetPw500"), i18next.t("dialogs.btnOk"));
                        break;

                }

            });

    }

}