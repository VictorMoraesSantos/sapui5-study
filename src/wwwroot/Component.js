sap.ui.define(
  ["sap/ui/core/UIComponent", "sap/ui/model/json/JSONModel"],
  function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("Api.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        let oAuthModel = new JSONModel({
          isAuthenticated: false,
          userName: null,
          email: null,
          token: null,
        });
        this.setModel(oAuthModel, "auth");

        this._checkExistingAuth();

        UIComponent.prototype.init.apply(this, arguments);

        let oRouter = this.getRouter();
        oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
        oRouter.initialize();
      },

      _checkExistingAuth: function () {
        let sToken = localStorage.getItem("authToken");
        if (sToken) {
          let oAuthModel = this.getModel("auth");
          oAuthModel.setProperty("/isAuthenticated", true);
          oAuthModel.setProperty("/token", sToken);
        }
      },

      _onBeforeRouteMatched: function (oEvent) {
        let oAuthModel = this.getModel("auth");
        let bIsAuthenticated = oAuthModel.getProperty("/isAuthenticated");
        let sRouteName = oEvent.getParameter("name");
        let aPublicRoutes = ["login", "register", "home"];
        let aProtectedRoutes = ["products", "productDetails"];
        if (aProtectedRoutes.indexOf(sRouteName) !== -1 && !bIsAuthenticated) {
          oEvent.preventDefault();
          this.getRouter().navTo("login", {}, true);
        }
      },

      logout: function () {
        let oAuthModel = this.getModel("auth");
        oAuthModel.setProperty("/isAuthenticated", false);
        oAuthModel.setProperty("/userName", null);
        oAuthModel.setProperty("/email", null);
        oAuthModel.setProperty("/token", null);
        localStorage.removeItem("authToken");
        this.getRouter().navTo("login", {}, true);
      },
    });
  }
);
