sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("Api.controller.Login", {
      onInit: function () {
        let oViewModel = new JSONModel({
          username: "",
          password: "",
          errorMessage: "",
        });
        this.getView().setModel(oViewModel, "login");

        let oAuthModel = this.getOwnerComponent().getModel("auth");
        if (oAuthModel.getProperty("/isAuthenticated")) {
          this.getOwnerComponent().getRouter().navTo("home", {}, true);
        }
      },

      onLogin: function () {
        let oViewModel = this.getView().getModel("login");
        let sUserName = oViewModel.getProperty("/username");
        let sPassword = oViewModel.getProperty("/password");

        oViewModel.setProperty("/errorMessage", "");

        if (!sUserName || !sPassword) {
          oViewModel.setProperty(
            "/errorMessage",
            "Please enter both username and password."
          );
          return;
        }

        fetch("https://localhost:7051/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: sUserName,
            password: sPassword,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Network response was not ok");
            }
            return response.json();
          })
          .then((data) => {
            localStorage.setItem("authToken", data.token);

            let oAuthModel = this.getOwnerComponent().getModel("auth");
            oAuthModel.setProperty("/isAuthenticated", true);
            oAuthModel.setProperty("/username", data.username);
            oAuthModel.setProperty("/email", data.email);
            oAuthModel.setProperty("/token", data.token);

            oViewModel.setProperty("/username", "");
            oViewModel.setProperty("/password", "");

            this.getOwnerComponent().getRouter().navTo("home", {}, true);
          })
          .catch((error) => {
            oViewModel.setProperty(
              "/errorMessage",
              "Login failed. Please check your credentials."
            );
          });
      },

      onNavigateToRegister: function () {
        this.getOwnerComponent().getRouter().navTo("register", {}, true);
      },

      onNavBack: function () {
        this.getOwnerComponent().getRouter().navTo("home", {}, true);
      },
    });
  }
);
