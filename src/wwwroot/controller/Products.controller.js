sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "Api/model/ProductsService",
  ],
  function (Controller, JSONModel, MessageToast, Fragment, ProductsService) {
    "use strict";

    return Controller.extend("Api.controller.Products", {
      onInit: function () {
        this._initializeModels();

        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter
          .getRoute("products")
          .attachPatternMatched(this._onRouteMatched, this);
      },

      _initializeModels: function () {
        const oProductsModel = new JSONModel([]);
        this.getView().setModel(oProductsModel, "products");

        const oPaginationModel = new JSONModel({
          totalItems: 0,
          totalPages: 1,
          currentPage: 1,
          pageSize: null,
          filterBy: null,
          orderBy: null,
          filterContains: "",
        });
        this.getView().setModel(oPaginationModel, "pagination");
      },

      _onRouteMatched: function () {
        this._loadProducts();
        sap.m.MessageToast.show("Produtos carregados com sucesso");
      },

      _updateModels: function (oData) {
        const oProductsModel = this.getView().getModel("products");
        oProductsModel.setData(oData.items || []);

        const oPaginationModel = this.getView().getModel("pagination");
        oPaginationModel.setProperty("/totalItems", oData.totalItems);
        oPaginationModel.setProperty("/totalPages", oData.totalPages);
        oPaginationModel.setProperty("/currentPage", oData.currentPage);
        oPaginationModel.setProperty("/pageSize", oData.pageSize);
      },

      _loadProducts: function () {
        let oPaginationModel = this.getView().getModel("pagination");
        let oParams = oPaginationModel.getData();

        ProductsService.getProducts(
          oParams.filterBy,
          oParams.orderBy,
          oParams.currentPage,
          oParams.pageSize,
          oParams.filterContains
        )
          .then((oData) => {
            this._updateModels(oData);
            MessageToast.show("Produtos carregados com sucesso");
          })
          .catch((oError) => {
            MessageToast.show("Erro ao carregar produtos: " + oError.message);
          });
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

        this._openCreateDialog();
      },

      _openCreateDialog: function () {
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
        const oModel = this.getView().getModel("product");
        const oNewProduct = oModel.getData();

        ProductsService.createProduct(oNewProduct).then(() => {
          MessageToast.show("Produto criado com sucesso");
          this._loadProducts();
          this._closeCreateDialog();
        });
      },

      _closeCreateDialog: function () {
        this._pCreateDialog.then((oDialog) => {
          oDialog.close();
        });
      },

      onCancelCreate: function () {
        this._closeCreateDialog();
      },

      onSearchProducts: function (oEvent) {
        const sQuery = oEvent.getSource().getValue();
        const oPaginationModel = this.getView().getModel("pagination");
        oPaginationModel.setProperty("/filterContains", sQuery);
        oPaginationModel.setProperty("/currentPage", 1);
        this._loadProducts();
      },

      onSearchReset: function () {
        let oInput = this.byId("searchField");
        oInput.setValue("");
        const oPaginationModel = this.getView().getModel("pagination");
        oPaginationModel.setProperty("/filterContains", "");
        oPaginationModel.setProperty("/currentPage", 1);
        this._loadProducts();
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
