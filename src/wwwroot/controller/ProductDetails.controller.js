sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "Api/model/formatter",
    "Api/model/productModels",
  ],
  function (
    Controller,
    JSONModel,
    MessageToast,
    Fragment,
    formatter,
    productModels
  ) {
    "use strict";

    return Controller.extend("Api.controller.ProductDetails", {
      formatter: formatter,

      onInit: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter
          .getRoute("productDetails")
          .attachPatternMatched(this._loadProductDetails, this);
      },

      _loadProductDetails: function (oEvent) {
        const sProductId = oEvent.getParameter("arguments").id;
        const oModel = productModels.loadProductDetails(sProductId);
        oModel.attachRequestCompleted((oEvent) => {
          if (oEvent.getParameter("success")) {
            MessageToast.show("Produto carregado com sucesso");
          } else {
            MessageToast.show("Erro ao carregar produto");
          }
        });

        this.getView().setModel(oModel, "product");
      },

      onEdit: function () {
        let oModel = this.getView().getModel("product");
        this._originalData = JSON.parse(JSON.stringify(oModel.getData()));

        this._onOpenEditDialog();
      },

      onDelete: function () {
        let oModel = this.getView().getModel("product");
        let oData = oModel.getData();
        let oConfirmModel = new JSONModel({
          confirmMessage:
            "Tem certeza que deseja excluir o produto '" + oData.title + "'?",
        });

        this.getView().setModel(oConfirmModel, "confirm");
        this._onOpenConfirmDialog();
      },

      onConfirm: function () {
        let oModel = this.getView().getModel("product");
        let oData = oModel.getData();
        let sProductId = oData.id;

        productModels
          .deleteProduct(sProductId)
          .then((response) => {
            if (response.ok) {
              MessageToast.show("Produto deletado com sucesso!");
              this._closeConfirmDialog();
              this.onNavBack();
            }
          })
          .catch(() => {
            MessageToast.show("Erro ao deletar produto");
            this._closeConfirmDialog();
          });
      },

      onCancel: function () {
        this._closeConfirmDialog();
      },

      onSaveEdit: function () {
        let oModel = this.getView().getModel("product");
        let oData = oModel.getData();
        let sProductId = oData.id;

        productModels
          .updateProduct(sProductId, oData)
          .then((response) => {
            if (response.ok) {
              MessageToast.show("Produto atualizado com sucesso!");
              this._originalData = null;
              this._onCloseEditDialog();
            }
          })
          .catch(() => {
            MessageToast.show("Erro ao atualizar produto");
          });
      },

      onCancelEdit: function () {
        if (this._originalData) {
          let oModel = this.getView().getModel("product");
          oModel.setData(this._originalData);
          this._originalData = null;
        }

        this._onCloseEditDialog();
      },

      onNavBack: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("products");
      },

      _onOpenEditDialog: function () {
        if (!this._pEditDialog) {
          this._pEditDialog = Fragment.load({
            id: this.getView().getId(),
            name: "Api.fragment.EditProductDialog",
            controller: this,
          }).then((oDialog) => {
            this.getView().addDependent(oDialog);
            return oDialog;
          });
        }
        this._pEditDialog.then((oDialog) => {
          oDialog.open();
        });
      },

      _onCloseEditDialog: function () {
        this._pEditDialog.then((oDialog) => {
          oDialog.close();
        });
      },

      _onOpenConfirmDialog: function () {
        if (!this._pConfirmDialog) {
          this._pConfirmDialog = Fragment.load({
            id: this.getView().getId(),
            name: "Api.fragment.ConfirmProductDialog",
            controller: this,
          }).then((oDialog) => {
            this.getView().addDependent(oDialog);
            return oDialog;
          });
        }
        this._pConfirmDialog.then((oDialog) => {
          oDialog.open();
        });
      },

      _closeConfirmDialog: function () {
        this._pConfirmDialog.then((oDialog) => {
          oDialog.close();
        });
      },
    });
  }
);
