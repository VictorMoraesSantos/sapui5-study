sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "Api/model/productModels",
  ],
  function (Controller, JSONModel, MessageToast, Fragment, productModels) {
    "use strict";

    return Controller.extend("Api.controller.Products", {
      onInit: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter
          .getRoute("products")
          .attachPatternMatched(this._onRouteMatched, this);

        let oPaginationModel = new JSONModel({
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
          pageSize: 5,
          filterBy: "id",
          orderBy: "asc",
        });
        this.getView().setModel(oPaginationModel, "pagination");
      },

      _onRouteMatched: function () {
        this._loadProducts();
        sap.m.MessageToast.show("Produtos carregados com sucesso");
      },

      _loadProducts: function () {
        let oPaginationModel = this.getView().getModel("pagination");
        productModels.loadProducts(
          this.getView(),
          oPaginationModel.getProperty("/filterBy"),
          oPaginationModel.getProperty("/orderBy"),
          oPaginationModel.getProperty("/currentPage"),
          oPaginationModel.getProperty("/pageSize")
        );
      },

      onNavBack: function () {
        let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("home");
      },

      onProductDetail: function (oEvent) {
        let oItem = oEvent.getSource();
        let oCtx = oItem.getBindingContext("products");
        let sProductId = oCtx.getProperty("id");
        let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("productDetails", { id: sProductId });
      },

      onCreateProduct: function () {
        let oNewProductModel = new JSONModel({
          title: "",
          description: "",
          price: 0,
        });

        this.getView().setModel(oNewProductModel, "product");

        if (!this._pCreateDialog) {
          this._pCreateDialog = Fragment.load({
            id: this.getView().getId(),
            name: "Api.fragment.CreateProductDialog",
            controller: this,
          }).then((oDialog) => {
            this.getView().addDependent(oDialog);
            return oDialog;
          });
        }
        this._pCreateDialog.then((oDialog) => {
          oDialog.open();
        });
      },

      onSaveCreate: function () {
        let oModel = this.getView().getModel("product");
        let oNewProduct = oModel.getData();
        productModels.createProduct(oNewProduct).then(() => {
          productModels.loadProducts(this.getView());
          MessageToast.show("Produto criado com sucesso");
          this._pCreateDialog.then((oDialog) => {
            oDialog.close();
          });
        });
      },

      onCancelCreate: function () {
        this._pCreateDialog.then((oDialog) => {
          oDialog.close();
        });
      },

      onSearchProducts: function (oEvent) {
        let sQuery = oEvent.getSource().getValue();

        if (!sQuery || sQuery.trim() === "") {
          productModels.loadProducts(this.getView());
          return;
        }

        productModels.searchProducts(this.getView(), sQuery);
        MessageToast.show("Buscando produtos...");
      },

      onSearchReset: function () {
        var oInput = this.byId("searchField");
        oInput.setValue("");
        productModels.loadProducts(this.getView());
      },

      onFirstPage: function () {
        let oPaginationModel = this.getView().getModel("pagination");
        oPaginationModel.setProperty("/currentPage", 1);
        this._loadProducts();
      },

      onPreviousPage: function () {
        let oPaginationModel = this.getView().getModel("pagination");
        let iCurrentPage = oPaginationModel.getProperty("/currentPage");
        if (iCurrentPage > 1) {
          oPaginationModel.setProperty("/currentPage", iCurrentPage - 1);
          this._loadProducts();
        }
      },

      onNextPage: function () {
        let oPaginationModel = this.getView().getModel("pagination");
        let iCurrentPage = oPaginationModel.getProperty("/currentPage");
        let iTotalPages = oPaginationModel.getProperty("/totalPages");
        if (iCurrentPage < iTotalPages) {
          oPaginationModel.setProperty("/currentPage", iCurrentPage + 1);
          this._loadProducts();
        }
      },

      onLastPage: function () {
        let oPaginationModel = this.getView().getModel("pagination");
        let iTotalPages = oPaginationModel.getProperty("/totalPages");
        oPaginationModel.setProperty("/currentPage", iTotalPages);
        let oData = oPaginationModel.getData();
        this._loadProducts();
      },

      onSortChange: function (oEvent) {
        let sSelectedKey = oEvent.getParameter("selectedItem").getKey();
        let oPaginationModel = this.getView().getModel("pagination");
        oPaginationModel.setProperty("/filterBy", sSelectedKey);
        oPaginationModel.setProperty("/currentPage", 1);
        this._loadProducts();
      },

      onOrderChange: function (oEvent) {
        let sSelectedKey = oEvent.getParameter("selectedItem").getKey();
        let oPaginationModel = this.getView().getModel("pagination");
        oPaginationModel.setProperty("/currentPage", 1);
        oPaginationModel.setProperty("/orderBy", sSelectedKey);
        this._loadProducts();
      },

      onPageSizeChange: function (oEvent) {
        let sSelectedKey = oEvent.getParameter("selectedItem").getKey();
        let oPaginationModel = this.getView().getModel("pagination");
        oPaginationModel.setProperty("/pageSize", parseInt(sSelectedKey));
        oPaginationModel.setProperty("/currentPage", 1);
        this._loadProducts();
      },
    });
  }
);
