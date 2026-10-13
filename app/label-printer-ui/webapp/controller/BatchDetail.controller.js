sap.ui.define([
  "./Base.controller"
], function (BaseController) {
  "use strict";

  return BaseController.extend("sample.print.label.controller.BatchDetail", {
    onInit: function () {
      this.getRouter().getRoute("batchDetail").attachPatternMatched(this._onRouteMatched, this);
    },

    _onRouteMatched: function (oEvent) {
      const sBatchId = oEvent.getParameter("arguments").batchId;
      const oBatch = this.findBatchById(sBatchId);
      if (oBatch) {
        this.getModel().setProperty("/selectedBatch", oBatch);
      }
    },

    onNavBack: function () {
      this.getRouter().navTo("batchList");
    },

    onGoPreview: function () {
      const oBatch = this.getModel().getProperty("/selectedBatch");
      if (!oBatch) {
        return;
      }
      this.getModel().setProperty("/cpclLog", this.buildCpclPayload(oBatch));
      this.getRouter().navTo("printPreview");
    }
  });
});
