sap.ui.define(
  ["sap/ui/model/json/JSONModel"],

  function (JSONModel) {
    "use strict";

    return {
      _baseUrl: "https://localhost:7051/api/",

      loadProducts: function (
        oView,
        filterBy = "id",
        orderBy = "asc",
        page = 1,
        pageSize = 5
      ) {
        const oModel = new JSONModel();
        const url =
          this._baseUrl +
          "product/query?" +
          "filterBy=" +
          filterBy +
          "&orderBy=" +
          orderBy +
          "&page=" +
          page +
          "&pageSize=" +
          pageSize;

        oModel.loadData(url);
        oModel.attachRequestCompleted(() => {
          let oData = oModel.getData();
          if (oData && oData.items) {
            let oPaginationModel = new JSONModel({
              totalItems: oData.totalItems,
              totalPages: oData.totalPages,
              currentPage: oData.currentPage,
              pageSize: oData.pageSize,
              filterBy: filterBy,
              orderBy: orderBy,
            });
            oView.setModel(oPaginationModel, "pagination");

            let oProductsModel = new JSONModel(oData.items);
            oView.setModel(oProductsModel, "products");
          }
        });
        return oModel;
      },

      loadProductDetails: function (sProductId) {
        const oModel = new JSONModel();
        oModel.loadData(this._baseUrl + "product/" + sProductId);
        return oModel;
      },

      searchProducts: function (oView, sQuery) {
        const oModel = new JSONModel();
        oModel.loadData(
          this._baseUrl + "product/filter?filter=" + encodeURIComponent(sQuery)
        );

        oView.setModel(oModel, "products");

        let oPaginationModel = new JSONModel({
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          pageSize: 10,
          filterBy: "id",
          orderBy: "asc",
        });

        oView.setModel(oPaginationModel, "pagination");
      },

      createProduct: function (oNewProduct) {
        return fetch(this._baseUrl + "product", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(oNewProduct),
        }).then((response) => {
          if (!response.ok) {
            throw new Error("Erro ao criar produto");
          }
          return response.json();
        });
      },

      updateProduct: function (sProductId, oUpdatedProduct) {
        return fetch(this._baseUrl + "product/" + sProductId, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(oUpdatedProduct),
        }).then((response) => {
          if (!response.ok) {
            throw new Error("Erro ao atualizar produto");
          }
          return response;
        });
      },

      deleteProduct: function (sProductId) {
        return fetch(this._baseUrl + "product/" + sProductId, {
          method: "DELETE",
        }).then((response) => {
          if (!response.ok) {
            throw new Error("Erro ao deletar produto");
          }
          return response;
        });
      },
    };
  }
);
