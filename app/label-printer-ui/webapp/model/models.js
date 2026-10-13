sap.ui.define([
  "sap/ui/model/json/JSONModel"
], function (JSONModel) {
  "use strict";

  return {
    createBatchModel: function () {
      return new JSONModel({
        batches: [
          {
            ID: "11111111-1111-1111-1111-111111111111",
            materialCode: "FG-1001",
            materialDesc: "Finished Goods - Red Widget",
            batchNo: "BT-001",
            plant: "1000",
            storageLoc: "0101",
            qty: 240,
            uom: "EA",
            opnameType: "CYCLE"
          },
          {
            ID: "22222222-2222-2222-2222-222222222222",
            materialCode: "FG-1002",
            materialDesc: "Finished Goods - Blue Widget",
            batchNo: "BT-002",
            plant: "1000",
            storageLoc: "0102",
            qty: 180,
            uom: "EA",
            opnameType: "CYCLE"
          },
          {
            ID: "33333333-3333-3333-3333-333333333333",
            materialCode: "RM-2001",
            materialDesc: "Raw Material - Steel Coil",
            batchNo: "BT-003",
            plant: "2000",
            storageLoc: "0201",
            qty: 950,
            uom: "KG",
            opnameType: "PHYSICAL"
          }
        ],
        selectedBatch: {
          ID: "11111111-1111-1111-1111-111111111111",
          materialCode: "FG-1001",
          materialDesc: "Finished Goods - Red Widget",
          batchNo: "BT-001",
          plant: "1000",
          storageLoc: "0101",
          qty: 240,
          uom: "EA",
          opnameType: "CYCLE"
        },
        cpclLog: "No print job yet.",
        qrCodeDataUrl: "",
        connectionState: "Disconnected",
        printerName: "HPRT HM-A300E (Not connected)",
        lastPrintAt: "-",
        shell: {
          appTitle: "Warehouse Label Manager",
          appSubtitle: "S/4HANA Style Fiori",
          userName: "Warehouse Operator",
          userRole: "Inventory Specialist",
          notifications: 2
        },
        settings: {
          defaultWarehouse: "1000",
          mockMode: true,
          autoReconnect: true
        }
      });
    }
  };
});
