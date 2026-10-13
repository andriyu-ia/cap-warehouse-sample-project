sap.ui.define([
  "sap/ui/core/UIComponent",
  "./model/models"
], function (UIComponent, models) {
  "use strict";

  return UIComponent.extend("sample.print.label.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);
      const oModel = models.createBatchModel();
      this.setModel(oModel);
      this.getRouter().initialize();
    }
  });
});
