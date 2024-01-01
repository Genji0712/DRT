"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var app;
$(function () {
  return document.addEventListener("deviceready", function () {
    return app = new App();
  }, false);
});
var App = function () {
  function App() {
    var _this = this;
    _classCallCheck(this, App);
    if (!localStorage.getItem("mode")) localStorage.setItem("mode", "false");
    this._toReattachPositionWatcher = false;
    this._backPressedCount = 0;
    this.isGuest = false;
    this.activityStack = [];
    document.addEventListener("pause", this.onPause, false);
    document.addEventListener("resume", this.onResume, false);
    document.addEventListener("backbutton", function () {
      return _this.onBackPressed();
    }, false);
    this.initLocalDb().then(function () {
      _this.initInternationalization();
    })["catch"](function () {
      _this.db = null;
      utils.createAlert("", i18next.t("dialogs.openLocalDbError"), i18next.t("dialogs.btnOk"));
      _this.initInternationalization();
    });
  }
  _createClass(App, [{
    key: "onBackPressed",
    value: function onBackPressed() {
      if (utils.isLoaderOpen || utils.isAlertOpen) return;
      if (utils.isImgScreenOpen) {
        utils.closeImgScreen();
        return;
      }
      app.activityStack[app.activityStack.length - 1].onBackPressed();
    }
  }, {
    key: "open",
    value: function open() {
      if (!LoginActivity.getInstance().getAuthStatus()) LoginActivity.getInstance().open();else MapActivity.getInstance().open();
      $("#splash").hide();
    }
  }, {
    key: "initInternationalization",
    value: function initInternationalization() {
      var _this2 = this;
      console.log("Setting language to: ", App.appLanguage);
      i18next.use(i18nextXHRBackend).init({
        lng: App.appLanguage,
        fallbackLng: "en",
        ns: "general",
        defaultNS: "general",
        backend: {
          loadPath: "./locales/{{lng}}/{{ns}}.json"
        }
      }).then(function () {
        i18next.on("languageChanged", function () {
          return console.log("lng changed to ".concat(i18next.language));
        });
        jqueryI18next.init(i18next, $);
        $("body").localize();
        _this2.open();
      });
    }
  }, {
    key: "initLocalDb",
    value: function initLocalDb() {
      var _this3 = this;
      this.db = null;
      return new Promise(function (resolve, reject) {
        var dbOpenRequest = window.indexedDB.open(App.localDbName, App.localDbVersion);
        dbOpenRequest.onerror = function (err) {
          console.error("Error opening the db", err);
          reject();
        };
        dbOpenRequest.onsuccess = function () {
          console.log("Db opened");
          _this3.db = dbOpenRequest.result;
          resolve();
        };
        dbOpenRequest.onupgradeneeded = function () {
          console.log("Upgrading or creating db...");
          _this3.db = dbOpenRequest.result;
          _this3.db.onerror = function (err) {
            console.error("Error upgrading or creating the db", err);
            reject();
          };
          var objectStore = _this3.db.createObjectStore("landslides", {
            keyPath: "_id"
          });
          objectStore.transaction.onerror = function (err) {
            console.error("Error creating the object store", err);
            reject();
          };
          objectStore.transaction.oncomplete = function () {
            console.log("Object store created");
            resolve();
          };
        };
      });
    }
  }, {
    key: "onPause",
    value: function onPause() {
      console.log("onPause");
      if (MapActivity.hasInstance()) {
        if (MapActivity.getInstance().isPositionWatcherAttached) {
          app._toReattachPositionWatcher = true;
          MapActivity.getInstance().detachPositionWatcher();
        }
      }
    }
  }, {
    key: "onResume",
    value: function onResume() {
      console.log("onResume");
      if (app._toReattachPositionWatcher) {
        MapActivity.getInstance().checkGPSOn(function () {
          return MapActivity.getInstance().attachPositionWatcher();
        });
        app._toReattachPositionWatcher = false;
      }
    }
  }], [{
    key: "appLanguage",
    get: function get() {
      var localStorageLng = localStorage.getItem("lng");
      console.log("Local stored language: ", localStorageLng);
      if (localStorageLng) return localStorageLng;
      var phoneLang = navigator.language;
      console.log("Phone language: ", phoneLang);
      if (phoneLang === "it" || phoneLang === "it-IT") return "it";else return "en";
      if (phoneLang === "vi" || phoneLang === "vi-VN") return "vi";else return "en";
    }
  }, {
    key: "isExpertMode",
    get: function get() {
      return localStorage.getItem("mode") === "true";
    }
  }, {
    key: "localDbName",
    get: function get() {
      return "DRT";
    }
  }, {
    key: "localDbVersion",
    get: function get() {
      return 1;
    }
  }]);
  return App;
}();
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var InfoActivity = function () {
  function InfoActivity() {
    var _this = this;
    _classCallCheck(this, InfoActivity);
    this._screen = $("#page--info");
    this._placeholders = $("#page--info .placeholder");
    $("#info-close").click(function () {
      return _this.close();
    });
    $("#info-photo-thm").click(function () {
      utils.openImgScreen($(this).attr("src"));
    });
  }
  _createClass(InfoActivity, [{
    key: "open",
    value: function open(id, isLocal) {
      utils.pushStackActivity(this);
      if (!isLocal && !navigator.onLine) {
        this.close();
        utils.createAlert("", i18next.t("dialogs.infoRemoteOffline"), i18next.t("dialogs.btnOk"));
        return;
      }
      if (isLocal) utils.createAlert("", i18next.t("dialogs.openLocalInfo"), i18next.t("dialogs.btnOk"));
      this._placeholders.addClass("ph-animate");
      this._screen.show();
      this.getLandslide(id, isLocal);
    }
  }, {
    key: "close",
    value: function close() {
      utils.popStackActivity();
      this._screen.scrollTop(0).hide();
      $("#page--info .ph-hidden-content").hide();
      this._placeholders.removeClass("ph-animate").show();
      $("#info-delete").hide();
      $("#info-edit").hide();
      $(".info-block").show();
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
      $("#info-photo-preview").attr("src", "img/no-img-placeholder-200.png");
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      this.close();
    }
  }, {
    key: "getLandslide",
    value: function getLandslide(id, isLocal) {
      var _this2 = this;
      landslide.get(id, isLocal).then(function (data) {
        $("#info-delete").show().unbind("click").click(function () {
          utils.createAlert("", i18next.t("dialogs.deleteConfirmation"), i18next.t("dialogs.btnCancel"), null, i18next.t("dialogs.btnOk"), function () {
            utils.openLoader();
            landslide["delete"](id, isLocal, data.imageUrl).then(function () {
              utils.closeLoader();
              _this2.close();
            })["catch"](function () {
              utils.closeLoader();
            });
          });
        });
        $("#info-edit").show().unbind("click").click(function () {
          InsertActivity.getInstance().openPut(data, isLocal);
          _this2._screen.scrollTop(0);
        });
        _this2.show(data, isLocal);
      })["catch"](function () {
        _this2.close();
      });
    }
  }, {
    key: "show",
    value: function show(data, isLocal) {
      $(".info-block").show();
      if (!data.expert || isLocal && data.expert !== "true") {
        $("#info-hillPosition").hide();
        $("#info-vegetation").hide();
        $("#info-mitigationList").hide();
        $("#info-monitoring").hide();
        $("#info-monitoringList").hide();
        $("#info-damages").hide();
        $("#info-damagesList").hide();
        $("#info-notes").hide();
      } else {
        if (data.mitigation !== "yes") $("#info-mitigationList").hide();
        if (data.monitoring !== "yes") $("#info-monitoringList").hide();
        if (data.damages !== "directDamage") $("#info-damagesList").hide();
      }
      var _loop = function _loop(key) {
        if (data.hasOwnProperty(key)) {
          $("#info-" + key + " .info-content").html(function () {
            var val = data[key];
            if (val === "") return "-";
            switch (key) {
              case "_id":
                return val;
              case "createdAt":
              case "updatedAt":
                return new Date(val).toLocaleDateString(i18next.language, InfoActivity.dateOpts);
              case "coordinates":
                if (data.preciseCoordinates && data.preciseCoordinates[0] !== undefined && data.preciseCoordinates[1] !== undefined) return data.preciseCoordinates[0] + ", " + data.preciseCoordinates[1];else return val[0] + ", " + val[1];
              case "coordinatesAccuracy":
              case "altitudeAccuracy":
                if (val === 0 || val === null) return i18next.t("info.unknown");
                return val + " " + i18next.t("info.accuracyUnit");
              case "altitude":
                if (val === -999) return i18next.t("info.unknown");
                return val + " " + i18next.t("info.altitudeUnit");
              case "mitigationList":
                if (val.length === 0) return "-";
                var mitigationContent = "<ul class='info-list'>";
                for (var i = 0; i < val.length; i++) {
                  mitigationContent += "<li>".concat(i18next.t("insert.mitigation.enum." + val[i].type), "</li>");
                }
                mitigationContent = mitigationContent + "</ul>";
                return mitigationContent;
              case "monitoringList":
                if (val.length === 0) return "-";
                var monitoringContent = "<ul class='info-list'>";
                for (var _i = 0; _i < val.length; _i++) {
                  monitoringContent += "<li>\n                                        ".concat(i18next.t("insert.monitoring.enum." + val[_i].type), " (").concat(i18next.t("insert.monitoring.enum." + val[_i].status), ")\n                                    </li>");
                }
                monitoringContent = monitoringContent + "</ul>";
                return monitoringContent;
              case "damagesList":
                if (val.length === 0) return "-";
                var damagesContent = "<ul class='info-list'>";
                for (var _i2 = 0; _i2 < val.length; _i2++) {
                  damagesContent = damagesContent + "<li>";
                  if (val[_i2].type === "other") damagesContent = damagesContent + val[_i2].specification;else damagesContent = damagesContent + i18next.t("insert.damages.enum." + val[_i2].type);
                  damagesContent = damagesContent + "</li>";
                }
                damagesContent = damagesContent + "</ul>";
                return damagesContent;
              case "notes":
                return val;
              default:
                return i18next.t("insert." + key + ".enum." + val);
            }
          });
        }
      };
      for (var key in data) {
        _loop(key);
      }
      var photoSrc;
      if (isLocal) photoSrc = data.imageUrl;else photoSrc = "".concat(settings.serverUrl, "/").concat(data.imageUrl);
      $("#info-photo-thm").attr("src", photoSrc);
      this._placeholders.hide().removeClass("ph-animate");
      $("#page--info .ph-hidden-content").show();
    }
  }], [{
    key: "dateOpts",
    get: function get() {
      return {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      };
    }
  }, {
    key: "getInstance",
    value: function getInstance() {
      if (!InfoActivity._instance) InfoActivity._instance = new InfoActivity();
      return InfoActivity._instance;
    }
  }]);
  return InfoActivity;
}();
_defineProperty(InfoActivity, "_instance", void 0);
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var InsertActivity = function () {
  function InsertActivity() {
    _classCallCheck(this, InsertActivity);
    this._screen = $("#page--insert");
    this._$photoThm = $("#photo-thm");
    this._currOpenedDialog = null;
    this._currOpenedFullDialog = null;
    this._lsId = null;
    this._isExpert = null;
    this._isLocal = null;
    this._oldPhoto = null;
    this._vals = {
      coordinates: "",
      coordinatesAccuracy: "",
      altitude: "",
      altitudeAccuracy: "",
      presence: "",
      type: "",
      materialType: "",
      hillPosition: "",
      water: "",
      vegetation: "",
      mitigation: "",
      mitigationList: [],
      monitoring: "",
      monitoringList: [],
      damages: "",
      damagesList: [],
      notes: "",
      photo: ""
    };
    this._newMitigationList = [];
    this._newMonitoringList = [];
    this._newDamagesList = [];
    this.initUI();
  }
  _createClass(InsertActivity, [{
    key: "open",
    value: function open() {
      utils.pushStackActivity(this);
      if (this._lsId && this._isExpert || !this._lsId && App.isExpertMode) {
        $("#hill-position-request-wrapper").show();
        $("#vegetation-request-wrapper").show();
        $("#monitoring-request-wrapper").show();
        $("#damages-request-wrapper").show();
        $("#notes-request-wrapper").show();
      }
      this._screen.show();
      if (!this._lsId) {
        utils.createAlert("", i18next.t("dialogs.insert.positionAlert"), i18next.t("dialogs.btnOk"));
        this._vals.coordinates = MapActivity.getInstance().currLatLng;
        this._vals.coordinatesAccuracy = MapActivity.getInstance().currLatLngAccuracy;
        this._vals.altitude = MapActivity.getInstance().currAltitude;
        this._vals.altitudeAccuracy = MapActivity.getInstance().currAltitudeAccuracy;
      }
    }
  }, {
    key: "openPut",
    value: function openPut(ls, isLocal) {
      this._lsId = ls._id;
      this._isExpert = isLocal && ls.expert === "true" || !isLocal && ls.expert;
      this._isLocal = isLocal;
      this._vals.type = ls.type;
      this._vals.materialType = ls.materialType;
      this._vals.hillPosition = ls.hillPosition;
      this._vals.water = ls.water;
      this._vals.vegetation = ls.vegetation;
      this._vals.mitigation = ls.mitigation;
      this._vals.mitigationList = ls.mitigationList;
      this._vals.monitoring = ls.monitoring;
      this._vals.monitoringList = ls.monitoringList;
      this._vals.damages = ls.damages;
      this._vals.damagesList = ls.damagesList;
      this._vals.notes = ls.notes;
      if (isLocal) this._vals.photo = ls.imageUrl;else this._vals.photo = "".concat(settings.serverUrl, "/").concat(ls.imageUrl);
      this._oldPhoto = this._vals.photo;
      $("#ls-type-text").html(i18next.t("insert.type.enum." + this._vals.type));
      if (this._vals.materialType !== "") $("#material-type-text").html(i18next.t("insert.materialType.enum." + this._vals.materialType));
      if (this._vals.hillPosition !== "") $("#hill-position-text").html(i18next.t("insert.hillPosition.enum." + this._vals.hillPosition));
      if (this._vals.water !== "") $("#water-text").html(i18next.t("insert.water.enum." + this._vals.water));
      if (this._vals.vegetation !== "") $("#vegetation-text").html(i18next.t("insert.vegetation.enum." + this._vals.vegetation));
      if (this._vals.mitigation !== "") $("#mitigation-text").html(i18next.t("insert.mitigation.enum." + this._vals.mitigation));
      if (this._vals.monitoring !== "") $("#monitoring-text").html(i18next.t("insert.monitoring.enum." + this._vals.monitoring));
      if (this._vals.damages !== "") $("#damages-text").html(i18next.t("insert.damages.enum." + this._vals.damages));
      if (this._vals.notes !== "") $("#notes-text").html(i18next.t("insert.notes.editText"));
      this._$photoThm.find("img").attr("src", this._vals.photo).show();
      this._$photoThm.find("i").hide();
      this.open();
    }
  }, {
    key: "close",
    value: function close() {
      var _this = this;
      utils.popStackActivity();
      this._lsId = null;
      this._isExpert = null;
      this._oldPhoto = null;
      this._isLocal = null;
      this._screen.scrollTop(0).hide();
      this._currOpenedDialog = null;
      this._currOpenedFullDialog = null;
      Object.keys(this._vals).forEach(function (v) {
        return _this._vals[v] = "";
      });
      this._vals.mitigationList = [];
      this._vals.monitoringList = [];
      this._vals.damagesList = [];
      $("#hill-position-request-wrapper").hide();
      $("#vegetation-request-wrapper").hide();
      $("#monitoring-request-wrapper").hide();
      $("#damages-request-wrapper").hide();
      $("#notes-request-wrapper").hide();
      $("#ls-type-text").html(i18next.t("insert.type.defaultText"));
      $("#material-type-text").html(i18next.t("insert.materialType.defaultText"));
      $("#hill-position-text").html(i18next.t("insert.hillPosition.defaultText"));
      $("#water-text").html(i18next.t("insert.water.defaultText"));
      $("#vegetation-text").html(i18next.t("insert.vegetation.defaultText"));
      $("#mitigation-text").html(i18next.t("insert.mitigation.defaultText"));
      $("#monitoring-text").html(i18next.t("insert.monitoring.defaultText"));
      $("#damages-text").html(i18next.t("insert.damages.defaultText"));
      $("#notes-text").html(i18next.t("insert.notes.defaultText"));
      this._$photoThm.find("img").attr("src", "img/img-placeholder-200.png").hide();
      this._$photoThm.find("i").show();
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      var _this2 = this;
      if (this._currOpenedDialog) {
        this.closeDialog(this._currOpenedDialog);
        return;
      }
      if (this._currOpenedFullDialog) {
        this.closeFullscreenDialog(this._currOpenedFullDialog);
        return;
      }
      utils.createAlert("", i18next.t("dialogs.insert.confirmClose"), i18next.t("dialogs.insert.btnKeepEditing"), null, i18next.t("dialogs.insert.btnDiscard"), function () {
        _this2.close();
      });
    }
  }, {
    key: "initUI",
    value: function initUI() {
      var _this3 = this;
      $("#new-ls-close").click(function () {
        utils.createAlert("", i18next.t("dialogs.insert.confirmClose"), i18next.t("dialogs.insert.btnKeepEditing"), null, i18next.t("dialogs.insert.btnDiscard"), function () {
          _this3.close();
        });
      });
      $("#new-ls-done").click(function () {
        if (_this3._vals.type === "") {
          utils.logOrToast(i18next.t("messages.mandatoryLsType"), "long");
          return;
        }
        if (_this3._vals.photo === "") {
          utils.logOrToast(i18next.t("messages.mandatoryPhoto"), "long");
          return;
        }
        if (App.isExpertMode) {
          if (_this3._vals.mitigation !== "yes") _this3._vals.mitigationList = [];
          if (_this3._vals.monitoring !== "yes") _this3._vals.monitoringList = [];
          if (_this3._vals.damages !== "directDamage") _this3._vals.damagesList = [];
        }
        if (!_this3._lsId) {
          if (app.isGuest) {
            utils.createAlert("", i18next.t("dialogs.postGuest"), i18next.t("dialogs.btnNo"), null, i18next.t("dialogs.btnYes"), function () {
              return _this3.postLocal();
            });
            return;
          }
          if (!navigator.onLine) {
            utils.createAlert("", i18next.t("dialogs.postOffline"), i18next.t("dialogs.btnNo"), null, i18next.t("dialogs.btnYes"), function () {
              return _this3.postLocal();
            });
            return;
          }
          _this3.postRemote();
        } else {
          if (!_this3._isLocal) _this3.putRemote();else _this3.putLocal();
        }
      });
      $("#ls-type-request").click(function () {
        var toSelect = _this3._vals.type;
        if (_this3._vals.type === "") toSelect = "rockfall";
        $("input[name='type'][value='" + toSelect + "']").prop("checked", "true");
        _this3.openFullscreenDialog($("#dialog-ls-type"));
      });
      $("#ls-type-close").click(function () {
        return _this3.closeFullscreenDialog($("#dialog-ls-type"));
      });
      $("#ls-type-done").click(function () {
        _this3._vals.type = $("input[name='type']:checked").val();
        $("#ls-type-text").html(i18next.t("insert.type.enum." + _this3._vals.type));
        _this3.closeFullscreenDialog($("#dialog-ls-type"));
      });
      $("#material-type-request").click(function () {
        var toSelect = _this3._vals.materialType;
        if (_this3._vals.materialType === "") toSelect = "rock";
        $("input[name='materialType'][value='" + toSelect + "']").prop("checked", "true");
        _this3.openDialog($("#dialog-material-type"));
      });
      $("#material-type-cancel").click(function () {
        return _this3.closeDialog($("#dialog-material-type"));
      });
      $("#material-type-ok").click(function () {
        _this3._vals.materialType = $("input[name='materialType']:checked").val();
        $("#material-type-text").html(i18next.t("insert.materialType.enum." + _this3._vals.materialType));
        _this3.closeDialog($("#dialog-material-type"));
      });
      $("#hill-position-request").click(function () {
        var toSelect = _this3._vals.hillPosition;
        if (_this3._vals.hillPosition === "") toSelect = "atTheTop";
        $("input[name='hillPosition'][value='" + toSelect + "']").prop("checked", "true");
        _this3.openDialog($("#dialog-hill-position"));
      });
      $("#hill-position-cancel").click(function () {
        return _this3.closeDialog($("#dialog-hill-position"));
      });
      $("#hill-position-ok").click(function () {
        _this3._vals.hillPosition = $("input[name='hillPosition']:checked").val();
        $("#hill-position-text").html(i18next.t("insert.hillPosition.enum." + _this3._vals.hillPosition));
        _this3.closeDialog($("#dialog-hill-position"));
      });
      $("#water-request").click(function () {
        var toSelect = _this3._vals.water;
        if (_this3._vals.water === "") toSelect = "dry";
        $("input[name='water'][value='" + toSelect + "']").prop("checked", "true");
        _this3.openDialog($("#dialog-water"));
      });
      $("#water-cancel").click(function () {
        return _this3.closeDialog($("#dialog-water"));
      });
      $("#water-ok").click(function () {
        _this3._vals.water = $("input[name='water']:checked").val();
        $("#water-text").html(i18next.t("insert.water.enum." + _this3._vals.water));
        _this3.closeDialog($("#dialog-water"));
      });
      $("#vegetation-request").click(function () {
        var toSelect = _this3._vals.vegetation;
        if (_this3._vals.vegetation === "") toSelect = "grass";
        $("input[name='vegetation'][value='" + toSelect + "']").prop("checked", "true");
        _this3.openDialog($("#dialog-vegetation"));
      });
      $("#vegetation-cancel").click(function () {
        return _this3.closeDialog($("#dialog-vegetation"));
      });
      $("#vegetation-ok").click(function () {
        _this3._vals.vegetation = $("input[name='vegetation']:checked").val();
        $("#vegetation-text").html(i18next.t("insert.vegetation.enum." + _this3._vals.vegetation));
        _this3.closeDialog($("#dialog-vegetation"));
      });
      $("#mitigation-request").click(function () {
        var toSelect = _this3._vals.mitigation;
        if (_this3._vals.mitigation === "") toSelect = "yes";
        if (_this3._lsId && _this3._isExpert || !_this3._lsId && App.isExpertMode) {
          $("input[name='mitigationExpert'][value='" + toSelect + "']").prop("checked", "true");
          if (toSelect === "yes") $("#mitigations-wrapper").show();else $("#mitigations-wrapper").hide();
          _this3._newMitigationList = [];
          _this3.clearDomList("mitigation-list");
          _this3._vals.mitigationList.forEach(function (item) {
            return _this3.createMitigationItem(item.type);
          });
          _this3.openFullscreenDialog($("#dialog-mitigation-expert"));
        } else {
          $("input[name='mitigationBase'][value='" + toSelect + "']").prop("checked", "true");
          _this3.openDialog($("#dialog-mitigation-base"));
        }
      });
      $("#mitigation-base-cancel").click(function () {
        return _this3.closeDialog($("#dialog-mitigation-base"));
      });
      $("#mitigation-base-ok").click(function () {
        _this3._vals.mitigation = $("input[name='mitigationBase']:checked").val();
        $("#mitigation-text").html(i18next.t("insert.mitigation.enum." + _this3._vals.mitigation));
        _this3.closeDialog($("#dialog-mitigation-base"));
      });
      $("#mitigation-expert-close").click(function () {
        return _this3.closeFullscreenDialog($("#dialog-mitigation-expert"));
      });
      $("#mitigation-expert-done").click(function () {
        _this3._vals.mitigation = $("input[name='mitigationExpert']:checked").val();
        _this3._vals.mitigationList = _this3._newMitigationList.filter(function (e) {
          return e !== "";
        });
        $("#mitigation-text").html(i18next.t("insert.mitigation.editText"));
        _this3.closeFullscreenDialog($("#dialog-mitigation-expert"));
      });
      $("input[name='mitigationExpert']").change(function () {
        var checked = $("input[name='mitigationExpert']:checked").val();
        if (checked === "yes") $("#mitigations-wrapper").show();else $("#mitigations-wrapper").hide();
      });
      $("#mitigation-add").click(function () {
        return _this3.openDialog($("#dialog-mitigation-expert-new"));
      });
      $("#mitigation-type-select").change(function () {
        return utils.changeSelectorLabel("mitigation-type-select");
      });
      $("#mitigation-expert-new-cancel").click(function () {
        _this3.closeDialog($("#dialog-mitigation-expert-new"));
        utils.resetSelector("mitigation-type-select");
      });
      $("#mitigation-expert-new-ok").click(function () {
        var type = $("#mitigation-type-select").val();
        if (type === "none") {
          utils.logOrToast(i18next.t("messages.mandatoryOption"), "long");
          return;
        }
        _this3.createMitigationItem(type);
        _this3.closeDialog($("#dialog-mitigation-expert-new"));
        utils.resetSelector("mitigation-type-select");
      });
      $("#monitoring-request").click(function () {
        var toSelect = _this3._vals.monitoring;
        if (_this3._vals.monitoring === "") toSelect = "yes";
        $("input[name='monitoring'][value='" + toSelect + "']").prop("checked", "true");
        if (toSelect === "yes") $("#monitoring-wrapper").show();else $("#monitoring-wrapper").hide();
        _this3._newMonitoringList = [];
        _this3.clearDomList("monitoring-list");
        _this3._vals.monitoringList.forEach(function (item) {
          return _this3.createMonitoringItem(item.type, item.status);
        });
        _this3.openFullscreenDialog($("#dialog-monitoring"));
      });
      $("#monitoring-close").click(function () {
        return _this3.closeFullscreenDialog($("#dialog-monitoring"));
      });
      $("#monitoring-done").click(function () {
        _this3._vals.monitoring = $("input[name='monitoring']:checked").val();
        _this3._vals.monitoringList = _this3._newMonitoringList.filter(function (e) {
          return e !== "";
        });
        $("#monitoring-text").html(i18next.t("insert.monitoring.editText"));
        _this3.closeFullscreenDialog($("#dialog-monitoring"));
      });
      $("input[name='monitoring']").change(function () {
        var checked = $("input[name='monitoring']:checked").val();
        if (checked === "yes") $("#monitoring-wrapper").show();else $("#monitoring-wrapper").hide();
      });
      $("#monitoring-add").click(function () {
        return _this3.openDialog($("#dialog-monitoring-new"));
      });
      $("#monitoring-type-select").change(function () {
        return utils.changeSelectorLabel("monitoring-type-select");
      });
      $("#monitoring-status-select").change(function () {
        return utils.changeSelectorLabel("monitoring-status-select");
      });
      $("#monitoring-new-cancel").click(function () {
        _this3.closeDialog($("#dialog-monitoring-new"));
        utils.resetSelector("monitoring-type-select");
        utils.resetSelector("monitoring-status-select");
      });
      $("#monitoring-new-ok").click(function () {
        var type = $("#monitoring-type-select").val(),
          status = $("#monitoring-status-select").val();
        if (type === "none" || status === "none") {
          utils.logOrToast(i18next.t("messages.mandatoryMonitoringFields"), "long");
          return;
        }
        _this3.createMonitoringItem(type, status);
        _this3.closeDialog($("#dialog-monitoring-new"));
        utils.resetSelector("monitoring-type-select");
        utils.resetSelector("monitoring-status-select");
      });
      $("#damages-request").click(function () {
        var toSelect = _this3._vals.damages;
        if (_this3._vals.damages === "") toSelect = "noDamage";
        $("input[name='damages'][value='" + toSelect + "']").prop("checked", "true");
        if (toSelect === "directDamage") $("#damages-wrapper").show();else $("#damages-wrapper").hide();
        _this3._newDamagesList = [];
        _this3.clearDomList("damages-list");
        _this3._vals.damagesList.forEach(function (item) {
          return _this3.createDamagesItem(item.type, item.specification);
        });
        _this3.openFullscreenDialog($("#dialog-damages"));
      });
      $("#damages-close").click(function () {
        return _this3.closeFullscreenDialog($("#dialog-damages"));
      });
      $("#damages-done").click(function () {
        _this3._vals.damages = $("input[name='damages']:checked").val();
        _this3._vals.damagesList = _this3._newDamagesList.filter(function (e) {
          return e !== "";
        });
        $("#damages-text").html(i18next.t("insert.damages.editText"));
        _this3.closeFullscreenDialog($("#dialog-damages"));
      });
      $("input[name='damages']").change(function () {
        var checked = $("input[name='damages']:checked").val();
        if (checked === "directDamage") $("#damages-wrapper").show();else $("#damages-wrapper").hide();
      });
      $("#damages-add").click(function () {
        return _this3.openDialog($("#dialog-damages-new"));
      });
      $("#damages-type-select").change(function () {
        utils.changeSelectorLabel("damages-type-select");
        if ($("#damages-type-select").val() === "other") $("#damage-other-input-wrapper").show();else $("#damage-other-input-wrapper").hide();
      });
      $("#damages-new-cancel").click(function () {
        _this3.closeDialog($("#dialog-damages-new"));
        utils.resetSelector("damages-type-select");
        $("#damage-other-input").val("");
        $("#damage-other-input-wrapper").hide();
      });
      $("#damages-new-ok").click(function () {
        var type = $("#damages-type-select").val(),
          $otherInput = $("#damage-other-input");
        if (type === "none") {
          utils.logOrToast(i18next.t("messages.mandatoryOption"), "long");
          return;
        }
        if (type === "other" && $otherInput.val() === "") {
          utils.logOrToast(i18next.t("messages.mandatoryDamageOther"), "long");
          return;
        }
        var specification = "";
        if (type === "other") specification = $otherInput.val().toString();
        _this3.createDamagesItem(type, specification);
        _this3.closeDialog($("#dialog-damages-new"));
        utils.resetSelector("damages-type-select");
        $otherInput.val("");
        $("#damage-other-input-wrapper").hide();
      });
      $("#notes-request").click(function () {
        $("#notes").val(_this3._vals.notes);
        _this3.openFullscreenDialog($("#dialog-notes"));
      });
      $("#notes-close").click(function () {
        return _this3.closeFullscreenDialog($("#dialog-notes"));
      });
      $("#notes-done").click(function () {
        _this3._vals.notes = $("#notes").val();
        $("#notes-text").html(i18next.t("insert.notes.editText"));
        _this3.closeFullscreenDialog($("#dialog-notes"));
      });
      this._$photoThm.click(function () {
        if (_this3._vals.photo === "") _this3.getPicture();else utils.openImgScreen(_this3._$photoThm.find("img").attr("src"), true, function () {
          return _this3.getPicture();
        }, function () {
          _this3._vals.photo = "";
          _this3._$photoThm.find("img").attr("src", "img/img-placeholder-200.png").hide();
          _this3._$photoThm.find("i").show();
        });
      });
    }
  }, {
    key: "getPicture",
    value: function getPicture() {
      var _this4 = this;
      var opt = {
        quality: 30,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true
      };
      navigator.camera.getPicture(function (fileURI) {
        _this4._vals.photo = fileURI;
        _this4._$photoThm.find("img").attr("src", _this4._vals.photo).show();
        _this4._$photoThm.find("i").hide();
      }, function (err) {
        console.log("Error taking picture ".concat(err));
        utils.createAlert("", i18next.t("dialogs.insert.pictureError"), i18next.t("dialogs.btnOk"));
      }, opt);
    }
  }, {
    key: "postLocal",
    value: function postLocal() {
      var _this5 = this;
      utils.openLoader();
      var data = {
        _id: utils.generateUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expert: App.isExpertMode.toString(),
        coordinates: this._vals.coordinates,
        coordinatesAccuracy: this._vals.coordinatesAccuracy,
        altitude: this._vals.altitude,
        altitudeAccuracy: this._vals.altitudeAccuracy,
        type: this._vals.type,
        materialType: this._vals.materialType,
        hillPosition: this._vals.hillPosition,
        water: this._vals.water,
        vegetation: this._vals.vegetation,
        mitigation: this._vals.mitigation,
        mitigationList: this._vals.mitigationList,
        monitoring: this._vals.monitoring,
        monitoringList: this._vals.monitoringList,
        damages: this._vals.damages,
        damagesList: this._vals.damagesList,
        notes: this._vals.notes,
        imageUrl: this._vals.photo
      };
      utils.moveImage(data.imageUrl).then(function (url) {
        data.imageUrl = url;
        return landslide.postLocal(data);
      }).then(function (data) {
        utils.closeLoader();
        landslide.show(data.id, data.coords, data.preciseCoordinates, true);
        $("#sync-notification").show();
        _this5.close();
      });
    }
  }, {
    key: "postRemote",
    value: function postRemote() {
      var _this6 = this;
      utils.openLoader();
      var formData = new FormData();
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
      utils.appendFile(formData, this._vals.photo).then(function (formData) {
        return landslide.post(formData);
      }).then(function (data) {
        utils.closeLoader();
        landslide.show(data.id, data.coords, data.preciseCoordinates, false);
        _this6.close();
      });
    }
  }, {
    key: "putLocal",
    value: function putLocal() {
      var _this7 = this;
      utils.openLoader();
      var data = {
        updatedAt: new Date().toISOString(),
        type: this._vals.type,
        materialType: this._vals.materialType,
        hillPosition: this._vals.hillPosition,
        water: this._vals.water,
        vegetation: this._vals.vegetation,
        mitigation: this._vals.mitigation,
        mitigationList: this._vals.mitigationList,
        monitoring: this._vals.monitoring,
        monitoringList: this._vals.monitoringList,
        damages: this._vals.damages,
        damagesList: this._vals.damagesList,
        notes: this._vals.notes
      };
      var put = function put(removeOld) {
        landslide.putLocal(_this7._lsId, data).then(function () {
          if (removeOld) utils.deleteImage(_this7._oldPhoto, false);
          utils.closeLoader();
          InfoActivity.getInstance().getLandslide(data.id, true);
          InsertActivity.getInstance().close();
        });
      };
      if (this._vals.photo === this._oldPhoto) put(false);else {
        utils.moveImage(this._vals.photo).then(function (url) {
          data.imageUrl = url;
          put(true);
        });
      }
    }
  }, {
    key: "putRemote",
    value: function putRemote() {
      utils.openLoader();
      var formData = new FormData();
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
      var file = null;
      if (this._vals.photo !== this._oldPhoto) file = this._vals.photo;
      utils.appendFile(formData, file).then(function (formData) {
        return landslide.put(InsertActivity.getInstance()._lsId, formData);
      }).then(function (data) {
        InfoActivity.getInstance().getLandslide(data.id, false);
        utils.closeLoader();
        InsertActivity.getInstance().close();
      });
    }
  }, {
    key: "openFullscreenDialog",
    value: function openFullscreenDialog(dialog) {
      dialog.show();
      this._currOpenedFullDialog = dialog;
    }
  }, {
    key: "closeFullscreenDialog",
    value: function closeFullscreenDialog(dialog) {
      dialog.scrollTop(0).hide();
      this._currOpenedFullDialog = null;
    }
  }, {
    key: "openDialog",
    value: function openDialog(toOpen) {
      $("#opaque-overlay").show();
      $("#page--insert").css("overflow-y", "hidden");
      toOpen.show();
      this._currOpenedDialog = toOpen;
    }
  }, {
    key: "closeDialog",
    value: function closeDialog(toClose) {
      toClose.hide();
      $("#opaque-overlay").hide();
      $("#page--insert").css("overflow-y", "scroll");
      this._currOpenedDialog = null;
    }
  }, {
    key: "clearDomList",
    value: function clearDomList(listId) {
      $("#" + listId).html("");
    }
  }, {
    key: "deleteListItem",
    value: function deleteListItem(list, listId, idx) {
      $("#".concat(idx)).parent().remove();
      idx = idx.substring(idx.indexOf("-") + 1);
      list[idx] = "";
    }
  }, {
    key: "createMitigationItem",
    value: function createMitigationItem(type) {
      var _this8 = this;
      var btnId = "mitigation-" + this._newMitigationList.length;
      $("#mitigation-list").append("\n\n            <section class='list-item no-padding'>\n\n                <div class='list-item-text'>\n                    <p class='list-item-text-p'>".concat(i18next.t("insert.mitigation.enum." + type), "</p>\n                </div>\n\n                <div id='").concat(btnId, "' class='details-list-item-delete'>\n                    <i class='material-icons'>cancel</i>\n                </div>\n\n            </section>\n\n        "));
      $("#".concat(btnId)).click(function () {
        return _this8.deleteListItem(_this8._newMitigationList, "mitigation-list", btnId);
      });
      this._newMitigationList.push({
        type: type
      });
    }
  }, {
    key: "createMonitoringItem",
    value: function createMonitoringItem(type, status) {
      var _this9 = this;
      var btnId = "monitoring-" + this._newMonitoringList.length;
      $("#monitoring-list").append("\n\n            <section class='list-item'>\n\n                <div class='list-item-text padding-start'>\n\n                    <p class='list-item-text-p'>\n\n                        <span class='list-item-entry-title' data-i18n='insert.monitoring.type'>Type: </span>\n                        ".concat(i18next.t("insert.monitoring.enum." + type), "\n\n                    </p>\n\n                    <p class='list-item-text-p'>\n\n                        <span class='list-item-entry-title' data-i18n='insert.monitoring.status'>Status: </span>\n                        ").concat(i18next.t("insert.monitoring.enum." + status), "\n\n                    </p>\n\n                </div>\n\n                <div id='").concat(btnId, "' class='details-list-item-delete'><i class='material-icons'>cancel</i></div>\n\n            </section>\n\n        "));
      $("#".concat(btnId)).click(function () {
        return _this9.deleteListItem(_this9._newMonitoringList, "monitoring-list", btnId);
      });
      this._newMonitoringList.push({
        type: type,
        status: status
      });
    }
  }, {
    key: "createDamagesItem",
    value: function createDamagesItem(type, specification) {
      var _this10 = this;
      var btnId = "damage-" + this._newDamagesList.length;
      var info = i18next.t("insert.damages.enum." + type);
      if (specification !== "") info = specification;
      $("#damages-list").append("\n\n            <section class='list-item no-padding'>\n\n                <div class='list-item-text padding-start'>\n                    <p class='list-item-text-p'>".concat(info, "</p>\n                </div>\n\n                <div id='").concat(btnId, "' class='details-list-item-delete'><i class='material-icons'>cancel</i></div>\n\n            </section>\n\n        "));
      $("#".concat(btnId)).click(function () {
        return _this10.deleteListItem(_this10._newDamagesList, "damages-list", btnId);
      });
      this._newDamagesList.push({
        type: type,
        specification: specification
      });
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!InsertActivity._instance) InsertActivity._instance = new InsertActivity();
      return InsertActivity._instance;
    }
  }]);
  return InsertActivity;
}();
_defineProperty(InsertActivity, "_instance", void 0);
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var LoginActivity = function () {
  function LoginActivity() {
    var _this = this;
    _classCallCheck(this, LoginActivity);
    this.screen = $("#page--log-in");
    this.token = null;
    this.userId = null;
    var $authFooter = $(".auth-footer");
    window.addEventListener("keyboardWillShow", function () {
      return $authFooter.hide();
    });
    window.addEventListener("keyboardWillHide", function () {
      return $authFooter.show();
    });
    $("#link--reset-password").click(function () {
      if (!navigator.onLine) {
        _this.openOfflineDialog();
        return;
      }
      utils.switchActivity(ResetPasswordActivity.getInstance());
    });
    $("#btn--login").click(function () {
      if (!navigator.onLine) {
        _this.openOfflineDialog();
        return;
      }
      _this.login();
    });
    $("#link--register").click(function () {
      if (!navigator.onLine) {
        _this.openOfflineDialog();
        return;
      }
      utils.switchActivity(RegisterActivity.getInstance(), true, _this);
    });
  }
  _createClass(LoginActivity, [{
    key: "open",
    value: function open() {
      utils.pushStackActivity(this);
      this.screen.show();
      if (!navigator.onLine) this.openOfflineDialog();
    }
  }, {
    key: "close",
    value: function close() {
      utils.popStackActivity();
      this.screen.scrollTop(0).hide();
      $("#field--login-email").val("");
      $("#field--login-password").val("");
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      if (app._backPressedCount === 0) {
        utils.logOrToast(i18next.t("messages.backButton"), "short");
        app._backPressedCount++;
        setInterval(function () {
          return app._backPressedCount = 0;
        }, 2000);
      } else navigator.app.exitApp();
    }
  }, {
    key: "getAuthStatus",
    value: function getAuthStatus() {
      var token = localStorage.getItem("token");
      if (!token) return false;
      this.token = token;
      this.userId = localStorage.getItem("userId");
      return true;
    }
  }, {
    key: "login",
    value: function login() {
      var _this2 = this;
      utils.openLoader();
      var email = $("#field--login-email").val(),
        password = $("#field--login-password").val();
      if (email === "" || password === "") {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.validCredentials"), "long");
        return;
      }
      fetch("".concat(settings.serverUrl, "/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }
        return res.json();
      }).then(function (resData) {
        _this2.token = resData.token;
        _this2.userId = resData.userId;
        localStorage.setItem("token", resData.token);
        localStorage.setItem("userId", resData.userId);
        if (MapActivity.hasInstance()) MapActivity.deleteInstance();
        utils.switchActivity(MapActivity.getInstance(), true, _this2);
        utils.closeLoader();
      })["catch"](function (err) {
        console.error(err);
        $("#field--login-password").val("");
        utils.closeLoader();
        switch (err.code) {
          case 401:
            utils.logOrToast(i18next.t("messages.login401"), "long");
            break;
          case 460:
            _this2.createResendEmailDialog();
            break;
          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.login500"), i18next.t("dialogs.btnOk"));
            break;
        }
      });
    }
  }, {
    key: "createResendEmailDialog",
    value: function createResendEmailDialog() {
      var $alertOverlay = $("#alert-dialog-overlay");
      $alertOverlay.find(".dialog-title").html(i18next.t("auth.login.notVerifiedTitle"));
      $alertOverlay.find(".dialog-text").html("\n            <p>".concat(i18next.t("auth.login.notVerifiedMessage"), "</p>\n            <p class=\"dialog-link\" onclick=\"LoginActivity.getInstance().resendConfirmationEmail()\">\n                ").concat(i18next.t("auth.login.resendEmailLink"), "\n            </p>\n        "));
      $("#alert-first-button").html(i18next.t("dialogs.btnOk")).unbind("click").click(function () {
        return utils.closeAlert();
      });
      $alertOverlay.find(".dialog-wrapper").show();
      $alertOverlay.show();
    }
  }, {
    key: "resendConfirmationEmail",
    value: function resendConfirmationEmail() {
      utils.closeAlert();
      utils.openLoader();
      var email = $("#field--login-email").val();
      if (email === "") {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
        return;
      }
      fetch("".concat(settings.serverUrl, "/auth/confirmation/resend"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email
        })
      }).then(function (res) {
        if (res.status !== 201) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }
        utils.closeLoader();
        utils.createAlert(i18next.t("auth.login.resendEmailSuccessTitle"), i18next.t("auth.register.successMessage"), i18next.t("dialogs.btnOk"));
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();
        switch (err.code) {
          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.resendConfEmail404"), i18next.t("dialogs.btnOk"));
            break;
          case 409:
            utils.createAlert(i18next.t("dialogs.titleResendConfEmail409"), i18next.t("dialogs.resendConfEmail409"), i18next.t("dialogs.btnOk"));
            break;
          case 422:
            utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
            break;
          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.resendConfEmail500"), i18next.t("dialogs.btnOk"));
            break;
        }
      });
    }
  }, {
    key: "logout",
    value: function logout() {
      this.token = null;
      this.userId = null;
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
    }
  }, {
    key: "openOfflineDialog",
    value: function openOfflineDialog() {
      var _this3 = this;
      utils.createAlert("", i18next.t("auth.login.loginGuest"), i18next.t("dialogs.btnNo"), null, i18next.t("dialogs.btnYes"), function () {
        app.isGuest = true;
        utils.switchActivity(MapActivity.getInstance(), true, _this3);
      });
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!LoginActivity._instance) LoginActivity._instance = new LoginActivity();
      return LoginActivity._instance;
    }
  }]);
  return LoginActivity;
}();
_defineProperty(LoginActivity, "_instance", void 0);
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var MapActivity = function () {
  function MapActivity() {
    var _this = this;
    _classCallCheck(this, MapActivity);
    $("#map-wrapper").html("\n        \n            <div style=\"display: none\" id=\"page--map\">\n\n                <div style=\"display: none\" id=\"finding-position-msg\"><p data-i18n=\"map.positionFinding\"></p></div>\n\n                    <div id=\"map-control-settings\" class=\"map-control map-control-left map-control-top-1 fab\">\n                        <i class=\"material-icons fab-icon\">settings</i>\n                    </div>\n            \n                    <div id=\"map-control-sync\" class=\"map-control map-control-left map-control-top-2 fab\">\n                        <div style=\"display: none\" id=\"sync-notification\"></div>\n                        <i class=\"material-icons fab-icon\">sync</i>\n                    </div>\n            \n                    <div id=\"map-control-gps\" class=\"map-control map-control-right map-control-top-1 fab\">\n                        <i class=\"material-icons fab-icon\">gps_fixed</i>\n                    </div>\n            \n                    <div id=\"map-new-ls\" class=\"map-control map-control-center map-control-bottom fab-extended\">\n                        <p class=\"fab-extended-text\" data-i18n=\"map.fabText\"></p>\n                    </div>\n\n            </div>\n        \n        ");
    $("#finding-position-msg p").localize();
    $("#map-new-ls p").localize();
    this._screen = $("#page--map");
    this._screen.height($(window).height());
    this._map = L.map("page--map", {
      zoomSnap: 0,
      zoomAnimation: true,
      zoomAnimationThreshold: 4,
      fadeAnimation: true,
      markerZoomAnimation: true,
      touchZoom: "center"
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      errorTileUrl: "img/errorTile.png"
    }).addTo(this._map);
    this._centerMap = true;
    this._autoZoom = true;
    this._clusterClick = false;
    this._isFirstPositionFound = true;
    this.isPositionWatcherAttached = false;
    this.initUI();
    this.markersLayer = L.markerClusterGroup();
    this.markersLayer.on("clusterclick", function () {
      return _this._clusterClick = true;
    });
    this.markersLayer.on("animationend", function () {
      return _this._clusterClick = false;
    });
    this._map.addLayer(this.markersLayer);
    this.initPositionMarker();
    this._d = cordova.plugins.diagnostic;
    this.registerGPSWatcher();
  }
  _createClass(MapActivity, [{
    key: "open",
    value: function open() {
      utils.pushStackActivity(this);
      this._screen.show();
      this._map.setView(MapActivity.defaultLatLng, MapActivity.defaultZoom);
      this.positionMarker.setLatLng(MapActivity.defaultLatLng);
      this.checkLocationPermissions();
      landslide.showAll();
    }
  }, {
    key: "close",
    value: function close() {
      utils.popStackActivity();
      this._screen.hide();
      this.markersLayer.clearLayers();
      landslide.remoteMarkers = [];
      landslide.localMarkers = [];
      $("#sync-notification").hide();
      this.detachPositionWatcher();
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      if (app._backPressedCount === 0) {
        utils.logOrToast(i18next.t("messages.backButton"), "short");
        app._backPressedCount++;
        setInterval(function () {
          return app._backPressedCount = 0;
        }, 2000);
      } else navigator.app.exitApp();
    }
  }, {
    key: "initUI",
    value: function initUI() {
      var _this2 = this;
      $(".leaflet-control-container").hide();
      $("#map-control-settings").click(function () {
        return SettingsActivity.getInstance().open();
      });
      $("#map-control-sync").click(function () {
        if (utils.isTokenExpired()) return;
        if (app.isGuest) {
          utils.createAlert("", i18next.t("dialogs.syncGuest"), i18next.t("dialogs.btnOk"));
          return;
        }
        if (!navigator.onLine) {
          utils.createAlert("", i18next.t("dialogs.syncOffline"), i18next.t("dialogs.btnOk"));
          return;
        }
        if (landslide.localMarkers.length === 0) {
          utils.logOrToast(i18next.t("messages.localDbEmpty"), "long");
          return;
        }
        utils.createAlert("", i18next.t("dialogs.syncConfirmation", {
          number: landslide.localMarkers.length
        }), i18next.t("dialogs.btnNo"), null, i18next.t("dialogs.btnYes"), _asyncToGenerator(_regeneratorRuntime().mark(function _callee() {
          var res;
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                utils.openLoader();
                _context.next = 3;
                return landslide.sync();
              case 3:
                res = _context.sent;
                landslide.showAll();
                utils.closeLoader();
                utils.createAlert("", "<p style=\"margin-bottom: 8px\">".concat(res.successes, "/").concat(res.total, " ").concat(i18next.t("dialogs.syncSuccesses"), "</p>\n                         <p style=\"margin-bottom: 8px\">").concat(res.insertErrors, "/").concat(res.total, " ").concat(i18next.t("dialogs.syncInsertErr"), "</p>\n                         <p>").concat(res.deleteErrors, "/").concat(res.total, " ").concat(i18next.t("dialogs.syncDeleteErr"), "</p>"), i18next.t("dialogs.btnOk"));
              case 7:
              case "end":
                return _context.stop();
            }
          }, _callee);
        })));
      });
      this._$gps = $("#map-control-gps");
      this._$gps.click(function () {
        return _this2.handleGPSButton();
      });
      $("#map-new-ls").click(function () {
        return InsertActivity.getInstance().open();
      });
      this._map.on("dragstart", function () {
        return _this2.freeMap();
      });
      this._map.on("zoomstart", function () {
        if (!_this2._autoZoom || _this2._clusterClick) _this2.freeMap();
      });
      this._map.on("moveend", function () {
        if (_this2._clusterClick) return;
        if (!_this2._centerMap && _this2._autoZoom) {
          _this2._centerMap = true;
          _this2._autoZoom = false;
        }
      });
    }
  }, {
    key: "initPositionMarker",
    value: function initPositionMarker() {
      var _this3 = this;
      var positionMarkerIcon = L.icon({
        iconUrl: "img/user-marker.png",
        iconRetinaUrl: "img/user-marker-2x.png",
        iconSize: [37, 37],
        iconAnchor: [19, 19]
      });
      this.positionMarker = L.marker(MapActivity.defaultLatLng, {
        icon: positionMarkerIcon,
        draggable: true,
        zIndexOffset: 1000
      });
      this.currLatLng = MapActivity.defaultLatLng;
      this.currLatLngAccuracy = 0;
      this.currAltitude = -999;
      this.currAltitudeAccuracy = 0;
      this._accuracyCircle = undefined;
      this.positionMarker.on("dragstart", function () {
        _this3._isFirstPositionFound = true;
        _this3.detachPositionWatcher();
        if (_this3._accuracyCircle !== undefined) {
          _this3._map.removeLayer(_this3._accuracyCircle);
          _this3._accuracyCircle = undefined;
        }
      });
      this.positionMarker.on("dragend", function (e) {
        _this3.currLatLng = [e.target.getLatLng().lat, e.target.getLatLng().lng];
        _this3.currLatLngAccuracy = 0;
        _this3.currAltitude = -999;
        _this3.currAltitudeAccuracy = 0;
        console.log("Position marker dragged to ".concat(_this3.currLatLng));
      });
      this.positionMarker.addTo(this._map);
    }
  }, {
    key: "freeMap",
    value: function freeMap() {
      this._centerMap = false;
      this._$gps.removeClass("gps-on");
    }
  }, {
    key: "registerGPSWatcher",
    value: function registerGPSWatcher() {
      var _this4 = this;
      this._d.registerLocationStateChangeHandler(function (state) {
        if (device.platform === "Android" && state !== _this4._d.locationMode.LOCATION_OFF || device.platform === "iOS" && (state === _this4._d.permissionStatus.GRANTED || state === _this4._d.permissionStatus.GRANTED_WHEN_IN_USE)) {
          console.log("Đã bật GPS");
          _this4._$gps.children("i").html("gps_fixed");
          _this4._isFirstPositionFound = true;
          _this4._centerMap = true;
          _this4._autoZoom = true;
          _this4.attachPositionWatcher();
        } else {
          console.log("GPS đã tắt");
          _this4._$gps.removeClass("gps-on").children("i").html("gps_off");
          _this4.detachPositionWatcher();
          utils.createAlert("", i18next.t("dialogs.map.gpsOff"), i18next.t("dialogs.btnOk"));
        }
      });
    }
  }, {
    key: "checkLocationPermissions",
    value: function checkLocationPermissions() {
      var _this5 = this;
      this._d.getLocationAuthorizationStatus(function (status) {
        console.log(status);
        if (status === _this5._d.permissionStatus.NOT_REQUESTED || device.platform === "Android" && status === _this5._d.permissionStatus.DENIED_ALWAYS) {
          console.log("Quyền không được yêu cầu");
          _this5.requestLocationPermission();
        } else if (status === _this5._d.permissionStatus.DENIED) {
          console.log("Quyền bị từ chối");
          _this5._$gps.removeClass("gps-on").children("i").html("gps_off");
        } else if (status === _this5._d.permissionStatus.GRANTED || device.platform === "iOS" && status === _this5._d.permissionStatus.GRANTED_WHEN_IN_USE) {
          console.log("Đã được cho phép");
          _this5.checkGPSOn(function () {
            return _this5.attachPositionWatcher();
          });
        }
      }, function (err) {
        console.error("Error checking the permissions: ".concat(err));
        _this5._$gps.removeClass("gps-on").children("i").html("gps_off");
        utils.createAlert("", i18next.t("dialogs.map.permissionsCheckError"), i18next.t("dialogs.btnOk"));
      });
    }
  }, {
    key: "requestLocationPermission",
    value: function requestLocationPermission() {
      var _this6 = this;
      this._d.requestLocationAuthorization(function (status) {
        if (status === _this6._d.permissionStatus.GRANTED || device.platform === "iOS" && status === _this6._d.permissionStatus.GRANTED_WHEN_IN_USE) {
          console.log("Đã được cho phép");
          _this6.checkGPSOn(function () {
            return _this6.attachPositionWatcher();
          });
        } else {
          console.log("Permission denied");
          _this6._$gps.removeClass("gps-on").children("i").html("gps_off");
        }
      }, function (err) {
        console.error("Lỗi khi yêu cầu ủy quyền vị trí", err);
        _this6._$gps.removeClass("gps-on").children("i").html("gps_off");
        utils.createAlert("", i18next.t("dialogs.map.permissionsRequestError"), i18next.t("dialogs.btnOk"));
      }, this._d.locationAuthorizationMode.ALWAYS);
    }
  }, {
    key: "checkGPSOn",
    value: function checkGPSOn(callback) {
      var _this7 = this;
      this._d.isLocationEnabled(function (enabled) {
        if (enabled) {
          console.log("GPS on");
          _this7._$gps.children("i").html("gps_fixed");
          callback();
        } else {
          console.log("GPS off");
          _this7._$gps.removeClass("gps-on").children("i").html("gps_off");
          utils.createAlert("", i18next.t("dialogs.map.gpsOff"), i18next.t("dialogs.btnOk"));
        }
      }, function (err) {
        console.error("Không thể xác định xem vị trí có được bật hay không", err);
        _this7._$gps.removeClass("gps-on").children("i").html("gps_off");
        utils.createAlert("", i18next.t("dialogs.map.gpsCheckError"), i18next.t("dialogs.btnOk"));
      });
    }
  }, {
    key: "handleGPSButton",
    value: function handleGPSButton() {
      var _this8 = this;
      if (this._$gps.hasClass("gps-on")) {
        console.log("Người theo dõi đã bật");
        return;
      }
      this._d.getLocationAuthorizationStatus(function (status) {
        if (device.platform === "Android" && status === _this8._d.permissionStatus.DENIED) {
          console.log("Quyền bị từ chối nhưng có thể được yêu cầu");
          _this8.requestLocationPermission();
        } else if (device.platform === "Android" && status === _this8._d.permissionStatus.DENIED_ALWAYS || device.platform === "iOS" && status === _this8._d.permissionStatus.DENIED) {
          console.log("Không thể yêu cầu lại quyền.");
          _this8._$gps.removeClass("gps-on").children("i").html("gps_off");
          utils.createAlert("", i18next.t("dialogs.map.cannotRequestPermissions"), i18next.t("dialogs.btnOk"));
        } else {
          console.log("Đã được cho phép");
          _this8.checkGPSOn(function () {
            _this8._autoZoom = true;
            if (_this8._isFirstPositionFound) {
              _this8._centerMap = true;
              _this8.attachPositionWatcher();
              return;
            }
            if (_this8._map.getZoom() < 15) _this8._map.flyTo(_this8.currLatLng, MapActivity.watcherZoom);else _this8._map.flyTo(_this8.currLatLng);
            _this8.attachPositionWatcher();
          });
        }
      }, function (err) {
        console.error("L\u1ED7i khi ki\u1EC3m tra quy\u1EC1n ".concat(err));
        _this8._$gps.removeClass("gps-on").children("i").html("gps_off");
        utils.createAlert("", i18next.t("dialogs.map.permissionsCheckError"), i18next.t("dialogs.btnOk"));
      });
    }
  }, {
    key: "attachPositionWatcher",
    value: function attachPositionWatcher() {
      this._$gps.addClass("gps-on");
      if (this.isPositionWatcherAttached) return;
      $("#finding-position-msg").show();
      this._positionWatcherId = navigator.geolocation.watchPosition(this.onPositionSuccess.bind(this), function (err) {
        return console.error("L\u1ED7i t\xECm v\u1ECB tr\xED ".concat(err));
      }, {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 0
      });
      this.isPositionWatcherAttached = true;
      console.log("Trình theo dõi vị trí được đính kèm");
    }
  }, {
    key: "detachPositionWatcher",
    value: function detachPositionWatcher() {
      if (!this.isPositionWatcherAttached) return;
      this._$gps.removeClass("gps-on");
      navigator.geolocation.clearWatch(this._positionWatcherId);
      this.isPositionWatcherAttached = false;
      console.log("Trình theo dõi vị trí được đính kèm");
    }
  }, {
    key: "onPositionSuccess",
    value: function onPositionSuccess(pos) {
      this.currLatLng = [pos.coords.latitude, pos.coords.longitude];
      this.currLatLngAccuracy = pos.coords.accuracy;
      this.currAltitude = pos.coords.altitude || -999;
      this.currAltitudeAccuracy = pos.coords.altitude || 0;
      console.log("Đã tìm thấy vị trí");
      $("#finding-position-msg").hide();
      if (this._isFirstPositionFound) {
        this._map.setView(this.currLatLng, MapActivity.watcherZoom);
        this._isFirstPositionFound = false;
        this._autoZoom = false;
      } else if (this._centerMap) {
        this._map.panTo(this.currLatLng);
      }
      this.positionMarker.setLatLng(this.currLatLng);
      if (this._accuracyCircle !== undefined) this._map.removeLayer(this._accuracyCircle);
      this._accuracyCircle = L.circle(this.currLatLng, {
        radius: this.currLatLngAccuracy / 2,
        color: "green",
        opacity: .5
      }).addTo(this._map);
    }
  }], [{
    key: "defaultLatLng",
    get: function get() {
      return [21.0278, 105.8342];
    }
  }, {
    key: "defaultZoom",
    get: function get() {
      return 11;
    }
  }, {
    key: "watcherZoom",
    get: function get() {
      return 17;
    }
  }, {
    key: "hasInstance",
    value: function hasInstance() {
      return !!MapActivity._instance;
    }
  }, {
    key: "deleteInstance",
    value: function deleteInstance() {
      MapActivity._instance = null;
    }
  }, {
    key: "getInstance",
    value: function getInstance() {
      if (!MapActivity._instance) MapActivity._instance = new MapActivity();
      return MapActivity._instance;
    }
  }]);
  return MapActivity;
}();
_defineProperty(MapActivity, "_instance", void 0);
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _regeneratorRuntime() { "use strict"; _regeneratorRuntime = function _regeneratorRuntime() { return exports; }; var exports = {}, Op = Object.prototype, hasOwn = Op.hasOwnProperty, defineProperty = Object.defineProperty || function (obj, key, desc) { obj[key] = desc.value; }, $Symbol = "function" == typeof Symbol ? Symbol : {}, iteratorSymbol = $Symbol.iterator || "@@iterator", asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator", toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag"; function define(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: !0, configurable: !0, writable: !0 }), obj[key]; } try { define({}, ""); } catch (err) { define = function define(obj, key, value) { return obj[key] = value; }; } function wrap(innerFn, outerFn, self, tryLocsList) { var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator, generator = Object.create(protoGenerator.prototype), context = new Context(tryLocsList || []); return defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) }), generator; } function tryCatch(fn, obj, arg) { try { return { type: "normal", arg: fn.call(obj, arg) }; } catch (err) { return { type: "throw", arg: err }; } } exports.wrap = wrap; var ContinueSentinel = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var IteratorPrototype = {}; define(IteratorPrototype, iteratorSymbol, function () { return this; }); var getProto = Object.getPrototypeOf, NativeIteratorPrototype = getProto && getProto(getProto(values([]))); NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype); var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype); function defineIteratorMethods(prototype) { ["next", "throw", "return"].forEach(function (method) { define(prototype, method, function (arg) { return this._invoke(method, arg); }); }); } function AsyncIterator(generator, PromiseImpl) { function invoke(method, arg, resolve, reject) { var record = tryCatch(generator[method], generator, arg); if ("throw" !== record.type) { var result = record.arg, value = result.value; return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) { invoke("next", value, resolve, reject); }, function (err) { invoke("throw", err, resolve, reject); }) : PromiseImpl.resolve(value).then(function (unwrapped) { result.value = unwrapped, resolve(result); }, function (error) { return invoke("throw", error, resolve, reject); }); } reject(record.arg); } var previousPromise; defineProperty(this, "_invoke", { value: function value(method, arg) { function callInvokeWithMethodAndArg() { return new PromiseImpl(function (resolve, reject) { invoke(method, arg, resolve, reject); }); } return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(innerFn, self, context) { var state = "suspendedStart"; return function (method, arg) { if ("executing" === state) throw new Error("Generator is already running"); if ("completed" === state) { if ("throw" === method) throw arg; return doneResult(); } for (context.method = method, context.arg = arg;;) { var delegate = context.delegate; if (delegate) { var delegateResult = maybeInvokeDelegate(delegate, context); if (delegateResult) { if (delegateResult === ContinueSentinel) continue; return delegateResult; } } if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) { if ("suspendedStart" === state) throw state = "completed", context.arg; context.dispatchException(context.arg); } else "return" === context.method && context.abrupt("return", context.arg); state = "executing"; var record = tryCatch(innerFn, self, context); if ("normal" === record.type) { if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue; return { value: record.arg, done: context.done }; } "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg); } }; } function maybeInvokeDelegate(delegate, context) { var methodName = context.method, method = delegate.iterator[methodName]; if (undefined === method) return context.delegate = null, "throw" === methodName && delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method) || "return" !== methodName && (context.method = "throw", context.arg = new TypeError("The iterator does not provide a '" + methodName + "' method")), ContinueSentinel; var record = tryCatch(method, delegate.iterator, context.arg); if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel; var info = record.arg; return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel); } function pushTryEntry(locs) { var entry = { tryLoc: locs[0] }; 1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry); } function resetTryEntry(entry) { var record = entry.completion || {}; record.type = "normal", delete record.arg, entry.completion = record; } function Context(tryLocsList) { this.tryEntries = [{ tryLoc: "root" }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0); } function values(iterable) { if (iterable) { var iteratorMethod = iterable[iteratorSymbol]; if (iteratorMethod) return iteratorMethod.call(iterable); if ("function" == typeof iterable.next) return iterable; if (!isNaN(iterable.length)) { var i = -1, next = function next() { for (; ++i < iterable.length;) if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next; return next.value = undefined, next.done = !0, next; }; return next.next = next; } } return { next: doneResult }; } function doneResult() { return { value: undefined, done: !0 }; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) { var ctor = "function" == typeof genFun && genFun.constructor; return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name)); }, exports.mark = function (genFun) { return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun; }, exports.awrap = function (arg) { return { __await: arg }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () { return this; }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) { void 0 === PromiseImpl && (PromiseImpl = Promise); var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl); return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) { return result.done ? result.value : iter.next(); }); }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () { return this; }), define(Gp, "toString", function () { return "[object Generator]"; }), exports.keys = function (val) { var object = Object(val), keys = []; for (var key in object) keys.push(key); return keys.reverse(), function next() { for (; keys.length;) { var key = keys.pop(); if (key in object) return next.value = key, next.done = !1, next; } return next.done = !0, next; }; }, exports.values = values, Context.prototype = { constructor: Context, reset: function reset(skipTempReset) { if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined); }, stop: function stop() { this.done = !0; var rootRecord = this.tryEntries[0].completion; if ("throw" === rootRecord.type) throw rootRecord.arg; return this.rval; }, dispatchException: function dispatchException(exception) { if (this.done) throw exception; var context = this; function handle(loc, caught) { return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught; } for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i], record = entry.completion; if ("root" === entry.tryLoc) return handle("end"); if (entry.tryLoc <= this.prev) { var hasCatch = hasOwn.call(entry, "catchLoc"), hasFinally = hasOwn.call(entry, "finallyLoc"); if (hasCatch && hasFinally) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } else if (hasCatch) { if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0); } else { if (!hasFinally) throw new Error("try statement without catch or finally"); if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc); } } } }, abrupt: function abrupt(type, arg) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) { var finallyEntry = entry; break; } } finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null); var record = finallyEntry ? finallyEntry.completion : {}; return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record); }, complete: function complete(record, afterLoc) { if ("throw" === record.type) throw record.arg; return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel; }, finish: function finish(finallyLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel; } }, "catch": function _catch(tryLoc) { for (var i = this.tryEntries.length - 1; i >= 0; --i) { var entry = this.tryEntries[i]; if (entry.tryLoc === tryLoc) { var record = entry.completion; if ("throw" === record.type) { var thrown = record.arg; resetTryEntry(entry); } return thrown; } } throw new Error("illegal catch attempt"); }, delegateYield: function delegateYield(iterable, resultName, nextLoc) { return this.delegate = { iterator: values(iterable), resultName: resultName, nextLoc: nextLoc }, "next" === this.method && (this.arg = undefined), ContinueSentinel; } }, exports; }
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
var landslide = {
  _iconRemote: L.icon({
    iconUrl: "img/ls-marker-remote.png",
    iconRetinaUrl: "img/ls-marker-remote-2x.png",
    shadowUrl: "img/ls-marker-shadow.png",
    shadowRetinaUrl: "img/ls-marker-shadow-2x.png",
    iconSize: [31, 37],
    shadowSize: [31, 19],
    iconAnchor: [31, 37],
    shadowAnchor: [18, 18]
  }),
  _iconLocal: L.icon({
    iconUrl: "img/ls-marker-local.png",
    iconRetinaUrl: "img/ls-marker-local-2x.png",
    shadowUrl: "img/ls-marker-shadow.png",
    shadowRetinaUrl: "img/ls-marker-shadow-2x.png",
    iconSize: [31, 37],
    shadowSize: [31, 19],
    iconAnchor: [31, 37],
    shadowAnchor: [18, 18]
  }),
  remoteMarkers: [],
  localMarkers: [],
  show: function show(id, coordinates, preciseCoordinates, isLocal) {
    console.log("Showing " + id);
    var marker;
    if (preciseCoordinates && preciseCoordinates[0] !== undefined && preciseCoordinates[1] !== undefined) marker = L.marker(preciseCoordinates, {
      icon: landslide._iconRemote,
      draggable: false
    });else marker = L.marker(coordinates, {
      icon: landslide._iconRemote,
      draggable: false
    });
    console.log(marker);
    marker._id = id;
    marker.on("click", function () {
      return InfoActivity.getInstance().open(id, isLocal);
    });
    MapActivity.getInstance().markersLayer.addLayer(marker);
    if (isLocal) {
      marker.setIcon(landslide._iconLocal);
      landslide.localMarkers.push(marker);
    } else landslide.remoteMarkers.push(marker);
  },
  showAll: function showAll() {
    MapActivity.getInstance().markersLayer.clearLayers();
    landslide.remoteMarkers = [];
    landslide.localMarkers = [];
    $("#sync-notification").hide();
    var request = app.db.transaction("landslides", "readwrite").objectStore("landslides").getAll();
    request.onerror = function (err) {
      console.error("Error getting data", err);
      utils.createAlert("", i18next.t("dialogs.getLocalLsError"), i18next.t("dialogs.btnOk"));
    };
    request.onsuccess = function (e) {
      e.target.result.forEach(function (ls) {
        return landslide.show(ls._id, ls.coordinates, ls.preciseCoordinates, true);
      });
      if (landslide.localMarkers.length !== 0) $("#sync-notification").show();
    };
    if (!navigator.onLine || app.isGuest) return;
    if (utils.isTokenExpired()) return;
    var id = LoginActivity.getInstance().userId;
    fetch("".concat(settings.serverUrl, "/landslide/user/").concat(id), {
      headers: {
        Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
      }
    }).then(function (res) {
      if (res.status !== 200) {
        var err = new Error();
        err.code = res.status;
        throw err;
      }
      return res.json();
    }).then(function (data) {
      data.landslides.forEach(function (d) {
        return landslide.show(d._id, d.coordinates, d.preciseCoordinates, false);
      });
    })["catch"](function (err) {
      console.error(err);
      if (err.code === 401) utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getLandslides401"), i18next.t("dialogs.btnOk"));else utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getLandslides500"), i18next.t("dialogs.btnOk"));
    });
  },
  get: function get(id, isLocal) {
    var showError = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    return new Promise(function (resolve, reject) {
      if (isLocal) {
        var request = app.db.transaction("landslides", "readwrite").objectStore("landslides").get(id);
        request.onerror = function (err) {
          console.error("Retrieving ls failed", err);
          if (!showError) reject();
          utils.closeLoader();
          utils.createAlert("", i18next.t("dialogs.info.getLocalLsError"), i18next.t("dialogs.btnOk"));
          reject();
        };
        request.onsuccess = function (e) {
          resolve(e.target.result);
        };
      } else {
        if (utils.isTokenExpired()) {
          reject();
          return;
        }
        fetch("".concat(settings.serverUrl, "/landslide/").concat(id), {
          headers: {
            Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
          }
        }).then(function (res) {
          if (res.status !== 200) {
            var err = new Error();
            err.code = res.status;
            throw err;
          }
          return res.json();
        }).then(function (data) {
          resolve(data.landslide);
        })["catch"](function (err) {
          console.error(err);
          if (!showError) reject();
          utils.closeLoader();
          switch (err.code) {
            case 401:
              utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getLandslide401"), i18next.t("dialogs.btnOk"));
              break;
            case 404:
              utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.getLandslide404"), i18next.t("dialogs.btnOk"));
              break;
            default:
              utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getLandslide500"), i18next.t("dialogs.btnOk"));
              break;
          }
          reject();
        });
      }
    });
  },
  post: function post(formData) {
    var showError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }
      fetch("".concat(settings.serverUrl, "/landslide/post"), {
        method: "POST",
        headers: {
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
        },
        body: formData
      }).then(function (res) {
        if (res.status !== 201) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }
        return res.json();
      }).then(function (data) {
        resolve({
          id: data.landslide._id,
          coords: data.landslide.coordinates
        });
      })["catch"](function (err) {
        console.error(err);
        if (!showError) reject();
        utils.closeLoader();
        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.postLandslide401"), i18next.t("dialogs.btnOk"));
            break;
          case 422:
            utils.logOrToast(i18next.t("messages.postLandslide422"), "long");
            break;
          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.postLandslide500"), i18next.t("dialogs.btnOk"));
            break;
        }
        reject();
      });
    });
  },
  postLocal: function postLocal(data) {
    return new Promise(function (resolve, reject) {
      var request = app.db.transaction("landslides", "readwrite").objectStore("landslides").add(data);
      request.onerror = function (err) {
        console.log("An error occurred during the insert", err);
        utils.closeLoader();
        utils.createAlert("", i18next.t("dialogs.insert.insertError"), i18next.t("dialogs.btnOk"));
        reject();
      };
      request.onsuccess = function () {
        console.log("Insert done");
        resolve({
          id: data._id,
          coords: data.coordinates
        });
      };
    });
  },
  sync: function () {
    var _sync = _asyncToGenerator(_regeneratorRuntime().mark(function _callee4() {
      var total, success, insertErrors, deleteErrors, _loop, i;
      return _regeneratorRuntime().wrap(function _callee4$(_context5) {
        while (1) switch (_context5.prev = _context5.next) {
          case 0:
            total = landslide.localMarkers.length;
            success = 0, insertErrors = 0, deleteErrors = 0;
            _loop = _regeneratorRuntime().mark(function _loop(i) {
              return _regeneratorRuntime().wrap(function _loop$(_context4) {
                while (1) switch (_context4.prev = _context4.next) {
                  case 0:
                    console.log("Start ".concat(i));
                    _context4.next = 3;
                    return landslide.get(landslide.localMarkers[i]._id, true, false).then(function () {
                      var _ref = _asyncToGenerator(_regeneratorRuntime().mark(function _callee3(ls) {
                        var formData;
                        return _regeneratorRuntime().wrap(function _callee3$(_context3) {
                          while (1) switch (_context3.prev = _context3.next) {
                            case 0:
                              console.log("Found ".concat(i));
                              formData = new FormData();
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
                              _context3.next = 21;
                              return utils.appendFile(formData, ls.imageUrl, false).then(function () {
                                var _ref2 = _asyncToGenerator(_regeneratorRuntime().mark(function _callee(formData) {
                                  return _regeneratorRuntime().wrap(function _callee$(_context) {
                                    while (1) switch (_context.prev = _context.next) {
                                      case 0:
                                        _context.next = 2;
                                        return landslide.post(formData, false);
                                      case 2:
                                        return _context.abrupt("return", _context.sent);
                                      case 3:
                                      case "end":
                                        return _context.stop();
                                    }
                                  }, _callee);
                                }));
                                return function (_x2) {
                                  return _ref2.apply(this, arguments);
                                };
                              }()).then(_asyncToGenerator(_regeneratorRuntime().mark(function _callee2() {
                                return _regeneratorRuntime().wrap(function _callee2$(_context2) {
                                  while (1) switch (_context2.prev = _context2.next) {
                                    case 0:
                                      console.log("Posted ".concat(i));
                                      _context2.next = 3;
                                      return landslide["delete"](ls._id, true, ls.imageUrl, false).then(function () {
                                        return success++;
                                      })["catch"](function () {
                                        return deleteErrors++;
                                      });
                                    case 3:
                                    case "end":
                                      return _context2.stop();
                                  }
                                }, _callee2);
                              })))["catch"](function () {
                                return insertErrors++;
                              });
                            case 21:
                            case "end":
                              return _context3.stop();
                          }
                        }, _callee3);
                      }));
                      return function (_x) {
                        return _ref.apply(this, arguments);
                      };
                    }())["catch"](function () {
                      return insertErrors++;
                    });
                  case 3:
                  case "end":
                    return _context4.stop();
                }
              }, _loop);
            });
            i = 0;
          case 4:
            if (!(i < total)) {
              _context5.next = 9;
              break;
            }
            return _context5.delegateYield(_loop(i), "t0", 6);
          case 6:
            i++;
            _context5.next = 4;
            break;
          case 9:
            console.log("Done ls");
            return _context5.abrupt("return", {
              total: total,
              successes: success,
              insertErrors: insertErrors,
              deleteErrors: deleteErrors
            });
          case 11:
          case "end":
            return _context5.stop();
        }
      }, _callee4);
    }));
    function sync() {
      return _sync.apply(this, arguments);
    }
    return sync;
  }(),
  put: function put(id, formData) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }
      fetch("".concat(settings.serverUrl, "/landslide/").concat(id), {
        method: "PUT",
        headers: {
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
        },
        body: formData
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }
        return res.json();
      }).then(function (data) {
        resolve({
          id: data.landslide._id
        });
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();
        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.putLandslide401"), i18next.t("dialogs.btnOk"));
            break;
          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.putLandslide404"), i18next.t("dialogs.btnOk"));
            break;
          case 422:
            utils.logOrToast(i18next.t("messages.putLandslide422"), "long");
            break;
          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.putLandslide500"), i18next.t("dialogs.btnOk"));
            break;
        }
        reject();
      });
    });
  },
  putLocal: function putLocal(id, data) {
    return new Promise(function (resolve, reject) {
      var getRequest = app.db.transaction("landslides", "readwrite").objectStore("landslides").get(id);
      getRequest.onerror = function (err) {
        console.error("Cannot get the landslide", err);
        utils.closeLoader();
        utils.createAlert("", i18next.t("dialogs.insert.putLocalError"), i18next.t("dialogs.btnOk"));
        reject();
      };
      getRequest.onsuccess = function (e) {
        var ls = Object.assign(e.target.result, data);
        var request = app.db.transaction("landslides", "readwrite").objectStore("landslides").put(ls);
        request.onerror = function (err) {
          console.log("An error occurred during the insert", err);
          utils.closeLoader();
          utils.createAlert("", i18next.t("dialogs.insert.putLocalError"), i18next.t("dialogs.btnOk"));
          reject();
        };
        request.onsuccess = function (e) {
          resolve({
            id: e.target.result._id
          });
        };
      };
    });
  },
  "delete": function _delete(id, isLocal) {
    var localPhotoURL = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var showError = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
    return new Promise(function (resolve, reject) {
      if (isLocal) {
        var request = app.db.transaction("landslides", "readwrite").objectStore("landslides")["delete"](id);
        request.onerror = function (err) {
          console.error("Deleting failed", err);
          if (!showError) reject();
          utils.closeLoader();
          utils.createAlert("", i18next.t("dialogs.deleteLocalLsError"), i18next.t("dialogs.btnOk"));
          reject();
        };
        request.onsuccess = function () {
          landslide.removeMarker(id, true);
          if (landslide.localMarkers.length === 0) $("#sync-notification").hide();
          utils.deleteImage(localPhotoURL, showError).then(function () {
            resolve();
          });
          resolve();
        };
      } else {
        if (utils.isTokenExpired()) {
          reject();
          return;
        }
        fetch("".concat(settings.serverUrl, "/landslide/").concat(id), {
          method: "DELETE",
          headers: {
            Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
          }
        }).then(function (res) {
          if (res.status !== 200) {
            var err = new Error();
            err.code = res.status;
            throw err;
          }
          landslide.removeMarker(id, false);
          resolve();
        })["catch"](function (err) {
          console.error(err);
          if (!showError) reject();
          utils.closeLoader();
          switch (err.code) {
            case 401:
              utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.deleteLandslide401"), i18next.t("dialogs.btnOk"));
              break;
            case 404:
              utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.deleteLandslide404"), i18next.t("dialogs.btnOk"));
              break;
            default:
              utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.deleteLandslide500"), i18next.t("dialogs.btnOk"));
              break;
          }
          reject();
        });
      }
    });
  },
  removeMarker: function removeMarker(id, isLocal) {
    var clear = function clear(array) {
      var newMarkers = [];
      array.forEach(function (m) {
        if (m._id === id) MapActivity.getInstance().markersLayer.removeLayer(m);else newMarkers.push(m);
      });
      return newMarkers;
    };
    if (isLocal) landslide.localMarkers = clear(landslide.localMarkers);else landslide.remoteMarkers = clear(landslide.remoteMarkers);
  }
};
"use strict";

var user = {
  get: function get(id) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }
      fetch("".concat(settings.serverUrl, "/profile/").concat(id), {
        headers: {
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token)
        }
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }
        return res.json();
      }).then(function (data) {
        resolve(data.user);
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();
        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.getUser401"), i18next.t("dialogs.btnOk"));
            break;
          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.getUser404"), i18next.t("dialogs.btnOk"));
            break;
          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.getUser500"), i18next.t("dialogs.btnOk"));
            break;
        }
        reject();
      });
    });
  },
  putEmail: function putEmail(id, newEmail) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }
      fetch("".concat(settings.serverUrl, "/profile/").concat(id, "/change-email"), {
        method: "PUT",
        headers: {
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: newEmail
        })
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }
        resolve();
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();
        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.changeEmail401"), i18next.t("dialogs.btnOk"));
            break;
          case 409:
            utils.logOrToast(i18next.t("messages.changeEmail409"), "long");
            break;
          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.changeEmail404"), i18next.t("dialogs.btnOk"));
            break;
          case 422:
            utils.logOrToast(i18next.t("messages.changeEmail422"), "long");
            break;
          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.changeEmail500"), i18next.t("dialogs.btnOk"));
            break;
        }
        reject();
      });
    });
  },
  putPassword: function putPassword(id, oldPw, newPw, confirmPw) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }
      fetch("".concat(settings.serverUrl, "/profile/").concat(id, "/change-password"), {
        method: "PUT",
        headers: {
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          oldPassword: oldPw,
          newPassword: newPw,
          confirmPassword: confirmPw
        })
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }
        resolve();
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();
        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.changePw401"), i18next.t("dialogs.btnOk"));
            break;
          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.changePw404"), i18next.t("dialogs.btnOk"));
            break;
          case 422:
            utils.logOrToast(i18next.t("messages.changePw422"), "long");
            break;
          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.changePw500"), i18next.t("dialogs.btnOk"));
            break;
        }
        reject();
      });
    });
  },
  putProfile: function putProfile(id, json) {
    return new Promise(function (resolve, reject) {
      if (utils.isTokenExpired()) {
        reject();
        return;
      }
      fetch("".concat(settings.serverUrl, "/profile/").concat(id, "/update-profile"), {
        method: "PUT",
        headers: {
          Authorization: "Bearer ".concat(LoginActivity.getInstance().token),
          "Content-Type": "application/json"
        },
        body: json
      }).then(function (res) {
        if (res.status !== 200) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }
        return res.json();
      }).then(function (data) {
        resolve(data.user);
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();
        switch (err.code) {
          case 401:
            utils.createAlert(i18next.t("dialogs.title401"), i18next.t("dialogs.editProfile401"), i18next.t("dialogs.btnOk"));
            break;
          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.editProfile404"), i18next.t("dialogs.btnOk"));
            break;
          case 422:
            utils.logOrToast(i18next.t("messages.editProfile422"), "long");
            break;
          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.editProfile500"), i18next.t("dialogs.btnOk"));
            break;
        }
        reject();
      });
    });
  }
};
"use strict";

var utils = {
  _$alertOverlay: $("#alert-dialog-overlay"),
  isLoaderOpen: false,
  isAlertOpen: false,
  isImgScreenOpen: false,
  switchActivity: function switchActivity(toOpen) {
    var close = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var toClose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    if (close) toClose.close();
    toOpen.open();
  },
  pushStackActivity: function pushStackActivity(activity) {
    return app.activityStack.push(activity);
  },
  popStackActivity: function popStackActivity() {
    return app.activityStack.pop();
  },
  generateUID: function generateUID() {
    var array = new Uint32Array(6),
      uid = '';
    window.crypto.getRandomValues(array);
    for (var i = 0; i < array.length; i++) {
      uid += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4);
    }
    return uid;
  },
  isTokenExpired: function isTokenExpired() {
    return false;
  },
  getLocalDirectory: function getLocalDirectory() {
    return new Promise(function (resolve, reject) {
      window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (rootDir) {
        rootDir.getDirectory("images", {
          create: true
        }, function (dir) {
          return resolve(dir);
        }, function (err) {
          console.error("Fail to get or create main directory", err);
          reject();
        });
      }, function (err) {
        console.error("Fail to resolve root directory", err);
        reject();
      });
    });
  },
  moveImage: function moveImage(imageUrl) {
    return new Promise(function (resolve, reject) {
      var onError = function onError() {
        utils.closeLoader();
        utils.createAlert("", i18next.t("dialogs.insert.movePictureError"), i18next.t("dialogs.btnOk"));
        reject();
      };
      window.resolveLocalFileSystemURL(imageUrl, function (fileEntry) {
        utils.getLocalDirectory().then(function (dir) {
          fileEntry.moveTo(dir, fileEntry.name, function (file) {
            console.log("File moved!", file);
            resolve(file.nativeURL);
          }, function (err) {
            console.error("Fail to move the file", err);
            onError();
          });
        })["catch"](function () {
          onError();
        });
      }, function (err) {
        console.error("Failed to resolve the file", err);
        onError();
      });
    });
  },
  deleteImage: function deleteImage(imageUrl, showError) {
    return new Promise(function (resolve) {
      var onError = function onError() {
        if (showError) utils.createAlert("", i18next.t("dialogs.deleteLocalPhotoError"), i18next.t("dialogs.btnOk"));
        resolve();
      };
      window.resolveLocalFileSystemURL(imageUrl, function (file) {
        file.remove(function () {
          console.log("Photo removed successfully");
          resolve();
        }, function (err) {
          console.error("Error removing photo", err);
          onError();
        });
      }, function (err) {
        console.error("Error getting the photo", err);
        onError();
      });
    });
  },
  appendFile: function appendFile(formData, fileUri, showError) {
    return new Promise(function (resolve, reject) {
      if (!fileUri) {
        resolve(formData);
        return;
      }
      window.resolveLocalFileSystemURL(fileUri, function (fileEntry) {
        fileEntry.file(function (file) {
          var reader = new FileReader();
          reader.onloadend = function (e) {
            var blob = new Blob([new Uint8Array(e.target.result)], {
              type: "image/jpeg"
            });
            formData.append("image", blob);
            resolve(formData);
          };
          reader.onerror = function (fileReadResult) {
            console.error("Reader error ".concat(fileReadResult));
            utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));
            reject();
          };
          reader.readAsArrayBuffer(file);
        }, function (err) {
          console.error("Error getting the fileEntry file ".concat(err));
          if (!showError) {
            reject();
            return;
          }
          utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));
          reject();
        });
      }, function (err) {
        console.error("Error getting the file ".concat(err));
        if (!showError) reject();
        utils.createAlert("", i18next.t("dialogs.errorAppendPicture"), i18next.t("dialogs.btnOk"));
        reject();
      });
    });
  },
  createAlert: function createAlert(title, msg, btn1) {
    var clbBtn1 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var btn2 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
    var clbBtn2 = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
    if (title === "") utils._$alertOverlay.find(".dialog-title").hide();else utils._$alertOverlay.find(".dialog-title").html(title);
    utils._$alertOverlay.find(".dialog-text").html(msg);
    $("#alert-first-button").html(btn1).unbind("click").click(function () {
      utils.closeAlert();
      if (clbBtn1) clbBtn1();
    });
    if (btn2) {
      $("#alert-second-button").show().html(btn2).unbind("click").click(function () {
        utils.closeAlert();
        if (clbBtn2) clbBtn2();
      });
    }
    utils._$alertOverlay.find(".dialog-wrapper").show();
    utils._$alertOverlay.show();
    utils.isAlertOpen = true;
  },
  closeAlert: function closeAlert() {
    utils._$alertOverlay.hide().children(".dialog-text").html("");
    utils._$alertOverlay.find(".dialog-title").show().html("");
    $("#alert-second-button").hide();
    utils._$alertOverlay.find(".dialog-wrapper").hide();
    utils.isAlertOpen = false;
  },
  openLoader: function openLoader() {
    utils._$alertOverlay.find(".spinner-wrapper").show();
    utils._$alertOverlay.show();
    utils.isLoaderOpen = true;
  },
  closeLoader: function closeLoader() {
    utils._$alertOverlay.hide();
    utils._$alertOverlay.find(".spinner-wrapper").hide();
    utils.isLoaderOpen = false;
  },
  logOrToast: function logOrToast(msg, duration) {
    window.plugins.toast.show(msg, duration, "bottom");
  },
  changeSelectorLabel: function changeSelectorLabel(selectorId) {
    var changeColor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var $selector = $("#" + selectorId),
      $label = $("[for='" + selectorId + "'").find(".label-description");
    if ($selector.val() === "none") {
      $label.html(i18next.t("selectors." + selectorId + "DefLabel"));
      if (changeColor) $label.css("color", "#757575");
    } else {
      $label.html($selector.find("option:selected").text());
      if (changeColor) $label.css("color", "#000000");
    }
  },
  resetSelector: function resetSelector(selectorId) {
    $("#" + selectorId).get(0).selectedIndex = 0;
    utils.changeSelectorLabel(selectorId);
  },
  openImgScreen: function openImgScreen(scr) {
    var editable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var clbEdit = arguments.length > 2 ? arguments[2] : undefined;
    var clbCancel = arguments.length > 3 ? arguments[3] : undefined;
    $("#img-screen-container img").attr("src", scr);
    $("#img-screen-close").click(function () {
      return utils.closeImgScreen();
    });
    if (editable) {
      $("#img-screen-edit").unbind("click").click(function () {
        utils.closeImgScreen();
        clbEdit();
      }).parent().show();
      $("#img-screen-delete").show().unbind("click").click(function () {
        utils.createAlert("", i18next.t("dialogs.photoScreen.deletePictureConfirmation"), i18next.t("dialogs.btnCancel"), null, i18next.t("dialogs.btnOk"), function () {
          clbCancel();
          utils.closeImgScreen();
        });
      }).parent().show();
    }
    $("#img-screen").show();
    utils.isImgScreenOpen = true;
  },
  closeImgScreen: function closeImgScreen() {
    $("#img-screen").hide();
    $("#img-screen-container img").attr("src", "");
    $("#img-screen-edit").parent().hide();
    $("#img-screen-delete").parent().hide();
    utils.isImgScreenOpen = false;
  }
};
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var RegisterActivity = function () {
  function RegisterActivity() {
    var _this = this;
    _classCallCheck(this, RegisterActivity);
    this.disclaimer = $("#page--register-disclaimer");
    this.screen = $("#page--register");
    this._isDisclaimerOpen = false;
    $("#btn--register-disclaimer-accept").click(function () {
      _this.screen.show();
      _this.disclaimer.scrollTop(0).hide();
      _this._isDisclaimerOpen = false;
    });
    $("#link--register-disclaimer-back").click(function () {
      return utils.switchActivity(LoginActivity.getInstance(), true, _this);
    });
    $("#btn--register-done").click(function () {
      return _this.register();
    });
    $("#link--login").click(function () {
      return utils.switchActivity(LoginActivity.getInstance(), true, _this);
    });
    $("#register-age").change(function () {
      return utils.changeSelectorLabel("register-age", true);
    });
    $("#register-gender").change(function () {
      return utils.changeSelectorLabel("register-gender", true);
    });
    $("#register-occupation").change(function () {
      return utils.changeSelectorLabel("register-occupation", true);
    });
  }
  _createClass(RegisterActivity, [{
    key: "open",
    value: function open() {
      utils.pushStackActivity(this);
      this.disclaimer.show();
      this._isDisclaimerOpen = true;
    }
  }, {
    key: "close",
    value: function close() {
      utils.popStackActivity();
      this.disclaimer.scrollTop(0).hide();
      this.screen.scrollTop(0).hide();
      $("#field--register-email").val("");
      $("#field--register-password").val("");
      $("#field--register-confirm-password").val("");
      utils.resetSelector("register-age");
      utils.resetSelector("register-gender");
      utils.resetSelector("register-occupation");
      this._isDisclaimerOpen = false;
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      if (!this._isDisclaimerOpen) {
        this.disclaimer.show();
        this.screen.scrollTop(0).hide();
        this._isDisclaimerOpen = true;
        return;
      }
      utils.switchActivity(LoginActivity.getInstance(), true, this);
    }
  }, {
    key: "register",
    value: function register() {
      var _this2 = this;
      utils.openLoader();
      var email = $("#field--register-email").val(),
        password = $("#field--register-password").val(),
        confirmPassword = $("#field--register-confirm-password").val(),
        age = $("#register-age").val(),
        gender = $("#register-gender").val(),
        occupation = $("#register-occupation").val();
      if (email === "") {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
        return;
      }
      if (password === "" || password.length < 8 || !/\d/.test(password.toString())) {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.weakPassword"), "long");
        return;
      }
      if (password !== confirmPassword) {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.passwordsNotMatch"), "long");
        return;
      }
      fetch("".concat(settings.serverUrl, "/auth/signup"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password,
          confirmPassword: confirmPassword,
          age: age,
          gender: gender,
          occupation: occupation
        })
      }).then(function (res) {
        if (res.status !== 201) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }
        utils.closeLoader();
        utils.switchActivity(LoginActivity.getInstance(), true, _this2);
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();
        switch (err.code) {
          case 409:
            utils.logOrToast(i18next.t("messages.register409"), "long");
            break;
          case 422:
            utils.logOrToast(i18next.t("messages.register422"), "long");
            break;
          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.register500"), i18next.t("dialogs.btnOk"));
            break;
        }
      });
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!RegisterActivity._instance) RegisterActivity._instance = new RegisterActivity();
      return RegisterActivity._instance;
    }
  }]);
  return RegisterActivity;
}();
_defineProperty(RegisterActivity, "_instance", void 0);
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var ResetPasswordActivity = function () {
  function ResetPasswordActivity() {
    var _this = this;
    _classCallCheck(this, ResetPasswordActivity);
    this.screen = $("#page--reset-pw");
    $("#btn--reset-pw-close").click(function () {
      return _this.close();
    });
    $("#btn--reset-pw-done").click(function () {
      return _this.resetPassword();
    });
  }
  _createClass(ResetPasswordActivity, [{
    key: "open",
    value: function open() {
      utils.pushStackActivity(this);
      this.screen.show();
    }
  }, {
    key: "close",
    value: function close() {
      utils.popStackActivity();
      this.screen.scrollTop(0).hide();
      $("#field--reset-pw-email").val("");
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      this.close();
    }
  }, {
    key: "resetPassword",
    value: function resetPassword() {
      var _this2 = this;
      utils.openLoader();
      var email = $("#field--reset-pw-email").val();
      if (email === "") {
        utils.closeLoader();
        utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
        return;
      }
      fetch("".concat(settings.serverUrl, "/auth/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email
        })
      }).then(function (res) {
        if (res.status !== 201) {
          var err = new Error();
          err.code = res.status;
          throw err;
        }
        _this2.close();
        utils.closeLoader();
        utils.createAlert(i18next.t("auth.login.resetPassword.successTitle"), i18next.t("auth.login.resetPassword.successMessage"), i18next.t("dialogs.btnOk"));
      })["catch"](function (err) {
        console.error(err);
        utils.closeLoader();
        switch (err.code) {
          case 404:
            utils.createAlert(i18next.t("dialogs.title404"), i18next.t("dialogs.resetPw404"), i18next.t("dialogs.btnOk"));
            break;
          case 422:
            utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
            break;
          default:
            utils.createAlert(i18next.t("dialogs.title500"), i18next.t("dialogs.resetPw500"), i18next.t("dialogs.btnOk"));
            break;
        }
      });
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!ResetPasswordActivity._instance) ResetPasswordActivity._instance = new ResetPasswordActivity();
      return ResetPasswordActivity._instance;
    }
  }]);
  return ResetPasswordActivity;
}();
_defineProperty(ResetPasswordActivity, "_instance", void 0);
"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
var SettingsActivity = function () {
  function SettingsActivity() {
    _classCallCheck(this, SettingsActivity);
    this._screen = $("#page--settings");
    this._openedSetting = null;
    this.initSettingsUi();
    this.initAccountUi();
  }
  _createClass(SettingsActivity, [{
    key: "open",
    value: function open() {
      utils.pushStackActivity(this);
      $("#expert-cbx").prop("checked", App.isExpertMode);
      this._screen.show();
    }
  }, {
    key: "close",
    value: function close() {
      utils.popStackActivity();
      this._screen.scrollTop(0).hide();
      this._openedSetting = null;
    }
  }, {
    key: "onBackPressed",
    value: function onBackPressed() {
      if (this._openedSetting) {
        this.closeSetting(this._openedSetting);
        return;
      }
      this.close();
    }
  }, {
    key: "initSettingsUi",
    value: function initSettingsUi() {
      var _this = this;
      $("#settings-close").click(function () {
        return _this.close();
      });
      $("#settings-account-wrapper").click(function () {
        if (app.isGuest) {
          utils.createAlert("", i18next.t("dialogs.profileGuest"), i18next.t("dialogs.btnNo"), null, i18next.t("dialogs.btnYes"), function () {
            _this.logout();
            app.isGuest = false;
          });
          return;
        }
        if (!navigator.onLine) {
          utils.createAlert("", i18next.t("dialogs.profileOffline"), i18next.t("dialogs.btnOk"));
          return;
        }
        $("#page--account-settings").show();
        _this._openedSetting = "account";
      });
      $("#expert-cbx").click(function () {
        localStorage.setItem("mode", (!App.isExpertMode).toString());
      });
      $("#settings-language-wrapper").click(function () {
        var targetLng;
        console.log("Current language: ".concat(App.appLanguage));
        if (App.appLanguage === "en") {
          targetLng = "it";
        } else {
          targetLng = "en";
        }
        i18next.changeLanguage(targetLng, function (err) {
          if (err) {
            console.error("Error changing language", err);
            utils.logOrToast(i18next.t("messages.changeLngError"), "long");
            return;
          }
          $("body").localize();
          localStorage.setItem("lng", targetLng);
          utils.logOrToast(i18next.t("messages.lngChanged", {
            lng: targetLng
          }), "long");
        });
      });
    }
  }, {
    key: "initAccountUi",
    value: function initAccountUi() {
      var _this2 = this;
      $("#account-close").click(function () {
        return _this2.closeSetting("account");
      });
      $("#account-edit-profile").click(function () {
        utils.openLoader();
        user.get(LoginActivity.getInstance().userId).then(function (data) {
          $("#edit-profile-age").val(data.age);
          utils.changeSelectorLabel("edit-profile-age", true);
          $("#edit-profile-gender").val(data.gender);
          utils.changeSelectorLabel("edit-profile-gender", true);
          $("#edit-profile-occupation").val(data.occupation);
          utils.changeSelectorLabel("edit-profile-occupation", true);
          $("#page--edit-profile").show();
          utils.closeLoader();
        });
        _this2._openedSetting = "editProfile";
      });
      $("#account-logout").click(function () {
        utils.createAlert("", i18next.t("settings.account.logoutConfirmation"), i18next.t("dialogs.btnCancel"), null, i18next.t("dialogs.btnOk"), function () {
          $("#page--account-settings").scrollTop(0).hide();
          _this2.logout();
        });
      });
      this.initEditProfile();
    }
  }, {
    key: "initChangeEmail",
    value: function initChangeEmail() {
      var _this3 = this;
      $("#change-email-close").click(function () {
        return _this3.closeSetting("changeEmail");
      });
      $("#change-email-done").click(function () {
        utils.openLoader();
        var email = $("#new-email").val();
        if (email === "") {
          utils.closeLoader();
          utils.logOrToast(i18next.t("messages.mandatoryEmail"), "long");
          return;
        }
        user.putEmail(LoginActivity.getInstance().userId, email).then(function () {
          utils.closeLoader();
          _this3.closeSetting("changeEmail");
          $("#page--account-settings").scrollTop(0).hide();
          _this3.logout();
          utils.createAlert(i18next.t("settings.account.changeEmail.successTitle"), i18next.t("settings.account.changeEmail.successMessage"), i18next.t("dialogs.btnOk"));
        });
      });
    }
  }, {
    key: "initChangePw",
    value: function initChangePw() {
      var _this4 = this;
      $("#change-pw-close").click(function () {
        return _this4.closeSetting("changePassword");
      });
      $("#change-pw-done").click(function () {
        utils.openLoader();
        var oldPassword = $("#change-pw-old-password").val(),
          newPassword = $("#change-pw-new-password").val(),
          confirmPassword = $("#change-pw-confirm-password").val();
        if (oldPassword === "") {
          utils.logOrToast(i18next.t("messages.insertOldPassword"), "long");
          utils.closeLoader();
          return;
        }
        if (newPassword === "" || newPassword.length < 8 || !/\d/.test(newPassword)) {
          utils.logOrToast(i18next.t("messages.weakNewPassword"), "long");
          utils.closeLoader();
          return;
        }
        if (oldPassword === newPassword) {
          utils.logOrToast(i18next.t("messages.samePassword"), "long");
          utils.closeLoader();
          return;
        }
        if (newPassword !== confirmPassword) {
          utils.logOrToast(i18next.t("messages.passwordsNotMatch"), "long");
          utils.closeLoader();
          return;
        }
        user.putPassword(LoginActivity.getInstance().userId, oldPassword, newPassword, confirmPassword).then(function () {
          utils.closeLoader();
          _this4.closeSetting("changePassword");
          utils.logOrToast(i18next.t("messages.changePwSuccess"), "long");
        });
      });
    }
  }, {
    key: "initEditProfile",
    value: function initEditProfile() {
      var _this5 = this;
      $("#edit-profile-close").click(function () {
        return _this5.closeSetting("editProfile");
      });
      $("#edit-profile-done").click(function () {
        utils.openLoader();
        var age = $("#edit-profile-age").val(),
          gender = $("#edit-profile-gender").val(),
          occupation = $("#edit-profile-occupation").val();
        user.putProfile(LoginActivity.getInstance().userId, JSON.stringify({
          age: age,
          gender: gender,
          occupation: occupation
        })).then(function (data) {
          $("#edit-profile-age").val(data.age);
          utils.changeSelectorLabel("edit-profile-age", true);
          $("#edit-profile-gender").val(data.gender);
          utils.changeSelectorLabel("edit-profile-gender", true);
          $("#edit-profile-occupation").val(data.occupation);
          utils.changeSelectorLabel("edit-profile-occupation", true);
          utils.closeLoader();
          _this5.closeSetting("editProfile");
          utils.logOrToast(i18next.t("messages.editProfileSuccess"), "long");
        });
      });
      $("#edit-profile-age").change(function () {
        return utils.changeSelectorLabel("edit-profile-age", true);
      });
      $("#edit-profile-gender").change(function () {
        return utils.changeSelectorLabel("edit-profile-gender", true);
      });
      $("#edit-profile-occupation").change(function () {
        return utils.changeSelectorLabel("edit-profile-occupation", true);
      });
    }
  }, {
    key: "closeSetting",
    value: function closeSetting(name) {
      switch (name) {
        case "account":
          $("#page--account-settings").scrollTop(0).hide();
          this._openedSetting = null;
          break;
        case "editProfile":
          $("#page--edit-profile").scrollTop(0).hide();
          $("#edit-profile-age").val("");
          utils.changeSelectorLabel("edit-profile-age", true);
          $("#edit-profile-gender").val("");
          utils.changeSelectorLabel("edit-profile-gender", true);
          $("#edit-profile-occupation").val("");
          utils.changeSelectorLabel("edit-profile-occupation", true);
          this._openedSetting = "account";
          break;
        case "changeEmail":
          $("#change-email").scrollTop(0).hide();
          $("#new-email").val("");
          this._openedSetting = "account";
          break;
        case "changePassword":
          $("#change-pw").scrollTop(0).hide();
          $("#change-pw-old-password").val("");
          $("#change-pw-new-password").val("");
          $("#change-pw-confirm-password").val("");
          this._openedSetting = "account";
          break;
      }
    }
  }, {
    key: "logout",
    value: function logout() {
      this.close();
      MapActivity.getInstance().close();
      LoginActivity.getInstance().logout();
      LoginActivity.getInstance().open();
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (!SettingsActivity._instance) SettingsActivity._instance = new SettingsActivity();
      return SettingsActivity._instance;
    }
  }]);
  return SettingsActivity;
}();
_defineProperty(SettingsActivity, "_instance", void 0);
