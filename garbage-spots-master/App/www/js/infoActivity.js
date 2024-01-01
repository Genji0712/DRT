"use strict";

class InfoActivity {

    /** @private */ static _instance;

/** Tùy chọn định dạng ngày tháng */
    static get dateOpts() {
        return {
            year  : "numeric",
            month : "2-digit",
            day   : "2-digit",
            hour  : "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }
    }


    /**
    * Tạo và khởi tạo hoạt động.
         * Để triển khai mẫu Singleton, nó không bao giờ được gọi trực tiếp. Sử dụng {@link InfoActivity.getInstance}
         * để lấy thể hiện Singleton của lớp.
         *
     * @constructor
     */
    constructor() {

       // Cache màn hình
        this._screen = $("#page--info");

      // Cache các placeholder
        this._placeholders = $("#page--info .placeholder");


       // Khi người dùng nhấp vào nút "đóng", đóng hoạt động
        $("#info-close").click(() => this.close());

      // Khi người dùng click vào ảnh thu nhỏ, mở màn hình ảnh
        $("#info-photo-thm").click(function () { utils.openImgScreen($(this).attr("src")) });

    }

   /**
        * Trả về phiên bản InfoActivity hiện tại nếu có, nếu không thì tạo phiên bản đó.
        *
        * @returns {InfoActivity} Phiên bản hoạt động.
        */
    static getInstance() {

        if (!InfoActivity._instance)
            InfoActivity._instance = new InfoActivity();

        return InfoActivity._instance;

    }


   /**
        * Mở hoạt động.
        *
        * @param {string} id - Id của vụ lở đất.
        * @param {boolean} isLocal - Đúng nếu vụ lở đất được lưu trong cơ sở dữ liệu cục bộ.
        */
    open(id, isLocal) {

        // Đẩy hoạt động vào ngăn xếp
        utils.pushStackActivity(this);

        // Nếu rác không được lưu cục bộ và ứng dụng đang ngoại tuyến
        if (!isLocal && !navigator.onLine) {

          // Đóng hoạt động
            this.close();

            // Alert the user
            utils.createAlert("", i18next.t("dialogs.infoRemoteOffline"), i18next.t("dialogs.btnOk"));

            // Return
            return;

        }

        // Nếu rác cục bộ, Thông báo cho người dùng
        if (isLocal) utils.createAlert("", i18next.t("dialogs.openLocalInfo"), i18next.t("dialogs.btnOk"));

        // Làm sinh động các placeholder
        this._placeholders.addClass("ph-animate");

        // Show the screen
        this._screen.show();

        // Lấy và hiển thị rác
        this.getLandslide(id, isLocal);

    }

    /** Đóng hoạt động và đặt lại các trường của nó. */
    close() {

        // Bật hoạt động từ ngăn xếp
        utils.popStackActivity();

        // Hide the screen
        this._screen.scrollTop(0).hide();

  // Ẩn nội dung phía sau placeholder
        $("#page--info .ph-hidden-content").hide();

       // Dừng hoạt ảnh giữ chỗ
        this._placeholders.removeClass("ph-animate").show();

        // Ẩn nút xóa
        $("#info-delete").hide();

        // Ẩn nút thông tin
        $("#info-edit").hide();

        // Hiển thị tất cả các trường
        $(".info-block").show();

        // Xóa nội dung từng trường
        $("#info-createdAt .info-content").html("");
        $("#info-updatedAt .info-content").html("");
        $("#info-coordinates .info-content").html("");
        $("#info-coordinatesAccuracy .info-content").html("");
        $("#info-altitude .info-content").html("");
        $("#info-altitudeAccuracy .info-content").html("");
        $("#info-type .info-content").html("");
        $("#info-materialType .info-content").html("");
        $("#info-hillPosition .info-content").html("");
        $("#info-water .info-content").html("");
        $("#info-vegetation .info-content").html("");
        $("#info-mitigation .info-content").html("");
        $("#info-mitigationsList .info-content").html("");
        $("#info-monitoring .info-content").html("");
        $("#info-monitoringList .info-content").html("");
        $("#info-damages .info-content").html("");
        $("#info-damagesList .info-content").html("");
        $("#info-notes .info-content").html("");

       // Hiển thị placeholder hình ảnh
        $("#info-photo-preview").attr("src", "img/no-img-placeholder-200.png");

    }

   /** Xác định hành vi của nút quay lại cho hoạt động này */
    onBackPressed() {

        // Close the activity
        this.close();

    }


    getLandslide(id, isLocal) {

      // Lấy dữ liệu về rác
        landslide.get(id, isLocal)
            .then(data => {

                // Show and initialize the "delete" button
                $("#info-delete").show().unbind("click").click(() => {

                    // Ask for confirmation and delete the landslide
                    utils.createAlert(
                        "",
                        i18next.t("dialogs.deleteConfirmation"),
                        i18next.t("dialogs.btnCancel"),
                        null,
                        i18next.t("dialogs.btnOk"),
                        () => {

                            // Open the loader
                            utils.openLoader();

                            // Delete garbage
                            landslide.delete(id, isLocal, data.imageUrl)
                                .then(() => {

                                    // Close the loader
                                    utils.closeLoader();

                                    // Close the activity
                                    this.close();

                                })
                                .catch(() => {

                                    // Close the loader
                                    utils.closeLoader();

                                })

                        }
                    );

                });

                // Show and initialize the "edit" button
                $("#info-edit").show().unbind("click").click(() => {

                    // Open the insert activity in "put" mode
                    InsertActivity.getInstance().openPut(data, isLocal);

                    // Scroll to top
                    this._screen.scrollTop(0);

                });

                // Show the data
                this.show(data, isLocal);

            })
            .catch(() => {

                // Close the activity
                this.close();

            });

    }



    show(data, isLocal) {

        // Show all the fields
        $(".info-block").show();

       // Nếu rác đã được ánh xạ ở chế độ đơn giản, hãy ẩn các trường chuyên gia
        if (!data.expert || (isLocal && data.expert !== "true")) {

            $("#info-hillPosition").hide();
            $("#info-vegetation").hide();
            $("#info-mitigationList").hide();
            $("#info-monitoring").hide();
            $("#info-monitoringList").hide();
            $("#info-damages").hide();
            $("#info-damagesList").hide();
            $("#info-notes").hide();

        }

        // Khác, ẩn danh sách theo giá trị của trường tương ứng
        else {

            if (data.mitigation !== "yes") $("#info-mitigationList").hide();
            if (data.monitoring !== "yes") $("#info-monitoringList").hide();
            if (data.damages !== "directDamage") $("#info-damagesList").hide();

        }

     // Đối với mỗi khóa trong đối tượng
        for (let key in data) {

           // Nếu đối tượng có một thuộc tính được liên kết với khóa
            if (data.hasOwnProperty(key)) {

              // Đặt nội dung của trường được liên kết với khóa
                $("#info-" + key + " .info-content").html(() => {
                // Lưu giá trị của khóa
                    const val = data[key];

                    // Nếu val trống, đặt nội dung thành "-"
                    if (val === "") return "-";

                    // Set the value form based on the key
                    switch (key) {

                        case "_id":
                            return val;

                     // Hiển thị ngày được định dạng phù hợp với ngôn ngữ hiện tại
                        case "createdAt":
                        case "updatedAt":
                            return new Date(val).toLocaleDateString(i18next.language, InfoActivity.dateOpts);

                      // Hiển thị tọa độ
                        case "coordinates":
                            if (data.preciseCoordinates &&
                                data.preciseCoordinates[0] !== undefined &&
                                data.preciseCoordinates[1] !== undefined)
                                return data.preciseCoordinates[0] + ", " + data.preciseCoordinates[1];
                            else
                                return val[0] + ", " + val[1];

                  // Hiển thị độ chính xác
                        case "coordinatesAccuracy":
                        case "altitudeAccuracy":
                            if (val === 0 || val === null) return i18next.t("info.unknown");
                            return val + " " + i18next.t("info.accuracyUnit");

                     // Hiển thị độ cao
                        case "altitude":
                            if (val === -999) return i18next.t("info.unknown");
                            return val + " " + i18next.t("info.altitudeUnit");

                      // Hiển thị danh sách giảm nhẹ
                        case "mitigationList":
                            if (val.length === 0) return "-";

                            let mitigationContent = "<ul class='info-list'>";

                            for (let i = 0; i < val.length; i++) {
                                mitigationContent += `<li>${i18next.t("insert.mitigation.enum." + val[i].type)}</li>`;
                            }

                            mitigationContent = mitigationContent + "</ul>";

                            return mitigationContent;

                       // Hiển thị danh sách giám sát
                        case "monitoringList":
                            if (val.length === 0) return "-";

                            let monitoringContent = "<ul class='info-list'>";

                            for (let i = 0; i < val.length; i++) {
                                monitoringContent +=
                                    `<li>
                                        ${i18next.t("insert.monitoring.enum." + val[i].type)} (${i18next.t("insert.monitoring.enum." + val[i].status)})
                                    </li>`;
                            }

                            monitoringContent = monitoringContent + "</ul>";

                            return monitoringContent;

                       // Hiển thị danh sách thiệt hại
                        case "damagesList":
                            if (val.length === 0) return "-";

                            let damagesContent = "<ul class='info-list'>";

                            for (let i = 0; i < val.length; i++) {

                                damagesContent = damagesContent + "<li>";

                                if (val[i].type === "other")
                                    damagesContent = damagesContent + val[i].specification;
                                else
                                    damagesContent = damagesContent + i18next.t("insert.damages.enum." + val[i].type);

                                damagesContent = damagesContent + "</li>";

                            }

                            damagesContent = damagesContent + "</ul>";

                            return damagesContent;

                       // Hiển thị ghi chú
                        case "notes":
                            return val;

                        default:
                            return i18next.t("insert." + key + ".enum." + val);

                    }

                });

            }

        }

        // Save the photo url
        let photoSrc;

        // ToDo fix
        if (isLocal) photoSrc = data.imageUrl;

        // Else, set the remote url
        else photoSrc = `${settings.serverUrl}/${data.imageUrl}`;

        // Show the photo
        $("#info-photo-thm").attr("src", photoSrc);

        // Hide the placeholders
        this._placeholders.hide().removeClass("ph-animate");

        // Show the content hidden by the placeholders
        $("#page--info .ph-hidden-content").show();

    }

}
