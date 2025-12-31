sap.ui.define([], function () {
  "use strict";

  return {
    addAuthHeader: function (oView) {
      let oAuthModel = oView.getModel("auth");
      let sToken = oAuthModel.getProperty("/token");

      return {
        Authorization: "Bearer " + sToken,
        "Content-Type": "application/json",
      };
    },

    fetchWithAuth: function (oComponent, sUrl, mOptions = {}) {
      let oAuthModel = oComponent.getModel("auth");
      let sToken = oAuthModel.getProperty("/token");
      mOptions.headers["Authorization"] = "Bearer " + sToken;
      mOptions.headers["Content-Type"] = "application/json";

      return fetch(sUrl, mOptions).then((response) => {
        if (response.status === 401) {
          oComponent.logout();
          throw new Error("Session expired. Please log in again.");
        }
        return response;
      });
    },
  };
});
