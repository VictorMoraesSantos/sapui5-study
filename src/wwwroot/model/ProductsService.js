sap.ui.define(
  [],

  function () {
    "use strict";

    return {
      _baseUrl: "https://localhost:7051/api/products/",

      _getAuthHeaders: function () {
        const sToken = localStorage.getItem("authToken");
        return {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sToken,
        };
      },

      getProducts: function (
        filterBy,
        orderBy,
        page,
        pageSize,
        filterContains
      ) {
        const params = new URLSearchParams({
          filterBy: filterBy || "id",
          orderBy: orderBy || "asc",
          page: page || 1,
          pageSize: pageSize || 5,
        });

        if (filterContains && filterContains.trim() !== "") {
          params.append("filterContains", filterContains);
        }

        return fetch(this._baseUrl + "query?" + params.toString(), {
          method: "GET",
          headers: this._getAuthHeaders(),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("HTTP error! status: " + response.status);
            }
            return response.json();
          })
          .catch((error) => {
            throw new Error("HTTP error! status: " + error.status);
          });
      },

      getProductById: function (sProductId) {
        return fetch(this._baseUrl + sProductId, {
          method: "GET",
          headers: this._getAuthHeaders(),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("HTTP error! status: " + response.status);
            }
            return response.json();
          })
          .catch((error) => {
            throw new Error("HTTP error! status: " + error.status);
          });
      },

      createProduct: function (oProductData) {
        return fetch(this._baseUrl, {
          method: "POST",
          headers: this._getAuthHeaders(),
          body: JSON.stringify(oProductData),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("HTTP error! status: " + response.status);
            }
            return response.json();
          })
          .catch((error) => {
            throw new Error("HTTP error! status: " + error.status);
          });
      },

      updateProduct: function (sProductId, oProduct) {
        return fetch(this._baseUrl + sProductId, {
          method: "PUT",
          headers: this._getAuthHeaders(),
          body: JSON.stringify(oProduct),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("HTTP error! status: " + response.status);
            }
            return response.json();
          })
          .catch((error) => {
            throw new Error("HTTP error! status: " + error.status);
          });
      },

      deleteProduct: function (sProductId) {
        return fetch(this._baseUrl + "product/" + sProductId, {
          method: "DELETE",
          headers: this._getAuthHeaders(),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("HTTP error! status: " + response.status);
            }
            return response.json();
          })
          .catch((error) => {
            throw new Error("HTTP error! status: " + error.status);
          });
      },
    };
  }
);
