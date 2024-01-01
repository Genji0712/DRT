"use strict";

class InsertActivity {

    /** @private */ static _instance;
/**
     * Tạo và khởi tạo hoạt động.
     * Để triển khai mẫu Singleton, nó không bao giờ được gọi trực tiếp. Sử dụng {@link InsertActivity.getInstance}
     * để lấy thể hiện Singleton của lớp.
     *
     * @constructor
     */
    constructor() {

       // Cache màn hình
        this._screen = $("#page--insert");

       // Lưu trữ hình thu nhỏ của ảnh
        this._$photoThm = $("#photo-thm");

        // Lưu hộp thoại hiện đang mở và hộp thoại đầy đủ
        this._currOpenedDialog     = null;
        this._currOpenedFullDialog = null;


        // Id của  rác cần sửa đổi. Nó chỉ có giá trị nếu hoạt động được mở ở chế độ "đặt"
        this._lsId = null;

        // Cờ cho biết rác hiện đang được sửa đổi có được ánh xạ ở chế độ chuyên gia hay không
        this._isExpert = null;

       // Cờ cho biết rác hiện đang được sửa đổi có được lưu cục bộ hay không
        this._isLocal = null;

        // Tên của ảnh gốc của rác được chuyển vào chế độ "đặt". Được sử dụng để kiểm tra xem ảnh đã được sửa đổi chưa
        this._oldPhoto = null;


        // Giá trị của các trường khác nhau
        this._vals = {
            coordinates        : "",
            coordinatesAccuracy: "",
            altitude           : "",
            altitudeAccuracy   : "",
            presence           : "",
            type               : "",
            materialType       : "",
            hillPosition       : "",
            water              : "",
            vegetation         : "",
            mitigation         : "",
            mitigationList     : [],
            monitoring         : "",
            monitoringList     : [],
            damages            : "",
            damagesList        : [],
            notes              : "",
            photo              : ""
        };

        // Tạo danh sách tạm thời
        this._newMitigationList = [];
        this._newMonitoringList = [];
        this._newDamagesList    = [];

        // Khởi tạo giao diện người dùng
        this.initUI();

    }

 /**
      * Trả về phiên bản InsertActivity hiện tại nếu có, nếu không thì tạo phiên bản đó.
      *
      * @returns {InsertActivity} Phiên bản hoạt động.
      */
    static getInstance() {

        if (!InsertActivity._instance)
            InsertActivity._instance = new InsertActivity();

        return InsertActivity._instance;

    }


    /** Mở hoạt động. */
    open() {

        // Đẩy hoạt động vào ngăn xếp
        utils.pushStackActivity(this);

        // Nếu ứng dụng ở chế độ chuyên gia hoặc ls đang được sửa đổi được ánh xạ ở chế độ chuyên gia, hãy hiển thị các trường tương đối
        if ((this._lsId && this._isExpert) || (!this._lsId && App.isExpertMode)) {

            $("#hill-position-request-wrapper").show();
            $("#vegetation-request-wrapper").show();
            $("#monitoring-request-wrapper").show();
            $("#damages-request-wrapper").show();
            $("#notes-request-wrapper").show();

        }

        //Hiển thị màn hình
        this._screen.show();

        // Nếu ở chế độ "đăng"
        if (!this._lsId) {

            // Hiển thị hộp thoại cảnh báo về việc sử dụng vị trí
            utils.createAlert("", i18next.t("dialogs.insert.positionAlert"), i18next.t("dialogs.btnOk"));

            // Lưu dữ liệu định vị địa lý
            this._vals.coordinates         = MapActivity.getInstance().currLatLng;
            this._vals.coordinatesAccuracy = MapActivity.getInstance().currLatLngAccuracy;
            this._vals.altitude            = MapActivity.getInstance().currAltitude;
            this._vals.altitudeAccuracy    = MapActivity.getInstance().currAltitudeAccuracy;

        }

    }

  /**
       * Mở hoạt động ở chế độ "đặt" (sửa đổi rác)
       *
       * @param {object} ls - Dữ liệu rác cần sửa đổi.
       * @param {boolean} isLocal - Đúng nếu rác được lưu trong cơ sở dữ liệu cục bộ.
       */
    openPut(ls, isLocal) {

        // Lưu id rác
        this._lsId = ls._id;

        // Lưu nếu rác được lập bản đồ ở chế độ chuyên gia
        this._isExpert = ((isLocal && ls.expert === "true") || (!isLocal && ls.expert));

        // Lưu nếu rác được lưu cục bộ
        this._isLocal = isLocal;

        // Lưu dữ liệu rác
        this._vals.type           = ls.type;
        this._vals.materialType   = ls.materialType;
        this._vals.hillPosition   = ls.hillPosition;
        this._vals.water          = ls.water;
        this._vals.vegetation     = ls.vegetation;
        this._vals.mitigation     = ls.mitigation;
        this._vals.mitigationList = ls.mitigationList;
        this._vals.monitoring     = ls.monitoring;
        this._vals.monitoringList = ls.monitoringList;
        this._vals.damages        = ls.damages;
        this._vals.damagesList    = ls.damagesList;
        this._vals.notes          = ls.notes;

        if (isLocal)
            this._vals.photo = ls.imageUrl;
        else
            this._vals.photo = `${settings.serverUrl}/${ls.imageUrl}`;

        // Lưu ảnh cũ
        this._oldPhoto = this._vals.photo;

       // Đặt văn bản màn hình chính của các thuộc tính bắt buộc
        $("#ls-type-text").html(i18next.t("insert.type.enum." + this._vals.type));

        // Đặt văn bản màn hình chính của các thuộc tính tùy chọn
        if (this._vals.materialType !== "") $("#material-type-text").html(i18next.t("insert.materialType.enum." + this._vals.materialType));
        if (this._vals.hillPosition !== "") $("#hill-position-text").html(i18next.t("insert.hillPosition.enum." + this._vals.hillPosition));
        if (this._vals.water !== "") $("#water-text").html(i18next.t("insert.water.enum." + this._vals.water));
        if (this._vals.vegetation !== "") $("#vegetation-text").html(i18next.t("insert.vegetation.enum." + this._vals.vegetation));
        if (this._vals.mitigation !== "") $("#mitigation-text").html(i18next.t("insert.mitigation.enum." + this._vals.mitigation));
        if (this._vals.monitoring !== "") $("#monitoring-text").html(i18next.t("insert.monitoring.enum." + this._vals.monitoring));
        if (this._vals.damages !== "") $("#damages-text").html(i18next.t("insert.damages.enum." + this._vals.damages));
        if (this._vals.notes !== "") $("#notes-text").html(i18next.t("insert.notes.editText"));

      // Hiển thị ảnh
        this._$photoThm.find("img").attr("src", this._vals.photo).show();

        // Ẩn biểu tượng
        this._$photoThm.find("i").hide();

       // Mở hoạt động
        this.open();

    }

    /**Đóng hoạt động và đặt lại các trường. */
    close() {

        // Đưa hoạt động ra khỏi ngăn xếp
        utils.popStackActivity();

        // Đặt id, cờ chuyên gia và ảnh cũ thành null
        this._lsId     = null;
        this._isExpert = null;
        this._oldPhoto = null;
        this._isLocal  = null;

        // Ẩn màn hình
        this._screen.scrollTop(0).hide();

        // Nghỉ ngơi các hộp thoại hiện đang mở
        this._currOpenedDialog     = null;
        this._currOpenedFullDialog = null;

        // Đặt tất cả các giá trị thành ""
        Object.keys(this._vals).forEach(v => this._vals[v] = "");

        // Đặt danh sách thành []
        this._vals.mitigationList = [];
        this._vals.monitoringList = [];
        this._vals.damagesList    = [];

        // Ẩn các trường của chế độ chuyên gia
        $("#hill-position-request-wrapper").hide();
        $("#vegetation-request-wrapper").hide();
        $("#monitoring-request-wrapper").hide();
        $("#damages-request-wrapper").hide();
        $("#notes-request-wrapper").hide();

        // Đặt lại tất cả các văn bản trên màn hình chính
        $("#ls-type-text").html(i18next.t("insert.type.defaultText"));
        $("#material-type-text").html(i18next.t("insert.materialType.defaultText"));
        $("#hill-position-text").html(i18next.t("insert.hillPosition.defaultText"));
        $("#water-text").html(i18next.t("insert.water.defaultText"));
        $("#vegetation-text").html(i18next.t("insert.vegetation.defaultText"));
        $("#mitigation-text").html(i18next.t("insert.mitigation.defaultText"));
        $("#monitoring-text").html(i18next.t("insert.monitoring.defaultText"));
        $("#damages-text").html(i18next.t("insert.damages.defaultText"));
        $("#notes-text").html(i18next.t("insert.notes.defaultText"));

        // Ẩn ảnh
        this._$photoThm.find("img").attr("src", "img/img-placeholder-200.png").hide();

       // Hiện biểu tượng
        this._$photoThm.find("i").show();

    }

/** Xác định hành vi của nút quay lại cho hoạt động này */
    onBackPressed() {

       // Nếu một hộp thoại hiện đang được mở
        if (this._currOpenedDialog) {

           // Đóng hộp thoại
            this.closeDialog(this._currOpenedDialog);

            // Return
            return;

        }

        // Nếu một hộp thoại đầy đủ hiện đang được mở
        if (this._currOpenedFullDialog) {

            // Đóng hộp thoại đầy đủ
            this.closeFullscreenDialog(this._currOpenedFullDialog);

            // Return
            return;

        }


        // Yêu cầu xác nhận và sau đó đóng hoạt động
        utils.createAlert(
            "",
            i18next.t("dialogs.insert.confirmClose"),
            i18next.t("dialogs.insert.btnKeepEditing"),
            null,
            i18next.t("dialogs.insert.btnDiscard"),
            () => { this.close() }
        );

    }


   /** Khởi tạo giao diện người dùng. */
    initUI() {

       // Nếu người dùng nhấp vào nút "đóng", hãy yêu cầu xác nhận và sau đó đóng hoạt động
        $("#new-ls-close").click(() => {

            utils.createAlert(
                "",
                i18next.t("dialogs.insert.confirmClose"),
                i18next.t("dialogs.insert.btnKeepEditing"),
                null,
                i18next.t("dialogs.insert.btnDiscard"),
                () => { this.close() }
            );

        });

        // Khi người dùng nhấp vào nút "xong", hãy kiểm tra các trường và thêm/cập nhật rác
        $("#new-ls-done").click(() => {

            // Nếu người dùng chưa chỉ định loại, trả về
            if (this._vals.type === "") {
                utils.logOrToast(i18next.t("messages.mandatoryLsType"), "long");
                return;
            }

            // Nếu người dùng chưa chèn ảnh, hãy quay lại
            if (this._vals.photo === "") {
                utils.logOrToast(i18next.t("messages.mandatoryPhoto"), "long");
                return;
            }

           // Nếu ứng dụng ở chế độ chuyên gia, hãy sửa một số trường
            if (App.isExpertMode) {
                if (this._vals.mitigation !== "yes") this._vals.mitigationList = [];
                if (this._vals.monitoring !== "yes") this._vals.monitoringList = [];
                if (this._vals.damages !== "directDamage") this._vals.damagesList = [];
            }

            // Nếu hoạt động ở chế độ "đăng", hãy đăng
            if (!this._lsId) {

                // NẾU người dùng là khách
                if (app.isGuest) {

                    // Yêu cầu người dùng xác nhận và đăng cục bộ
                    utils.createAlert(
                        "",
                        i18next.t("dialogs.postGuest"),
                        i18next.t("dialogs.btnNo"),
                        null,
                        i18next.t("dialogs.btnYes"),
                        () => this.postLocal()
                    );

                    // Return
                    return;

                }

                // Nếu không có kết nối
                if (!navigator.onLine) {

                   // Yêu cầu người dùng xác nhận và đăng cục bộ
                    utils.createAlert(
                        "",
                        i18next.t("dialogs.postOffline"),
                        i18next.t("dialogs.btnNo"),
                        null,
                        i18next.t("dialogs.btnYes"),
                        () => this.postLocal()
                    );

                    // Return
                    return;

                }

               // Đăng lên server
                this.postRemote();

            }

            // Khác, đặt
            else {

                // Nếu ứng dụng trực tuyến, hãy đưa lên máy chủ
                if (!this._isLocal) this.putRemote();

                // Khác, đưa vào cơ sở dữ liệu cục bộ
                else this.putLocal();

            }

        });


        // Được kích hoạt khi người dùng nhấp vào yêu cầu "loại"
        $("#ls-type-request").click(() => {

            // Khởi tạo giá trị cần chọn trong selector
            let toSelect = this._vals.type;

            // Nếu người dùng chưa chỉ định loại, hãy chọn "rockfall"
            if (this._vals.type === "") toSelect = "rockfall";

            // Thay đổi tùy chọn đã chọn của bộ chọn
            $("input[name='type'][value='" + toSelect + "']").prop("checked", "true");

            // Mở hộp thoại
            this.openFullscreenDialog($("#dialog-ls-type"));

        });

        // Được kích hoạt khi người dùng nhấp vào "hủy"
        $("#ls-type-close").click(() => this.closeFullscreenDialog($("#dialog-ls-type")));

       // Được kích hoạt khi người dùng nhấp vào "ok"
        $("#ls-type-done").click(() => {

           // Lưu giá trị
            this._vals.type = $("input[name='type']:checked").val();

            // Đặt văn bản của trang chính
            $("#ls-type-text").html(i18next.t("insert.type.enum." + this._vals.type));

           // Đóng hộp thoại
            this.closeFullscreenDialog($("#dialog-ls-type"));

        });


        // Được kích hoạt khi người dùng nhấp vào yêu cầu "loại vật liệu"
        $("#material-type-request").click(() => {

            // Khởi tạo giá trị cần chọn trong selector
            let toSelect = this._vals.materialType;

            // Nếu người dùng chưa chỉ định loại vật liệu, hãy chọn "rock"
            if (this._vals.materialType === "") toSelect = "rock";

            // Đặt giá trị của bộ chọn
            $("input[name='materialType'][value='" + toSelect + "']").prop("checked", "true");

            // Open the dialog
            this.openDialog($("#dialog-material-type"));

        });

       // Được kích hoạt khi người dùng nhấp vào "hủy"
        $("#material-type-cancel").click(() => this.closeDialog($("#dialog-material-type")));

        // Được kích hoạt khi người dùng nhấp vào "ok"
        $("#material-type-ok").click(() => {

            // Lưu giá trị của selector
            this._vals.materialType = $("input[name='materialType']:checked").val();

           // Đặt văn bản của trang chính
            $("#material-type-text").html(i18next.t("insert.materialType.enum." + this._vals.materialType));

            // Close the dialog
            this.closeDialog($("#dialog-material-type"));

        });


        // Được kích hoạt khi người dùng nhấp vào
        $("#hill-position-request").click(() => {

            // Khởi tạo giá trị cần chọn trong selector
            let toSelect = this._vals.hillPosition;

            // Nếu người dùng chưa chỉ định vị trí , hãy chọn "atTheTop"
            if (this._vals.hillPosition === "") toSelect = "atTheTop";

           // Đặt giá trị của bộ chọn
            $("input[name='hillPosition'][value='" + toSelect + "']").prop("checked", "true");

            // Open the dialog
            this.openDialog($("#dialog-hill-position"));

        });

        $("#hill-position-cancel").click(() => this.closeDialog($("#dialog-hill-position")));

        $("#hill-position-ok").click(() => {

            this._vals.hillPosition = $("input[name='hillPosition']:checked").val();

            $("#hill-position-text").html(i18next.t("insert.hillPosition.enum." + this._vals.hillPosition));

            this.closeDialog($("#dialog-hill-position"));

        });


        $("#water-request").click(() => {

            let toSelect = this._vals.water;

            if (this._vals.water === "") toSelect = "dry";
            $("input[name='water'][value='" + toSelect + "']").prop("checked", "true");

            this.openDialog($("#dialog-water"));

        });

        $("#water-cancel").click(() => this.closeDialog($("#dialog-water")));

        $("#water-ok").click(() => {

            this._vals.water = $("input[name='water']:checked").val();

            $("#water-text").html(i18next.t("insert.water.enum." + this._vals.water));

            this.closeDialog($("#dialog-water"));

        });


        $("#vegetation-request").click(() => {

            let toSelect = this._vals.vegetation;

            if (this._vals.vegetation === "") toSelect = "grass";

            $("input[name='vegetation'][value='" + toSelect + "']").prop("checked", "true");

            this.openDialog($("#dialog-vegetation"));

        });

        $("#vegetation-cancel").click(() => this.closeDialog($("#dialog-vegetation")));

        $("#vegetation-ok").click(() => {

            this._vals.vegetation = $("input[name='vegetation']:checked").val();

            $("#vegetation-text").html(i18next.t("insert.vegetation.enum." + this._vals.vegetation));

            this.closeDialog($("#dialog-vegetation"));

        });


        $("#mitigation-request").click(() => {

            let toSelect = this._vals.mitigation;

            if (this._vals.mitigation === "") toSelect = "yes";

            if ((this._lsId && this._isExpert) || (!this._lsId && App.isExpertMode)) {

                $("input[name='mitigationExpert'][value='" + toSelect + "']").prop("checked", "true");

                if (toSelect === "yes") $("#mitigations-wrapper").show();

                else $("#mitigations-wrapper").hide();

                this._newMitigationList = [];

                this.clearDomList("mitigation-list");

                this._vals.mitigationList.forEach(item => this.createMitigationItem(item.type));

                this.openFullscreenDialog($("#dialog-mitigation-expert"));

            }

           else {

                // Select the value
                $("input[name='mitigationBase'][value='" + toSelect + "']").prop("checked", "true");

                // Open the dialog
                this.openDialog($("#dialog-mitigation-base"));

            }

        });

        $("#mitigation-base-cancel").click(() => this.closeDialog($("#dialog-mitigation-base")));

        $("#mitigation-base-ok").click(() => {

            this._vals.mitigation = $("input[name='mitigationBase']:checked").val();

            $("#mitigation-text").html(i18next.t("insert.mitigation.enum." + this._vals.mitigation));

            this.closeDialog($("#dialog-mitigation-base"));

        });

        $("#mitigation-expert-close").click(() => this.closeFullscreenDialog($("#dialog-mitigation-expert")));

        $("#mitigation-expert-done").click(() => {
            this._vals.mitigation = $("input[name='mitigationExpert']:checked").val();

            this._vals.mitigationList = this._newMitigationList.filter(e => e !== "");

            $("#mitigation-text").html(i18next.t("insert.mitigation.editText"));

            this.closeFullscreenDialog($("#dialog-mitigation-expert"))

        });

        $("input[name='mitigationExpert']").change(() => {
            let checked = $("input[name='mitigationExpert']:checked").val();

            if (checked === "yes") $("#mitigations-wrapper").show();

            // Else, hide it
            else $("#mitigations-wrapper").hide();

        });

        $("#mitigation-add").click(() => this.openDialog($("#dialog-mitigation-expert-new")));

        $("#mitigation-type-select").change(() => utils.changeSelectorLabel("mitigation-type-select"));

        $("#mitigation-expert-new-cancel").click(() => {

            this.closeDialog($("#dialog-mitigation-expert-new"));

            // Reset the label
            utils.resetSelector("mitigation-type-select");

        });

        $("#mitigation-expert-new-ok").click(() => {

            // Save the type
            let type = $("#mitigation-type-select").val();

            if (type === "none") {
                utils.logOrToast(i18next.t("messages.mandatoryOption"), "long");
                return;
            }

            // Create a new mitigation item
            this.createMitigationItem(type);

            // Close the dialog
            this.closeDialog($("#dialog-mitigation-expert-new"));

            // Reset the label
            utils.resetSelector("mitigation-type-select");

        });


        // Fired when the user clicks on the "monitoring" request
        $("#monitoring-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect = this._vals.monitoring;

            // If the user hasn't already specified the monitoring, select "yes"
            if (this._vals.monitoring === "") toSelect = "yes";

            // Select the value
            $("input[name='monitoring'][value='" + toSelect + "']").prop("checked", "true");

            // If the user has selected the option "yes", show the option to specify the mitigation list
            if (toSelect === "yes") $("#monitoring-wrapper").show();

            // Else, hide it
            else $("#monitoring-wrapper").hide();

            // Empty the temporary list
            this._newMonitoringList = [];

            // Clear the dom list
            this.clearDomList("monitoring-list");

            // Display each item in the mitigation list
            this._vals.monitoringList.forEach(item => this.createMonitoringItem(item.type, item.status));

            // Open the dialog
            this.openFullscreenDialog($("#dialog-monitoring"));

        });

        // Fired when the user clicks on "close" on the dialog
        $("#monitoring-close").click(() => this.closeFullscreenDialog($("#dialog-monitoring")));

        // Fired when the user clicks on "done" on the dialog
        $("#monitoring-done").click(() => {

            // Save the value
            this._vals.monitoring = $("input[name='monitoring']:checked").val();

            // Save in the list all the elements of the temporary list that are not empty
            this._vals.monitoringList = this._newMonitoringList.filter(e => e !== "");

            // Set the text on the main page
            $("#monitoring-text").html(i18next.t("insert.monitoring.editText"));

            // Close the dialog
            this.closeFullscreenDialog($("#dialog-monitoring"))

        });

        // Fired when the selected option is changed
        $("input[name='monitoring']").change(() => {

            // Save the selected value
            let checked = $("input[name='monitoring']:checked").val();

            // If the selected value is "yes", show the option to add a new monitoring object
            if (checked === "yes") $("#monitoring-wrapper").show();

            // Else, hide it
            else $("#monitoring-wrapper").hide();

        });

        // Fired when the user clicks on "add" on the dialog opened in expert mode
        $("#monitoring-add").click(() => this.openDialog($("#dialog-monitoring-new")));

        // When the selected option is changed, update the label
        $("#monitoring-type-select").change(() => utils.changeSelectorLabel("monitoring-type-select"));

        // When the selected option is changed, update the label
        $("#monitoring-status-select").change(() => utils.changeSelectorLabel("monitoring-status-select"));

        // Fired when the user clicks on "cancel" on the dialog to insert a new monitoring object
        $("#monitoring-new-cancel").click(() => {

            // Close the dialog
            this.closeDialog($("#dialog-monitoring-new"));

            // Reset the label
            utils.resetSelector("monitoring-type-select");
            utils.resetSelector("monitoring-status-select");

        });

        // Fired when the user clicks on "ok" on the dialog to insert a new monitoring object
        $("#monitoring-new-ok").click(() => {

            // Save the values
            let type   = $("#monitoring-type-select").val(),
                status = $("#monitoring-status-select").val();

            // If the type or the status is none, alert the user and return
            if (type === "none" || status === "none") {
                utils.logOrToast(i18next.t("messages.mandatoryMonitoringFields"), "long");
                return;
            }

            // Create a new monitoring item
            this.createMonitoringItem(type, status);

            // Close the dialog
            this.closeDialog($("#dialog-monitoring-new"));

            // Reset the label
            utils.resetSelector("monitoring-type-select");
            utils.resetSelector("monitoring-status-select");

        });


        // Fired when the user clicks on the "damage" request
        $("#damages-request").click(() => {

            // Initialize the value to select in the selector
            let toSelect = this._vals.damages;

            // If the user hasn't already specified the damages, select "noDamage"
            if (this._vals.damages === "") toSelect = "noDamage";

            // Select the value
            $("input[name='damages'][value='" + toSelect + "']").prop("checked", "true");

            // If the user has selected the option "directDamage", show the option to specify the damages list
            if (toSelect === "directDamage") $("#damages-wrapper").show();

            // Else, hide it
            else $("#damages-wrapper").hide();

            // Empty the temporary list
            this._newDamagesList = [];

            // Clear the dom list
            this.clearDomList("damages-list");

            // Display each item in the mitigation list
            this._vals.damagesList.forEach(item => this.createDamagesItem(item.type, item.specification));

            // Open the dialog
            this.openFullscreenDialog($("#dialog-damages"));

        });

        // Fired when the user clicks on "close" on the dialog
        $("#damages-close").click(() => this.closeFullscreenDialog($("#dialog-damages")));

        // Fired when the user clicks on "done" on the dialog
        $("#damages-done").click(() => {

            // Save the value
            this._vals.damages = $("input[name='damages']:checked").val();

            // Save in the list all the elements of the temporary list that are not empty
            this._vals.damagesList = this._newDamagesList.filter(e => e !== "");

            // Set the text on the main page
            $("#damages-text").html(i18next.t("insert.damages.editText"));

            // Close the dialog
            this.closeFullscreenDialog($("#dialog-damages"))

        });

        // Fired when the selected option is changed
        $("input[name='damages']").change(() => {

            // Save the selected value
            let checked = $("input[name='damages']:checked").val();

            // If the selected value is "directDamage", show the option to add a new damaged object
            if (checked === "directDamage") $("#damages-wrapper").show();

            // Else, hide it
            else $("#damages-wrapper").hide();

        });

        // Fired when the user clicks on "add" on the dialog opened in expert mode
        $("#damages-add").click(() => this.openDialog($("#dialog-damages-new")));

        // When the selected option is changed
        $("#damages-type-select").change(() => {

            // Update the label
            utils.changeSelectorLabel("damages-type-select");

            // If the type selected is "other", show the input to specify the type
            if ($("#damages-type-select").val() === "other") $("#damage-other-input-wrapper").show();

            // Else, hide it
            else $("#damage-other-input-wrapper").hide();

        });

        // Fired when the user clicks on "cancel" on the dialog to insert a new damage
        $("#damages-new-cancel").click(() => {

            // Close the dialog
            this.closeDialog($("#dialog-damages-new"));

            // Reset the label
            utils.resetSelector("damages-type-select");

            // Reset the text input and hide it
            $("#damage-other-input").val("");
            $("#damage-other-input-wrapper").hide();

        });

        // Fired when the user clicks on "ok" on the dialog to insert a new damage
        $("#damages-new-ok").click(() => {

            // Save the values
            let type        = $("#damages-type-select").val(),
                $otherInput = $("#damage-other-input");

            // If the type  is none, alert the user and return
            if (type === "none") {
                utils.logOrToast(i18next.t("messages.mandatoryOption"), "long");
                return;
            }

            // If the type is "other" and no specification is provided, alert the user and return
            if (type === "other" && $otherInput.val() === "") {
                utils.logOrToast(i18next.t("messages.mandatoryDamageOther"), "long");
                return;
            }

            // Set the specification
            let specification = "";

            // If the type is "other", save the value of the input
            if (type === "other") specification = $otherInput.val().toString();

            // Create a new monitoring item
            this.createDamagesItem(type, specification);

            // Close the dialog
            this.closeDialog($("#dialog-damages-new"));

            // Reset the label
            utils.resetSelector("damages-type-select");

            // Reset the text input and hide it
            $otherInput.val("");
            $("#damage-other-input-wrapper").hide();

        });


        // Fired when the user clicks on the "notes" request
        $("#notes-request").click(() => {

            // Set the value of the text field
            $("#notes").val(this._vals.notes);

            // Open the dialog
            this.openFullscreenDialog($("#dialog-notes"));

        });

        // Fired when the user clicks on "close"
        $("#notes-close").click(() => this.closeFullscreenDialog($("#dialog-notes")));

        // Fired when the user clicks on "done"
        $("#notes-done").click(() => {

            // Save the value
            this._vals.notes = $("#notes").val();

            // Set the text of the main page
            $("#notes-text").html(i18next.t("insert.notes.editText"));

            // Close the dialog
            this.closeFullscreenDialog($("#dialog-notes"));

        });


        // Fired when the user clicks on the photo thumbnail
        this._$photoThm.click(() => {

            // If no photo has been taken, get a picture
            if (this._vals.photo === "") this.getPicture();

            // Else open the image screen to show the photo
            else
                utils.openImgScreen(
                    this._$photoThm.find("img").attr("src"),
                    true,
                    () => this.getPicture(),
                    () => {

                        // Delete the saved photo
                        this._vals.photo = "";

                        // Set the placeholder
                        this._$photoThm.find("img").attr("src", "img/img-placeholder-200.png").hide();

                        // Show the icon
                        this._$photoThm.find("i").show();

                    }
                )

        });

    }


    /** Take a picture with the phone camera. */
    getPicture() {

        // Options for the photo
        const opt = {
            quality           : 30,                              // Output quality is 30% of the original photo
            destinationType   : Camera.DestinationType.FILE_URI, // Output as a file uri
            sourceType        : Camera.PictureSourceType.CAMERA, // Take only from the camera (not from the gallery)
            encodingType      : Camera.EncodingType.JPEG,        // Encode the output as jpeg
            mediaType         : Camera.MediaType.PICTURE,        // The output is a picture
            allowEdit         : false,                           // Prevent editing
            correctOrientation: true                             // Automatically correct the orientation of the picture
        };

        // Get the picture
        navigator.camera.getPicture(
            // Fired if the picture is taken successfully
            fileURI => {

                // Save the uri of the photo
                this._vals.photo = fileURI;

                // Show the image on the thumbnail
                this._$photoThm.find("img").attr("src", this._vals.photo).show();

                // Hide the placeholder
                this._$photoThm.find("i").hide();

            },

            // Fired if there is an error
            err => {
                console.log(`Error taking picture ${err}`);

                // Alert the user
                utils.createAlert("", i18next.t("dialogs.insert.pictureError"), i18next.t("dialogs.btnOk"));

            },

            // Camera options
            opt
        );

    }


    /** Insert a new rác in the local database. */
    postLocal() {

        // Open the loader
        utils.openLoader();

        // Lưu tất cả dữ liệu
        const data = {
            _id                : utils.generateUID(),
            createdAt          : new Date().toISOString(),
            updatedAt          : new Date().toISOString(),
            expert             : App.isExpertMode.toString(),
            coordinates        : this._vals.coordinates,
            coordinatesAccuracy: this._vals.coordinatesAccuracy,
            altitude           : this._vals.altitude,
            altitudeAccuracy   : this._vals.altitudeAccuracy,
            type               : this._vals.type,
            materialType       : this._vals.materialType,
            hillPosition       : this._vals.hillPosition,
            water              : this._vals.water,
            vegetation         : this._vals.vegetation,
            mitigation         : this._vals.mitigation,
            mitigationList     : this._vals.mitigationList,
            monitoring         : this._vals.monitoring,
            monitoringList     : this._vals.monitoringList,
            damages            : this._vals.damages,
            damagesList        : this._vals.damagesList,
            notes              : this._vals.notes,
            imageUrl           : this._vals.photo
        };

        // Move the image
        utils.moveImage(data.imageUrl)
            .then(url => {

                // Save the new url
                data.imageUrl = url;

                // Post
                return landslide.postLocal(data)

            })
            .then(data => {

                // Close the loader
                utils.closeLoader();

                // Show
                landslide.show(data.id, data.coords, data.preciseCoordinates, true);

                // Show the sync notification
                $("#sync-notification").show();

                // Close the activity
                this.close();

            });

    }

    /** Inserte in the remote database. */
    postRemote() {

        // Open the loader
        utils.openLoader();

        // Create the formData object
        const formData = new FormData();

        // Nối vào formData tất cả dữ liệu
        formData.append("expert", App.isExpertMode.toString());
        formData.append("coordinates", JSON.stringify(this._vals.coordinates));
        formData.append("coordinatesAccuracy", this._vals.coordinatesAccuracy);
        formData.append("altitude", this._vals.altitude);
        formData.append("altitudeAccuracy", this._vals.altitudeAccuracy);
        formData.append("type", this._vals.type);
        formData.append("materialType", this._vals.materialType);
        formData.append("hillPosition", this._vals.hillPosition);
        formData.append("water", this._vals.water);
        formData.append("vegetation", this._vals.vegetation);
        formData.append("mitigation", this._vals.mitigation);
        formData.append("mitigationList", JSON.stringify(this._vals.mitigationList));
        formData.append("monitoring", this._vals.monitoring);
        formData.append("monitoringList", JSON.stringify(this._vals.monitoringList));
        formData.append("damages", this._vals.damages);
        formData.append("damagesList", JSON.stringify(this._vals.damagesList));
        formData.append("notes", this._vals.notes);

        // Append the image
        utils.appendFile(formData, this._vals.photo)
            .then(formData => {

                // Post
                return landslide.post(formData);

            })
            .then((data) => {

                // Close the loader
                utils.closeLoader();

                // Show
                landslide.show(data.id, data.coords, data.preciseCoordinates, false);

                // Close the activity
                this.close();

            });

    }


    /** Modifies  already in the local database. */
    putLocal() {

        // Open the loader
        utils.openLoader();

        // Lưu tất cả dữ liệu
        const data = {
            updatedAt     : new Date().toISOString(),
            type          : this._vals.type,
            materialType  : this._vals.materialType,
            hillPosition  : this._vals.hillPosition,
            water         : this._vals.water,
            vegetation    : this._vals.vegetation,
            mitigation    : this._vals.mitigation,
            mitigationList: this._vals.mitigationList,
            monitoring    : this._vals.monitoring,
            monitoringList: this._vals.monitoringList,
            damages       : this._vals.damages,
            damagesList   : this._vals.damagesList,
            notes         : this._vals.notes
        };


      // Chức năng tiện ích và cuối cùng xóa ảnh cũ
        const put = removeOld => {

            //Đặt cục bộ
            landslide.putLocal(this._lsId, data)
                .then(() => {

                    // Nếu removeOld là đúng, hãy xóa hình ảnh cũ
                    if (removeOld) utils.deleteImage(this._oldPhoto, false);

                    // Đóng bộ nạp
                    utils.closeLoader();

                    // Mở hoạt động thông tin
                    InfoActivity.getInstance().getLandslide(data.id, true);

                    // Close the activity
                    InsertActivity.getInstance().close();

                });


        };

      // Ảnh chưa đổi thì cứ đặt trong garbage
        if (this._vals.photo === this._oldPhoto) put(false);

        // Else
        else {

           // Di chuyển hình ảnh mới
            utils.moveImage(this._vals.photo)
                .then(url => {

                    //Lưu url mới
                    data.imageUrl = url;

                    // Đặt và xóa hình ảnh cũ
                    put(true);

                });

        }

    }

/** Sửa đổi một rác trong cơ sở dữ liệu từ xa. */
    putRemote() {

        // Mở bộ nạp
        utils.openLoader();

        //Tạo đối tượng formData
        const formData = new FormData();

        //Nối vào formData tất cả dữ liệu
        formData.append("type", this._vals.type);
        formData.append("materialType", this._vals.materialType);
        formData.append("hillPosition", this._vals.hillPosition);
        formData.append("water", this._vals.water);
        formData.append("vegetation", this._vals.vegetation);
        formData.append("mitigation", this._vals.mitigation);
        formData.append("mitigationList", JSON.stringify(this._vals.mitigationList));
        formData.append("monitoring", this._vals.monitoring);
        formData.append("monitoringList", JSON.stringify(this._vals.monitoringList));
        formData.append("damages", this._vals.damages);
        formData.append("damagesList", JSON.stringify(this._vals.damagesList));
        formData.append("notes", this._vals.notes);


        // Tạo một biến tạm thời
        let file = null;

        // Nếu ảnh đã được thay đổi, hãy lưu nó vào biến tạm thời
        if (this._vals.photo !== this._oldPhoto) file = this._vals.photo;

        // Nối hình ảnh
        utils.appendFile(formData, file)
            .then(formData => {

                // Put
                return landslide.put(InsertActivity.getInstance()._lsId, formData);

            })
            .then((data) => {

                // Hiển thị thông tin
                InfoActivity.getInstance().getLandslide(data.id, false);

                // Đóng bộ nạp
                utils.closeLoader();

                //Đóng hoạt động
                InsertActivity.getInstance().close();

            });

    }


 /*************************************************** ***************************
      * Phương thức tiện ích
      *************************************************** *********************/

     /**
      * Mở hộp thoại toàn màn hình.
      *
      * Hộp thoại @param {object} - Hộp thoại để mở
      */
    openFullscreenDialog(dialog) {

        // Hiện hộp thoại
        dialog.show();

        // Đặt hộp thoại đầy đủ hiện đang mở thành hộp thoại
        this._currOpenedFullDialog = dialog;

    }

  /**
       * Đóng hộp thoại toàn màn hình.
       *
       * Hộp thoại @param {object} - hộp thoại để đóng.
       */
    closeFullscreenDialog(dialog) {

        // Ẩn hộp thoại
        dialog.scrollTop(0).hide();

        // Đặt hộp thoại đầy đủ hiện đang mở thành null
        this._currOpenedFullDialog = null;

    }


   /**
        * Mở một hộp thoại.
        *
        * @param {object} toOpen - Hộp thoại để mở
        */
    openDialog(toOpen) {

        // Hiển thị lớp phủ mờ
        $("#opaque-overlay").show();

        //Ẩn y-overflow của trang chính
        $("#page--insert").css("overflow-y", "hidden");

        // Hiển thị hộp thoại
        toOpen.show();

        // Đặt hộp thoại hiện đang mở thành hộp thoại
        this._currOpenedDialog = toOpen;

    }

  /**
       * Đóng hộp thoại.
       *
       * @param {object} toClose - Hộp thoại để đóng.
       */
    closeDialog(toClose) {

        //Ẩn hộp thoại
        toClose.hide();

        // Ẩn lớp phủ mờ
        $("#opaque-overlay").hide();

        // Đặt tràn y của trang chính thành "cuộn"
        $("#page--insert").css("overflow-y", "scroll");

        // Đặt hộp thoại hiện đang mở thành null
        this._currOpenedDialog = null;

    }


 /**
      * Xóa danh sách trong DOM.
      *
      * @param {string} listId - Id của danh sách
      */
    clearDomList(listId) { $("#" + listId).html("") }

 /**
      * Xóa một mục khỏi danh sách và mục nhập DOM tương ứng.
      *
      * Danh sách @param {object[]} - Danh sách.
      * @param {string} listId - Id của phần tử DOM.
      * @param{string} idx - Chỉ số của phần tử cần xóa (có dạng "tên_của_danh_sách").
      */
    deleteListItem(list, listId, idx) {

        // Xóa phần tử DOM
        $(`#${idx}`).parent().remove();

        // Trích xuất số từ chỉ mục
        idx = idx.substring(idx.indexOf("-") + 1);

       // Xóa phần tử khỏi danh sách
        list[idx] = "";

    }


 /**
      * Tạo một mục mới trong hiện trạng
      *
      * @param {string} type - Loại hiện trạng
      */
    createMitigationItem(type) {

        // Đặt id của nút
        let btnId = "mitigation-" + this._newMitigationList.length;

       // Nối phần tử mới vào danh sách
        $("#mitigation-list").append(`

            <section class='list-item no-padding'>

                <div class='list-item-text'>
                    <p class='list-item-text-p'>${i18next.t("insert.mitigation.enum." + type)}</p>
                </div>

                <div id='${btnId}' class='details-list-item-delete'>
                    <i class='material-icons'>cancel</i>
                </div>

            </section>

        `);

      // Thiết lập hành vi của nút
        $(`#${btnId}`).click(() => this.deleteListItem(this._newMitigationList, "mitigation-list", btnId));

// Đẩy mục trong danh sách tạm thời
        this._newMitigationList.push({ type: type });

    }

   /**
        * Tạo một mục mới trong danh sách giám sát.
        *
        * @param {string} type - Loại công việc giám sát.
        * Trạng thái @param {string} - Trạng thái của công việc giám sát.
        */
    createMonitoringItem(type, status) {

       // Đặt id của nút
        let btnId = "monitoring-" + this._newMonitoringList.length;

        // Nối phần tử mới vào danh sách
        $("#monitoring-list").append(`

            <section class='list-item'>

                <div class='list-item-text padding-start'>

                    <p class='list-item-text-p'>

                        <span class='list-item-entry-title' data-i18n='insert.monitoring.type'>Type: </span>
                        ${i18next.t("insert.monitoring.enum." + type)}

                    </p>

                    <p class='list-item-text-p'>

                        <span class='list-item-entry-title' data-i18n='insert.monitoring.status'>Status: </span>
                        ${i18next.t("insert.monitoring.enum." + status)}

                    </p>

                </div>

                <div id='${btnId}' class='details-list-item-delete'><i class='material-icons'>cancel</i></div>

            </section>

        `);

        // Thiết lập hành vi của nút
        $(`#${btnId}`).click(() => this.deleteListItem(this._newMonitoringList, "monitoring-list", btnId));

       // Đẩy mục trong danh sách tạm thời
        this._newMonitoringList.push({ type: type, status: status });

    }

/**
     * Tạo một mục mới trong danh sách thiệt hại.
     *
     * @param {string} type - Loại biện pháp giảm thiểu.
     * Đặc tả @param {string} - Đặc tả cho loại "khác".
     */
    createDamagesItem(type, specification) {

       // Đặt id của nút
        let btnId = "damage-" + this._newDamagesList.length;

       // Lấy văn bản để hiển thị
        let info = i18next.t("insert.damages.enum." + type);

        // Nếu có thông số kỹ thuật, hãy đặt nó dưới dạng văn bản để hiển thị
        if (specification !== "") info = specification;

       // Nối phần tử mới vào danh sách
        $("#damages-list").append(`

            <section class='list-item no-padding'>

                <div class='list-item-text padding-start'>
                    <p class='list-item-text-p'>${info}</p>
                </div>

                <div id='${btnId}' class='details-list-item-delete'><i class='material-icons'>cancel</i></div>

            </section>

        `);

        // Thiết lập hành vi của nút
        $(`#${btnId}`).click(() => this.deleteListItem(this._newDamagesList, "damages-list", btnId));

       // Đẩy mục trong danh sách tạm thời
        this._newDamagesList.push({ type: type, specification: specification });

    }

}
