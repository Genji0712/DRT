"use strict";


class MapActivity {

    /** @private */ static _instance;

   /** Tọa độ mặc định của tâm bản đồ (tọa độ Việt Nam). */
    static get defaultLatLng() { return [21.0278, 105.8342] }

    /** Thu phóng mặc định của bản đồ. */
    static get defaultZoom() { return 11 }

    /** Thu phóng mặc định của bản đồ khi nó đang xem vị trí. */
    static get watcherZoom() { return 17 }


    /**
     * Creates and initializes the activity.
     * To implement the Singleton pattern, it should never be called directly. Use {@link MapActivity.getInstance}
     * to get the Singleton instance of the class.
     *
     * @constructor
     */
    constructor() {

        // Define the content of the div that houses the map
        $("#map-wrapper").html(`
        
            <div style="display: none" id="page--map">

                <div style="display: none" id="finding-position-msg"><p data-i18n="map.positionFinding"></p></div>

                    <div id="map-control-settings" class="map-control map-control-left map-control-top-1 fab">
                        <i class="material-icons fab-icon">settings</i>
                    </div>
            
                    <div id="map-control-sync" class="map-control map-control-left map-control-top-2 fab">
                        <div style="display: none" id="sync-notification"></div>
                        <i class="material-icons fab-icon">sync</i>
                    </div>
            
                    <div id="map-control-gps" class="map-control map-control-right map-control-top-1 fab">
                        <i class="material-icons fab-icon">gps_fixed</i>
                    </div>
            
                    <div id="map-new-ls" class="map-control map-control-center map-control-bottom fab-extended">
                        <p class="fab-extended-text" data-i18n="map.fabText"></p>
                    </div>

            </div>
        
        `);

       // Thêm văn bản đã dịch vào thông báo "tìm vị trí" và nút "điểm rác mới"
        $("#finding-position-msg p").localize();
        $("#map-new-ls p").localize();

      // Cache màn hình
        this._screen = $("#page--map");

     // Đặt chiều cao màn hình chiếm hết cửa sổ
        this._screen.height($(window).height());


        //Tạo đối tượng bản đồ
        this._map = L.map("page--map", {
            zoomSnap              : 0,       // mức thu phóng sẽ không bị ngắt sau khi chụm-thu phóng
            zoomAnimation         : true,    // bật hoạt hình thu phóng
            zoomAnimationThreshold: 4,       // không tạo hiệu ứng thu phóng nếu chênh lệch vượt quá 4
            fadeAnimation         : true,    // bật hoạt ảnh mờ dần ô xếp
            markerZoomAnimation   : true,    // điểm đánh dấu tạo hiệu ứng thu phóng của chúng bằng hoạt ảnh thu phóng
            touchZoom             : "center" // pinch-zoom sẽ phóng to đến trung tâm của chế độ xem
        });

        // Thêm bản đồ cơ sở từ OpenStreetMap vào bản đồ
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { errorTileUrl: "img/errorTile.png" })
            .addTo(this._map);


        // Cờ xác định xem bản đồ có phải được căn giữa tự động hay không khi tìm thấy một vị trí mới
        this._centerMap = true;

        // Cờ xác định xem liệu người dùng có tự động kích hoạt thu phóng bản đồ hay không
        this._autoZoom = true;

        // Cờ xác định nếu người dùng đã nhấp vào cụm điểm đánh dấu
        this._clusterClick = false;

        // Cờ xác định xem vị trí mà gps tìm thấy có phải là vị trí được tìm thấy đầu tiên không
        this._isFirstPositionFound = true;

        // Cờ xác định nếu trình theo dõi vị trí được đính kèm
        this.isPositionWatcherAttached = false;


        // Khởi tạo giao diện người dùng của hoạt động
        this.initUI();


        // Tạo lớp sẽ chứa các điểm đánh dấu rác
        this.markersLayer = L.markerClusterGroup();

        // Khi người dùng nhấp vào một cụm, hãy đặt clusterClick thành true
        this.markersLayer.on("clusterclick", () => this._clusterClick = true);

        // Khi hoạt ảnh gây ra bởi lần nhấp thứ của người dùng trên một cụm kết thúc, hãy đặt clusterClick thành false
        this.markersLayer.on("animationend", () => this._clusterClick = false);

        // Thêm lớp vào bản đồ
        this._map.addLayer(this.markersLayer);


        // Khởi tạo điểm đánh dấu vị trí
        this.initPositionMarker();


        // Lưu plugin chẩn đoán với bí danh để sử dụng sau
        this._d = cordova.plugins.diagnostic;

        // Đăng ký người theo dõi vị trí
        this.registerGPSWatcher();

    }

    /**
     * States if an instance of the class exists.
     *
     * @returns {boolean} True if an instance of the class exists
     */
    static hasInstance() { return !!MapActivity._instance }

    /** Xóa phiên bản hiện tại của hoạt động. */
    static deleteInstance() { MapActivity._instance = null }

    /**
     * Returns the current MapActivity instance if any, otherwise creates it.
     *
     * @returns {MapActivity} The activity instance.
     */
    static getInstance() {

        if (!MapActivity._instance)
            MapActivity._instance = new MapActivity();

        return MapActivity._instance;

    }


   /** Mở hoạt động và hiển thị các điểm rác của người dùng. */
    open() {

        // Đẩy hoạt động vào ngăn xếp
        utils.pushStackActivity(this);

        // Hiển thị màn hình
        this._screen.show();

        // Đặt chế độ xem ban đầu
        this._map.setView(MapActivity.defaultLatLng, MapActivity.defaultZoom);

        // Đặt vị trí ban đầu của điểm đánh dấu
        this.positionMarker.setLatLng(MapActivity.defaultLatLng);

        this.checkLocationPermissions();

        landslide.showAll();

    }

    close() {

        utils.popStackActivity();

        this._screen.hide();

        this.markersLayer.clearLayers();

        landslide.remoteMarkers = [];
        landslide.localMarkers  = [];

        $("#sync-notification").hide();


        this.detachPositionWatcher();

    }

 /** Xác định hành vi của nút quay lại cho hoạt động này */
    onBackPressed() {

     // Nếu đây là lần đầu tiên người dùng nhấp vào nút
        if (app._backPressedCount === 0) {

            // Cảnh báo người dùng
            utils.logOrToast(i18next.t("messages.backButton"), "short");

           // Tăng số đếm
            app._backPressedCount++;

      // Đặt khoảng thời gian mà sau đó số đếm được đặt lại về 0
            setInterval(() => app._backPressedCount = 0, 2000);

        }

        // Else, close the app
        else navigator.app.exitApp();

    }


    /** Initializes the map ui. */
    initUI() {

      // Ẩn các điều khiển mặc định của tờ rơi
        $(".leaflet-control-container").hide();

       // Đặt nút cho cài đặt
        $("#map-control-settings").click(() => SettingsActivity.getInstance().open());

    // Đặt nút để đồng bộ hóa
        $("#map-control-sync").click(() => {
        // Nếu phiên hết hạn, hãy quay lại
            if (utils.isTokenExpired()) return;

         // Nếu người dùng là khách
            if (app.isGuest) {

                // Alert the user
                utils.createAlert("", i18next.t("dialogs.syncGuest"), i18next.t("dialogs.btnOk"));

                // Return
                return;

            }

          // Nếu không có kết nối internet
            if (!navigator.onLine) {

                // Alert the user
                utils.createAlert("", i18next.t("dialogs.syncOffline"), i18next.t("dialogs.btnOk"));

                // Return
                return;

            }

            if (landslide.localMarkers.length === 0) {

               // Cảnh báo người dùng
                utils.logOrToast(i18next.t("messages.localDbEmpty"), "long");

                // Trở lại
                return;

            }

          // Yêu cầu xác nhận và đồng bộ cơ sở dữ liệu
            utils.createAlert(
                "",
                i18next.t("dialogs.syncConfirmation", { number: landslide.localMarkers.length }),
                i18next.t("dialogs.btnNo"),
                null,
                i18next.t("dialogs.btnYes"),
                async () => {

                  // Mở bộ nạp
                    utils.openLoader();

                    // Đồng bộ dữ liệu
                    let res = await landslide.sync();

                    // Hiển thị tất cả
                    landslide.showAll();

                   // Đóng bộ nạp
                    utils.closeLoader();

                    // Thông báo cho người dùng về kết quả đồng bộ hóa
                    utils.createAlert(
                        "",
                        `<p style="margin-bottom: 8px">${res.successes}/${res.total} ${i18next.t("dialogs.syncSuccesses")}</p>
                         <p style="margin-bottom: 8px">${res.insertErrors}/${res.total} ${i18next.t("dialogs.syncInsertErr")}</p>
                         <p>${res.deleteErrors}/${res.total} ${i18next.t("dialogs.syncDeleteErr")}</p>`,
                        i18next.t("dialogs.btnOk")
                    );

                }
            );

        });

        // Cache nút gps
        this._$gps = $("#map-control-gps");

        // Đặt hành vi nhấp vào nút gps
        this._$gps.click(() => this.handleGPSButton());

        // Đặt nút chèn dữ liệu
        $("#map-new-ls").click(() => InsertActivity.getInstance().open());


       // Nếu bản đồ bị kéo, hãy giải phóng nó
        this._map.on("dragstart", () => this.freeMap());

        // Khi sự kiện thu phóng bắt đầu, nếu không phải do hoạt ảnh gây ra, hãy giải phóng bản đồ
        this._map.on("zoomstart", () => { if (!this._autoZoom || this._clusterClick) this.freeMap() });

        // Được kích hoạt khi một chuyển động bản đồ kết thúc
        this._map.on("moveend", () => {

            // Nếu chuyển động là do nhấp chuột vào một cụm, hãy quay lại
            if (this._clusterClick) return;

           // Nếu chuyển động là do hoạt ảnh (autoZoom = true) và bản đồ không theo đúng vị trí
           // điểm đánh dấu (centerMap = false), liên kết bản đồ với điểm đánh dấu (centerMap = true) và đặt bất kỳ mức thu phóng nào thêm như
           // được tạo bởi người dùng (autoZoom = false).
           // Điều này là cần thiết vì nếu không hoạt ảnh bay được thực hiện khi nhấp vào nút GPS sẽ bị
           // bị gián đoạn bởi "onPositionSuccess".
            if (!this._centerMap && this._autoZoom) {
                this._centerMap = true;
                this._autoZoom  = false;
            }

        });

    }


    /** Khởi tạo điểm đánh dấu hiển thị vị trí của người dùng.*/
    initPositionMarker() {

        // Set the options for the icon
        const positionMarkerIcon = L.icon({
            iconUrl      : "img/user-marker.png",    //url của biểu tượng
            iconRetinaUrl: "img/user-marker-2x.png", // url của biểu tượng để sử dụng cho màn hình retina
            iconSize     : [37, 37],                 // kích thước của biểu tượng
            iconAnchor   : [19, 19]                  // tọa độ của "đầu" của biểu tượng
        });

        // Create the position marker and place it at the default position
        this.positionMarker = L.marker(MapActivity.defaultLatLng, {
            icon        : positionMarkerIcon,  // biểu tượng
            draggable   : true,               // điểm đánh dấu có thể được di chuyển xung quanh
            zIndexOffset: 1000                // điểm đánh dấu sẽ luôn ở trên bất kỳ điểm đánh dấu nào khác
        });


        // Khởi tạo vị trí hiện tại bằng vị trí mặc định
        this.currLatLng = MapActivity.defaultLatLng;

        // Khởi tạo độ chính xác hiện tại về 0
        this.currLatLngAccuracy = 0;

        // Khởi tạo độ cao hiện tại là -999
        this.currAltitude = -999;

        // Khởi tạo độ chính xác độ cao hiện tại thành 0
        this.currAltitudeAccuracy = 0;

        // Khởi tạo vòng tròn hiển thị trong bản đồ để chỉ ra độ chính xác của vị trí
        this._accuracyCircle = undefined;


       // Kích hoạt khi quá trình kéo bắt đầu
        this.positionMarker.on("dragstart", () => {

            // Đặt vị trí tiếp theo được tìm thấy là vị trí đầu tiên
            this._isFirstPositionFound = true;

            // Tháo bộ theo dõi vị trí
            this.detachPositionWatcher();

           // Nếu đã có một vòng tròn chính xác
            if (this._accuracyCircle !== undefined) {
            // Xóa vòng tròn chính xác khỏi bản đồ
                this._map.removeLayer(this._accuracyCircle);

                // Đặt vòng tròn chính xác thành "không xác định"
                this._accuracyCircle = undefined;

            }

        });

       // Kích hoạt khi quá trình kéo kết thúc
        this.positionMarker.on("dragend", e => {
            // Lưu vị trí của điểm đánh dấu
            this.currLatLng = [e.target.getLatLng().lat, e.target.getLatLng().lng];
            // Đặt độ chính xác về 0
            this.currLatLngAccuracy = 0;
            // Đặt độ cao thành -999
            this.currAltitude = -999;
            // Đặt độ chính xác độ cao thành 0
            this.currAltitudeAccuracy = 0;

            console.log(`Position marker dragged to ${this.currLatLng}`);

        });

// Thêm điểm đánh dấu vào bản đồ
        this.positionMarker.addTo(this._map);

    }


    /** Giải phóng bản đồ khỏi tự động căn giữa khi tìm thấy một vị trí mới. */
    freeMap() {

       // Đặt cờ thành false
        this._centerMap = false;

        // Loại bỏ màu xanh ở biểu tượng gps
        this._$gps.removeClass("gps-on");

    }


    /** Đăng ký một người theo dõi để lắng nghe các thay đổi trạng thái GPS. */
    registerGPSWatcher() {

        // Đăng ký người xem
        this._d.registerLocationStateChangeHandler(state => {

        // Vị trí bật
            if ((device.platform === "Android" && state !== this._d.locationMode.LOCATION_OFF) ||
                (device.platform === "iOS" && (state === this._d.permissionStatus.GRANTED || state === this._d.permissionStatus.GRANTED_WHEN_IN_USE))) {

                console.log("Đã bật GPS");

           // Thay đổi biểu tượng gps
                this._$gps.children("i").html("gps_fixed");

               // Đặt vị trí tiếp theo là vị trí đầu tiên được tìm thấy
                this._isFirstPositionFound = true;

               // Đặt cờ để tiếp tục di chuyển bản đồ với vị trí
                this._centerMap = true;

                // Đặt bất kỳ thu phóng tiếp theo nào thành tự động
                this._autoZoom = true;

                // Đính kèm trình theo dõi vị trí
                this.attachPositionWatcher();

            }
            // Vị trí tắt
            else {

                console.log("GPS đã tắt");

                // Thay đổi màu sắc và biểu tượng của nút gps
                this._$gps.removeClass("gps-on").children("i").html("gps_off");

                // Tháo bộ theo dõi vị trí
                this.detachPositionWatcher();

              // Cảnh báo người dùng
                utils.createAlert("", i18next.t("dialogs.map.gpsOff"), i18next.t("dialogs.btnOk"));

            }

        });

    }


    /** Kiểm tra quyền truy cập vị trí và cuối cùng yêu cầu chúng. */
    checkLocationPermissions() {

        // Lấy trạng thái ủy quyền
        this._d.getLocationAuthorizationStatus(status => {

                console.log(status);

                // Không yêu cầu quyền
                if (status === this._d.permissionStatus.NOT_REQUESTED ||
                    (device.platform === "Android" && status === this._d.permissionStatus.DENIED_ALWAYS)) {
                    console.log("Quyền không được yêu cầu");

                  // Yêu cầu quyền truy cập vị trí
                    this.requestLocationPermission();
                }

               // Quyền bị từ chối
                else if (status === this._d.permissionStatus.DENIED) {
                    console.log("Quyền bị từ chối");

                   // Thay đổi màu sắc và biểu tượng của nút gps
                    this._$gps.removeClass("gps-on").children("i").html("gps_off");
                }

                // Đã được cho phép
                else if (status === this._d.permissionStatus.GRANTED ||
                    (device.platform === "iOS" && status === this._d.permissionStatus.GRANTED_WHEN_IN_USE)) {
                    console.log("Đã được cho phép");

                   // Kiểm tra xem gps của điện thoại đã bật chưa rồi gắn thiết bị theo dõi vị trí
                    this.checkGPSOn(() => this.attachPositionWatcher());
                }
            }, err => {

                console.error(`Error checking the permissions: ${err}`);

                // Thay đổi màu sắc và biểu tượng của nút gps
                this._$gps.removeClass("gps-on").children("i").html("gps_off");

                // Cảnh báo người dùng
                utils.createAlert("", i18next.t("dialogs.map.permissionsCheckError"), i18next.t("dialogs.btnOk"));

            }
        );

    }

/** Yêu cầu quyền truy cập vị trí */
    requestLocationPermission() {

        this._d.requestLocationAuthorization(
            status => {

               // Đã được cho phép
                if (status === this._d.permissionStatus.GRANTED ||
                    (device.platform === "iOS" && status === this._d.permissionStatus.GRANTED_WHEN_IN_USE)) {

                    console.log("Đã được cho phép");

                    // Kiểm tra xem gps của điện thoại đã bật chưa rồi gắn thiết bị theo dõi vị trí
                    this.checkGPSOn(() => this.attachPositionWatcher());
                }
             // Quyền bị từ chối
                else {

                    console.log("Permission denied");

                    // Thay đổi màu sắc và biểu tượng của nút gps
                    this._$gps.removeClass("gps-on").children("i").html("gps_off");
                }
            },
            err => {

                console.error("Lỗi khi yêu cầu ủy quyền vị trí", err);

                // Thay đổi màu sắc và biểu tượng của nút gps
                this._$gps.removeClass("gps-on").children("i").html("gps_off");

              // Cảnh báo người dùng
                utils.createAlert("", i18next.t("dialogs.map.permissionsRequestError"), i18next.t("dialogs.btnOk"));

            },
          // Đối với iOS, chế độ ủy quyền được đặt thành LUÔN
            this._d.locationAuthorizationMode.ALWAYS
        );

    }


   /**
        * Kiểm tra xem GPS đã được bật chưa.
        *
        * Gọi lại @param {function} - Chức năng được thực thi nếu GPS được bật.
        */
    checkGPSOn(callback) {
// Kiểm tra xem vị trí đã được bật chưa
        this._d.isLocationEnabled(enabled => {

               // GPS đang bật
                if (enabled) {
                    console.log("GPS on");

                   // Thay đổi biểu tượng của nút gps
                    this._$gps.children("i").html("gps_fixed");

                   // Gọi hàm gọi lại
                    callback();
                }
            // GPS tắt
                else {
                    console.log("GPS off");

                  // Thay đổi biểu tượng và màu của nút gps
                    this._$gps.removeClass("gps-on").children("i").html("gps_off");

                  // Cảnh báo người dùng
                    utils.createAlert("", i18next.t("dialogs.map.gpsOff"), i18next.t("dialogs.btnOk"));
                }
            },
            err => {

                console.error("Không thể xác định xem vị trí có được bật hay không", err);

               // Thay đổi biểu tượng và màu của nút gps
                this._$gps.removeClass("gps-on").children("i").html("gps_off");

             // Cảnh báo người dùng
                utils.createAlert("", i18next.t("dialogs.map.gpsCheckError"), i18next.t("dialogs.btnOk"));
            }
        );

    }


    /** Phản hồi khi nhấp vào nút GPS. */
    handleGPSButton() {

        // Nếu trình theo dõi vị trí đã hoạt động, hãy quay lại
        if (this._$gps.hasClass("gps-on")) {
            console.log("Người theo dõi đã bật");
            return;
        }

       // Kiểm tra quyền truy cập vị trí
        this._d.getLocationAuthorizationStatus(
            status => {

                // Quyền bị từ chối nhưng có thể yêu cầu lại
                if (device.platform === "Android" && status === this._d.permissionStatus.DENIED) {

                    console.log("Quyền bị từ chối nhưng có thể được yêu cầu");

                // Yêu cầu quyền
                    this.requestLocationPermission();
                }
               // Quyền bị từ chối và không thể yêu cầu lại
                else if ((device.platform === "Android" && status === this._d.permissionStatus.DENIED_ALWAYS) ||
                    (device.platform === "iOS" && status === this._d.permissionStatus.DENIED)) {

                    console.log("Không thể yêu cầu lại quyền.");

                  // Thay đổi biểu tượng và màu của nút gps
                    this._$gps.removeClass("gps-on").children("i").html("gps_off");

                  // Cảnh báo người dùng
                    utils.createAlert("", i18next.t("dialogs.map.cannotRequestPermissions"), i18next.t("dialogs.btnOk"));

                }
                // Quyền được cấp
                else {

                    console.log("Đã được cho phép");

                  // Kiểm tra xem GPS đã bật chưa
                    this.checkGPSOn(() => {

                      // Lần thu phóng tiếp theo sẽ tự động
                        this._autoZoom = true;
                        // Nếu là lần đầu tiên một vị trí được tìm thấy
                        if (this._isFirstPositionFound) {

                         // Tạo bản đồ theo vị trí
                            this._centerMap = true;
                            // Đính kèm trình theo dõi vị trí
                            this.attachPositionWatcher();

                            return;
                        }

                     // Nếu mức thu phóng nhỏ hơn 15, di chuyển chế độ xem và thu phóng
                        if (this._map.getZoom() < 15) this._map.flyTo(this.currLatLng, MapActivity.watcherZoom);

                      // Nếu mức thu phóng cao hơn 15, chỉ di chuyển chế độ xem
                        else this._map.flyTo(this.currLatLng);

                      // Đính kèm trình theo dõi vị trí
                        this.attachPositionWatcher();

                    });

                }

            },
            err => {

                console.error(`Lỗi khi kiểm tra quyền ${err}`);

                    // Thay đổi biểu tượng và màu của nút gps
                this._$gps.removeClass("gps-on").children("i").html("gps_off");

             // Cảnh báo người dùng
                utils.createAlert("", i18next.t("dialogs.map.permissionsCheckError"), i18next.t("dialogs.btnOk"));

            }
        );

    }


    /** Đính kèm trình theo dõi vị trí. */
    attachPositionWatcher() {

        // Thay đổi màu nút gps
        this._$gps.addClass("gps-on");

       // Nếu trình theo dõi vị trí đã được đính kèm, hãy quay lại
        if (this.isPositionWatcherAttached) return;

   // Hiển thị thông báo cho người dùng biết vị trí đang được tìm thấy
        $("#finding-position-msg").show();

      // Khởi tạo trình theo dõi vị trí
        this._positionWatcherId = navigator.geolocation.watchPosition(
            this.onPositionSuccess.bind(this),
            err => console.error(`Lỗi tìm vị trí ${err}`),
            {
                enableHighAccuracy: true, // Cho phép độ chính xác cao
                timeout           : 3000, // Thời gian tối đa có thể trôi qua cho đến khi gọi lại thành công
                maximumAge        : 0     //Không chấp nhận các vị trí đã lưu trong bộ nhớ cache
            }
        );

    // Đặt cờ thành true
        this.isPositionWatcherAttached = true;

        console.log("Trình theo dõi vị trí được đính kèm");

    }

    /** Tháo bộ theo dõi vị trí. */
    detachPositionWatcher() {

     // Nếu không có người theo dõi vị trí nào
        if (!this.isPositionWatcherAttached) return;

      // Đổi màu icon gps
        this._$gps.removeClass("gps-on");

       // Xóa trình theo dõi vị trí hiện tại
        navigator.geolocation.clearWatch(this._positionWatcherId);
        // Đặt cờ thành false
        this.isPositionWatcherAttached = false;

        console.log("Trình theo dõi vị trí được đính kèm");

    }

    /**
     * Callback to be fired when a new position is found.
     *
     * @param {number[]} pos - Fhe position found.
     */
    onPositionSuccess(pos) {

        // Lưu vị trí và độ chính xác
        this.currLatLng         = [pos.coords.latitude, pos.coords.longitude];
        this.currLatLngAccuracy = pos.coords.accuracy;

      // Đặt độ cao và độ chính xác của nó. Nếu các giá trị là null, thay vào đó hãy đặt chúng thành -999 và 0
        this.currAltitude         = pos.coords.altitude || -999;
        this.currAltitudeAccuracy = pos.coords.altitude || 0;

        console.log("Đã tìm thấy vị trí");

        // Ẩn tin nhắn
        $("#finding-position-msg").hide();

        // Nếu là vị trí đầu tiên được tìm thấy
        if (this._isFirstPositionFound) {

           // Căn giữa bản đồ vào vị trí
            this._map.setView(this.currLatLng, MapActivity.watcherZoom);

          // Đặt cờ thành false
            this._isFirstPositionFound = false;

           // Mọi lần thu phóng tiếp theo đều không tự động
            this._autoZoom = false;

        }
  // Nếu không phải là vị trí đầu tiên được tìm thấy và bản đồ phải theo vị trí
        else if (this._centerMap) {
// Xoay bản đồ đến vị trí tìm thấy
            this._map.panTo(this.currLatLng);

        }
// Đặt vị trí của điểm đánh dấu
        this.positionMarker.setLatLng(this.currLatLng);

        // Nếu có vòng tròn chính xác trên bản đồ, hãy xóa nó
        if (this._accuracyCircle !== undefined) this._map.removeLayer(this._accuracyCircle);

       // Tạo một vòng tròn chính xác mới
        this._accuracyCircle = L.circle(this.currLatLng, {
            radius : this.currLatLngAccuracy / 2,
            color  : "green",
            opacity: .5
        }).addTo(this._map);

    }

}
