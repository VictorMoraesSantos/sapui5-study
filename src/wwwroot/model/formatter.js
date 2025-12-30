sap.ui.define([], function () {
  "use strict";

  return {
    formatDate: function (sDate) {
      if (!sDate) return "";
      var oDate = new Date(sDate);

      return oDate.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  };
});
