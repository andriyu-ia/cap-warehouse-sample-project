sap.ui.define([
  "./Base.controller",
  "sap/m/ActionSheet",
  "sap/m/Button"
], function (BaseController, ActionSheet, Button) {
  "use strict";

  return BaseController.extend("sample.print.label.controller.BatchList", {
    onInit: function () {
      const oModel = this.getModel();
      if (!oModel.getProperty("/selectedBatch")) {
        oModel.setProperty("/selectedBatch", oModel.getProperty("/batches/0"));
      }
      this._oRowActionSheet = null;
    },

    onOpenBatch: function (oEvent) {
      const oContext = oEvent.getSource().getBindingContext();
      const oBatch = oContext.getObject();
      this.getModel().setProperty("/selectedBatch", oBatch);
      this.getRouter().navTo("batchDetail", { batchId: oBatch.ID });
    },

    onRowPrint: function (oEvent) {
      const oContext = oEvent.getSource().getBindingContext();
      const oBatch = oContext.getObject();
      this.getModel().setProperty("/selectedBatch", oBatch);

      if (!this._oRowActionSheet) {
        this._oRowActionSheet = new ActionSheet({
          title: "Pilih Metode Cetak",
          buttons: [
            new Button({
              icon: "sap-icon://paper-plane",
              text: "Print Bluetooth (HPRT CPCL)",
              press: function () {
                const b = this.getModel().getProperty("/selectedBatch");
                this.printBatchViaBluetooth(b);
              }.bind(this)
            }),
            new Button({
              icon: "sap-icon://print",
              text: "Print Kabel / Browser (PDF)",
              press: function () {
                const b = this.getModel().getProperty("/selectedBatch");
                this.printBatchViaBrowser(b);
              }.bind(this)
            }),
            new Button({
              icon: "sap-icon://document-text",
              text: "Lihat Preview Label",
              press: function () {
                this.onPrintPreview();
              }.bind(this)
            })
          ]
        });
        this.getView().addDependent(this._oRowActionSheet);
      }

      this._oRowActionSheet.openBy(oEvent.getSource());
    },

    onPrintPreview: function () {
      const oBatch = this.getModel().getProperty("/selectedBatch");
      if (!oBatch) {
        return;
      }
      this.getModel().setProperty("/cpclLog", this.buildCpclPayload(oBatch));
      this.getRouter().navTo("printPreview");
    }
  });
});
