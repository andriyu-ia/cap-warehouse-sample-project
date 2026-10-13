sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "../BluetoothManager",
  "../util/QRCodeHelper"
], function (Controller, MessageToast, BluetoothManager, QRCodeHelper) {
  "use strict";

  let oBluetoothManager;

  return Controller.extend("sample.print.label.controller.Base", {
    getRouter: function () {
      return this.getOwnerComponent().getRouter();
    },

    getModel: function () {
      return this.getOwnerComponent().getModel();
    },

    getBluetoothManager: function () {
      if (!oBluetoothManager) {
        oBluetoothManager = new BluetoothManager();
      }
      return oBluetoothManager;
    },

    findBatchById: function (sBatchId) {
      const aBatches = this.getModel().getProperty("/batches") || [];
      return aBatches.find(function (oBatch) {
        return oBatch.ID === sBatchId;
      });
    },

    formatConnectionState: function (sState) {
      if (sState === "Connected") {
        return "Success";
      }
      if (sState === "Connecting") {
        return "Information";
      }
      return "Warning";
    },

    formatOpnameTypeState: function (sType) {
      if (sType === "CYCLE") {
        return "Success";
      }
      if (sType === "PHYSICAL") {
        return "Information";
      }
      return "None";
    },

    onConnectPrinter: async function () {
      const oModel = this.getModel();
      const bMockMode = !!oModel.getProperty("/settings/mockMode");
      if (bMockMode) {
        oModel.setProperty("/connectionState", "Disconnected");
        MessageToast.show("Mock mode is enabled. Disable it in Settings to connect a real printer.");
        return;
      }
      oModel.setProperty("/connectionState", "Connecting");

      try {
        const oManager = this.getBluetoothManager();
        oManager.onDisconnected = function () {
          oModel.setProperty("/connectionState", "Disconnected");
          oModel.setProperty("/printerName", "HPRT HM-A300E (Not connected)");
          MessageToast.show("Printer disconnected.");
        };
        const oDevice = await oManager.connect();
        oModel.setProperty("/connectionState", "Connected");
        oModel.setProperty("/printerName", oDevice && oDevice.name ? oDevice.name : "HPRT HM-A300E");
        MessageToast.show("Printer connected.");
      } catch (err) {
        oModel.setProperty("/connectionState", "Disconnected");
        oModel.setProperty("/printerName", "HPRT HM-A300E (Not connected)");
        MessageToast.show("Connection failed: " + err.message);
      }
    },

    buildCpclPayload: function (oBatch) {
      const sMaterialText = (oBatch.materialDesc || oBatch.materialCode || "Unknown").replace(/\r?\n/g, " ");
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

      return [
        "! 0 200 200 180 1",
        `TEXT 4 0 30 30 ${sMaterialText}`,
        `TEXT 2 0 30 110 ${oBatch.materialCode}`,
        `TEXT 2 0 30 150 ${oBatch.batchNo}`,
        "B QR 30 180 M 2 U 5",
        sQrPayload,
        "ENDQR",
        `TEXT 2 0 30 260 ${oBatch.plant} / ${oBatch.storageLoc}`,
        `TEXT 2 0 30 300 ${oBatch.qty} ${oBatch.uom}`,
        "PRINT",
        ""
      ].join("\r\n");
    },

    buildStickerHtml: function (oBatch, sQrDataUrl) {
      const sMaterialDesc = (oBatch.materialDesc || "No Description").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const sMaterialCode = (oBatch.materialCode || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const sBatchNo = (oBatch.batchNo || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const sPlant = (oBatch.plant || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const sStorageLoc = (oBatch.storageLoc || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const sOpnameType = (oBatch.opnameType || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const sQty = oBatch.qty != null ? oBatch.qty : 0;
      const sUom = (oBatch.uom || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      return `
        <div class="thermalLabelSticker">
          <div class="labelHeaderStrip" style="display:flex;justify-content:space-between;align-items:center;">
            <span class="labelMetaBold">STOCK OPNAME LABEL</span>
            <span class="labelMetaType">${sOpnameType}</span>
          </div>
          <div class="labelDividerBold"></div>
          <div class="labelSection">
            <div class="labelSubCaption">MATERIAL DESCRIPTION:</div>
            <div class="labelMaterialTitle">${sMaterialDesc}</div>
          </div>
          <div class="labelDivider"></div>
          <div style="display:flex;justify-content:space-between;">
            <div style="width:50%;">
              <div class="labelSubCaption">MATERIAL CODE:</div>
              <div class="labelValueBold">${sMaterialCode}</div>
            </div>
            <div style="width:50%;">
              <div class="labelSubCaption">BATCH NO:</div>
              <div class="labelValueBold">${sBatchNo}</div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:6px;">
            <div style="width:50%;">
              <div class="labelSubCaption">PLANT / STORAGE LOC:</div>
              <div class="labelValue">${sPlant} / ${sStorageLoc}</div>
            </div>
            <div style="width:50%;">
              <div class="labelSubCaption">QUANTITY:</div>
              <div class="labelValueBold">${sQty} ${sUom}</div>
            </div>
          </div>
          <div class="labelDivider"></div>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div class="labelQrBox" style="text-align:center;">
              <img src="${sQrDataUrl}" width="110" height="110" style="display:block;" />
              <div class="labelMicroText" style="margin-top:4px;">* SCAN QR *</div>
            </div>
            <div style="margin-left:12px;width:100%;">
              <div class="labelMetaBold">2D CPCL MATRIX</div>
              <div class="labelMicroText">JSON Encoded Batch Verification</div>
              <div class="labelMicroText">Mat: ${sMaterialCode}</div>
              <div class="labelMicroText">Batch: ${sBatchNo}</div>
              <div class="labelMicroText">Qty: ${sQty} ${sUom}</div>
              <div class="labelMicroText">Loc: ${sPlant}-${sStorageLoc}</div>
            </div>
          </div>
          <div class="labelTearLine" style="text-align:center;">
            <span class="labelTearText">- - - - - - - - - - - TEAR LINE - - - - - - - - - - -</span>
          </div>
        </div>
      `;
    },

    mountStickerToPrintDom: function (oBatch, sQrDataUrl) {
      let oMount = document.getElementById("print-mount-point");
      if (!oMount) {
        oMount = document.createElement("div");
        oMount.id = "print-mount-point";
        document.body.appendChild(oMount);
      }
      oMount.innerHTML = this.buildStickerHtml(oBatch, sQrDataUrl);
    },

    printBatchViaBluetooth: async function (oBatch) {
      const oModel = this.getModel();
      const bMockMode = !!oModel.getProperty("/settings/mockMode");

      if (!oBatch) {
        MessageToast.show("Please select a batch before printing.");
        return;
      }

      const sCpclPayload = this.buildCpclPayload(oBatch);
      let oResult;

      if (bMockMode) {
        oResult = {
          mode: "mock",
          payload: this.getBluetoothManager().getMockPreview(sCpclPayload),
          log: ["Mock mode is enabled by application settings."]
        };
      } else {
        try {
          oResult = await this.getBluetoothManager().sendCpcl(sCpclPayload);
        } catch (err) {
          oResult = {
            mode: "mock",
            payload: this.getBluetoothManager().getMockPreview(sCpclPayload),
            log: [err.message]
          };
        }
      }

      oModel.setProperty("/cpclLog", oResult.payload);
      oModel.setProperty("/lastPrintAt", new Date().toLocaleString());
      MessageToast.show(oResult.mode === "bluetooth" ? "Label sent to printer." : "Preview mode active. Printer not connected.");
    },

    printBatchViaBrowser: async function (oBatch) {
      if (!oBatch) {
        MessageToast.show("Please select a batch before printing.");
        return;
      }

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
        this.mountStickerToPrintDom(oBatch, sDataUrl);

        window.setTimeout(function () {
          window.print();
        }, 120);
      } catch (err) {
        MessageToast.show("Gagal memproses QR code label.");
      }
    },

    onPrint: async function () {
      const oBatch = this.getModel().getProperty("/selectedBatch");
      await this.printBatchViaBluetooth(oBatch);
    }
  });
});
