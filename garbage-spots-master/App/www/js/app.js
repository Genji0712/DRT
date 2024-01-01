"use strict";

let app;

$(() => document.addEventListener("deviceready", () => app = new App(), false));


class App {

    static get appLanguage() {

        const localStorageLng = localStorage.getItem("lng");
        console.log("Local stored language: ", localStorageLng);
        if (localStorageLng)
            return localStorageLng;

        const phoneLang = navigator.language;
        console.log("Phone language: ", phoneLang);
		if (phoneLang === "it" || phoneLang === "it-IT")
            return "it";
		else
			return "en";

        if (phoneLang === "vi" || phoneLang === "vi-VN")
            return "vi";
		else
			return "en";

    }

    /** Cờ cho biết ứng dụng đang ở chế độ chuyên gia. */
    static get isExpertMode() { return localStorage.getItem("mode") === "true" };

    /** Tên của cơ sở dữ liệu cục bộ. */
    static get localDbName() { return "DRT" };

    /** Phiên bản hiện tại của cơ sở dữ liệu cục bộ. */
    static get localDbVersion() { return 1 }


    /**
         * Tạo và khởi tạo hoạt động cũng như dịch vụ quốc tế hóa.
         *
         * @người xây dựng
         */
    constructor() {

        // Nếu chế độ không được lưu trữ trong bộ nhớ cục bộ, hãy đặt thành false
        if (!localStorage.getItem("mode")) localStorage.setItem("mode", "false");

        // Cờ cho biết nếu trình theo dõi vị trí phải được gắn lại sau sự kiện "tạm dừng"
        this._toReattachPositionWatcher = false;

        // Số lần nút quay lại được nhấn liên tục
        this._backPressedCount = 0;

        // Gắn cờ cho biết nếu người dùng đang sử dụng ứng dụng với tư cách khách (nghĩa là không có kết nối internet nên không đăng nhập)
        this.isGuest = false;


        // Mảng với ngăn xếp các hoạt động hiện đang mở
        this.activityStack = [];


        // Đính kèm chức năng sẽ được kích hoạt khi xảy ra sự kiện "tạm dừng" hoặc "tiếp tục"
        document.addEventListener("pause", this.onPause, false);
        document.addEventListener("resume", this.onResume, false);

        // Thêm một người nghe cho lần nhấp vào nút màu đen
        document.addEventListener("backbutton", () => this.onBackPressed(), false);

        // Khởi tạo cơ sở dữ liệu cục bộ
        this.initLocalDb()
            .then(() => {

                // Khởi tạo dịch vụ quốc tế hóa
                this.initInternationalization();

            })
            .catch(() => {

                // Đặt db thành null
                this.db = null;

                // Cảnh báo người dùng
                utils.createAlert("", i18next.t("dialogs.openLocalDbError"), i18next.t("dialogs.btnOk"));

                // Khởi tạo dịch vụ quốc tế hóa
                this.initInternationalization();

            });

    }


    /** Xác định hành vi của nút quay lại cho toàn bộ ứng dụng. */
    onBackPressed() {

        // Nếu bất kỳ trình tải hoặc hộp thoại cảnh báo nào đang mở, hãy quay lại
        if (utils.isLoaderOpen || utils.isAlertOpen) return;

        // Nếu màn hình hình ảnh đang mở
        if (utils.isImgScreenOpen) {

           // Đóng màn hình ảnh
            utils.closeImgScreen();

            // Trở lại
            return;

        }

        // Thực hiện phương thức "onBackPression" của hoạt động cuối cùng trong ngăn xếp
        app.activityStack[app.activityStack.length - 1].onBackPressed();

    }


    /** Mở hoạt động đầu tiên dựa trên trạng thái xác thực. */
    open() {

       // Nếu không có phiên hợp lệ nào được lưu trữ, hãy mở trang đăng nhập
        if (!LoginActivity.getInstance().getAuthStatus()) LoginActivity.getInstance().open();

        // Nếu có phiên hợp lệ trong bộ lưu trữ, hãy mở bản đồ
        else MapActivity.getInstance().open();

        // Ẩn màn hình giật gân
        $("#splash").hide();

    }


    /** Khởi tạo dịch vụ quốc tế hóa bằng i18next. */
    initInternationalization() {

        console.log("Setting language to: ", App.appLanguage);

        // Khởi tạo dịch vụ quốc tế hóa
        i18next
            .use(i18nextXHRBackend)
            .init({
                lng        : App.appLanguage,
                fallbackLng: "en",
                ns         : "general",
                defaultNS  : "general",
                backend    : { loadPath: "./locales/{{lng}}/{{ns}}.json" }
            })
            .then(() => {

               // Gắn hàm kích hoạt khi thay đổi ngôn ngữ
                i18next.on("languageChanged", () => console.log(`lng changed to ${i18next.language}`));

                // Khởi tạo plugin jQuery
                jqueryI18next.init(i18next, $);

                // Dịch phần thân
                $("body").localize();

                // Mở hoạt động đầu tiên
                this.open();

            });

    }


    /** Khởi tạo cơ sở dữ liệu cục bộ bằng API IndexedDB. */
    initLocalDb() {

        // Khởi tạo biến cơ sở dữ liệu
        this.db = null;

        return new Promise((resolve, reject) => {

            // Tạo một yêu cầu mở
            const dbOpenRequest = window.indexedDB.open(App.localDbName, App.localDbVersion);

           // Kích hoạt nếu xảy ra lỗi
            dbOpenRequest.onerror = err => {

                console.error("Error opening the db", err);

                // Reject the promise
                reject();

            };

            // Kích hoạt nếu mở thành công
            dbOpenRequest.onsuccess = () => {

                console.log("Db opened");

                // Lưu kết quả vào biến cơ sở dữ liệu
                this.db = dbOpenRequest.result;

                // Resolve the promise
                resolve();

            };


            // Được kích hoạt nếu db cần được nâng cấp hoặc tạo
            dbOpenRequest.onupgradeneeded = () => {

                console.log("Upgrading or creating db...");

                // Lưu kết quả vào biến cơ sở dữ liệu
                this.db = dbOpenRequest.result;

              // Kích hoạt nếu xảy ra lỗi
                this.db.onerror = err => {

                    console.error("Error upgrading or creating the db", err);

                    // Reject the promise
                    reject();

                };


                // Tạo một kho đối tượng mới
                const objectStore = this.db.createObjectStore("landslides", { keyPath: "_id" });

                // Kích hoạt nếu xảy ra lỗi
                objectStore.transaction.onerror = err => {

                    console.error("Error creating the object store", err);

                   // Cảnh báo người dùng
                   // utils.createAlert("", i18next.t("dialogs.createLocalDbError"), i18next.t("dialogs.btnOk"));

                   // Từ chối lời hứa

                    reject();

                };

                // Kích hoạt nếu tạo thành công
                objectStore.transaction.oncomplete = () => {

                    console.log("Object store created");

                    // Giải quyết lời hứa
                    resolve();

                }

            }

        });

    }


    /** Khi ứng dụng bị tạm dừng, nó sẽ tách trình theo dõi vị trí. */
    onPause() {

        console.log("onPause");

       // Nếu một thể hiện của MapActivity đã được tạo
        if (MapActivity.hasInstance()) {

           // Nếu trình theo dõi vị trí được đính kèm trước sự kiện tạm dừng
            if (MapActivity.getInstance().isPositionWatcherAttached) {

               // Đặt cờ thành true
                app._toReattachPositionWatcher = true;

                    // Tháo bộ theo dõi vị trí
                MapActivity.getInstance().detachPositionWatcher();

            }

        }

    }

    /** Khi ứng dụng được tiếp tục, nó sẽ đính kèm lại trình theo dõi vị trí. */
    onResume() {

        console.log("onResume");

       // Nếu trình theo dõi vị trí phải được đính kèm lại
        if (app._toReattachPositionWatcher) {

           // Kiểm tra xem gps đã bật chưa và cuối cùng gắn thiết bị theo dõi vị trí
            MapActivity.getInstance().checkGPSOn(() => MapActivity.getInstance().attachPositionWatcher());

           // Đặt cờ thành false
            app._toReattachPositionWatcher = false;

        }

    }

}
