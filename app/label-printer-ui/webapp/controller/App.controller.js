sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/ActionSheet",
  "sap/m/Button",
  "sap/m/Dialog",
  "sap/m/Label",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/Switch",
  "sap/m/VBox",
  "sap/m/MessageToast"
], function (Controller, ActionSheet, Button, Dialog, Label, Select, Item, Switch, VBox, MessageToast) {
  "use strict";

  return Controller.extend("sample.print.label.controller.App", {
    onInit: function () {
      this._oUserActionSheet = null;
      this._oSettingsDialog = null;
      this._oWarehouseSelect = null;
      this._oMockSwitch = null;
      this._oAutoReconnectSwitch = null;
    },

    onUserMenuPress: function (oEvent) {
      if (!this._oUserActionSheet) {
        this._oUserActionSheet = new ActionSheet({
          buttons: [
            new Button({
              text: "My Profile",
              type: "Transparent",
              press: function () {
                MessageToast.show("User: " + this.getView().getModel().getProperty("/shell/userName"));
              }.bind(this)
            }),
            new Button({
              text: "Settings",
              type: "Transparent",
              press: function () {
                this.onOpenSettingsPress();
              }.bind(this)
            }),
            new Button({
              text: "Sign Out",
              type: "Transparent",
              press: function () {
                MessageToast.show("Sign-out is not enabled in this local scaffold.");
              }
            })
          ]
        });
        this.getView().addDependent(this._oUserActionSheet);
      }

      this._oUserActionSheet.openBy(oEvent.getSource());
    },

    onNotificationsPress: function () {
      const iCount = this.getView().getModel().getProperty("/shell/notifications");
      MessageToast.show("You have " + iCount + " pending warehouse notifications.");
    },

    onOpenSettingsPress: function () {
      const oModel = this.getView().getModel();
      if (!this._oSettingsDialog) {
        this._oWarehouseSelect = new Select({
          selectedKey: oModel.getProperty("/settings/defaultWarehouse"),
          items: [
            new Item({ key: "1000", text: "1000 - Main Plant" }),
            new Item({ key: "2000", text: "2000 - Secondary Plant" })
          ]
        });

        this._oMockSwitch = new Switch({
          state: !!oModel.getProperty("/settings/mockMode")
        });

        this._oAutoReconnectSwitch = new Switch({
          state: !!oModel.getProperty("/settings/autoReconnect")
        });

        this._oSettingsDialog = new Dialog({
          title: "Application Settings",
          contentWidth: "24rem",
          content: [
            new VBox({
              class: "sapUiSmallMargin",
              items: [
                new Label({ text: "Default Warehouse" }),
                this._oWarehouseSelect,
                new Label({ text: "Mock Print Mode", class: "sapUiSmallMarginTop" }),
                this._oMockSwitch,
                new Label({ text: "Auto Reconnect Printer", class: "sapUiSmallMarginTop" }),
                this._oAutoReconnectSwitch
              ]
            })
          ],
          beginButton: new Button({
            text: "Save",
            type: "Emphasized",
            press: function () {
              oModel.setProperty("/settings/defaultWarehouse", this._oWarehouseSelect.getSelectedKey());
              oModel.setProperty("/settings/mockMode", this._oMockSwitch.getState());
              oModel.setProperty("/settings/autoReconnect", this._oAutoReconnectSwitch.getState());
              this._oSettingsDialog.close();
              MessageToast.show("Settings saved.");
            }.bind(this)
          }),
          endButton: new Button({
            text: "Cancel",
            press: function () {
              this._oWarehouseSelect.setSelectedKey(oModel.getProperty("/settings/defaultWarehouse"));
              this._oMockSwitch.setState(!!oModel.getProperty("/settings/mockMode"));
              this._oAutoReconnectSwitch.setState(!!oModel.getProperty("/settings/autoReconnect"));
              this._oSettingsDialog.close();
            }.bind(this)
          })
        });
        this.getView().addDependent(this._oSettingsDialog);
      }

      this._oWarehouseSelect.setSelectedKey(oModel.getProperty("/settings/defaultWarehouse"));
      this._oMockSwitch.setState(!!oModel.getProperty("/settings/mockMode"));
      this._oAutoReconnectSwitch.setState(!!oModel.getProperty("/settings/autoReconnect"));
      this._oSettingsDialog.open();
    }
  });
});
