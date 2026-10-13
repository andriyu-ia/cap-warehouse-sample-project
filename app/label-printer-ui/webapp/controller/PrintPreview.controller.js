sap.ui.define([
  "./Base.controller",
  "../util/QRCodeHelper",
  "sap/m/MessageToast"
], function (BaseController, QRCodeHelper, MessageToast) {
  "use strict";

  return BaseController.extend("sample.print.label.controller.PrintPreview", {
    onInit: function () {
      this.getRouter().getRoute("printPreview").attachPatternMatched(this._onRouteMatched, this);

      // Listen for browser print trigger (e.g. Ctrl + P or menu print)
      if (typeof window !== "undefined") {
        this._fnBeforePrint = this._preparePrintDom.bind(this);
        window.addEventListener("beforeprint", this._fnBeforePrint);
      }
    },

    _onRouteMatched: async function () {
      const oModel = this.getModel();
      const oBatch = oModel.getProperty("/selectedBatch");
      if (oBatch) {
        oModel.setProperty("/cpclLog", this.buildCpclPayload(oBatch));

        // Format exact same JSON payload as CPCL B QR command
        const sQrPayload = JSON.stringify({
          materialCode: oBatch.materialCode,
          materialDesc: oBatch.materialDesc,
          batchNo: oBatch.batchNo,
          plant: oBatch.plant,
          storageLoc: oBatch.storageLoc,
          qty: oBatch.qty,
          uom: oBatch.uom,
          opnameType: oBatch.opnameType
        });

        try {
          const sDataUrl = await QRCodeHelper.generateDataUrl(sQrPayload, 110, 110);
          oModel.setProperty("/qrCodeDataUrl", sDataUrl);
        } catch (err) {
          console.error("Failed to generate QR code data URL:", err);
        }
      }
    },

    _preparePrintDom: function () {
      const oSticker = document.querySelector(".thermalLabelSticker");
      if (!oSticker) {
        return;
      }

      let oMount = document.getElementById("print-mount-point");
      if (!oMount) {
        oMount = document.createElement("div");
        oMount.id = "print-mount-point";
        document.body.appendChild(oMount);
      }

      oMount.innerHTML = "";
      const oClone = oSticker.cloneNode(true);
      oMount.appendChild(oClone);
    },

    onBrowserPrint: function () {
      const oBatch = this.getModel().getProperty("/selectedBatch");
      this.printBatchViaBrowser(oBatch);
    },

    onCopyCpcl: function () {
      const sCpcl = this.getModel().getProperty("/cpclLog");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sCpcl).then(function () {
          MessageToast.show("Kode CPCL berhasil disalin ke clipboard.");
        }).catch(function () {
          MessageToast.show("Gagal menyalin kode.");
        });
      } else {
        MessageToast.show("Clipboard API tidak didukung di browser ini.");
      }
    },

    onNavBack: function () {
      const oBatch = this.getModel().getProperty("/selectedBatch");
      if (oBatch && oBatch.ID) {
        this.getRouter().navTo("batchDetail", { batchId: oBatch.ID });
      } else {
        this.getRouter().navTo("batchList");
      }
    }
  });
});
