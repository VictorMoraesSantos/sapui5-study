sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("Api.controller.Register", {
      onInit: function () {
        let oViewModel = new JSONModel({
          username: "",
          email: "",
          password: "",
          errorMessage: "",
        });
        this.getView().setModel(oViewModel, "register");
      },

      onRegister: function () {
        let oViewModel = this.getView().getModel("register");
        let sUserName = oViewModel.getProperty("/username");
        let sEmail = oViewModel.getProperty("/email");
        let sPassword = oViewModel.getProperty("/password");

        oViewModel.setProperty("/errorMessage", "");

        if (!sUserName || !sEmail || !sPassword) {
          oViewModel.setProperty("/errorMessage", "Please fill in all fields.");
          return;
        }

        fetch("https://localhost:7051/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: sUserName,
            email: sEmail,
            password: sPassword,
          }),
        })
          .then((response) => {
            if (!response.ok) throw new Error("Registration failed.");
            return response;
          })
          .then(() => {
            MessageToast.show("Registration successful! Please log in.");
            this.getOwnerComponent().getRouter().navTo("login", {}, true);
          })
          .catch((error) => {
            oViewModel.setProperty("/errorMessage", error.message);
          });
      },
    });
  }
);
