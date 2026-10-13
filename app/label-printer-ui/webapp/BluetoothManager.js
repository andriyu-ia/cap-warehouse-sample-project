sap.ui.define([], function () {
  "use strict";

  // Common BLE service UUIDs used by thermal printers (Nordic UART, ISSC, Zebra, Generic Print)
  const KNOWN_PRINTER_SERVICES = [
    "6e400001-b5a3-f393-e0a9-e50e24dcca9e", // Nordic UART Service
    "49535343-fe7d-4ae5-8fa9-9fafd205e455", // ISSC Transparent UART
    "000018f0-0000-1000-8000-00805f9b34fb", // 0x18F0 Standard Print Service
    "0000ff00-0000-1000-8000-00805f9b34fb", // 0xFF00 Custom Printer Service
    "0000fee7-0000-1000-8000-00805f9b34fb", // 0xFEE7 Custom Service
    "e7810a71-73ae-499d-8c15-faa9aef0c3f2", // Zebra / CPCL UART
    "0000ae30-0000-1000-8000-00805f9b34fb", // 0xAE30
    "0000af30-0000-1000-8000-00805f9b34fb"  // 0xAF30
  ];

  return class BluetoothManager {
    constructor() {
      this.device = null;
      this.characteristic = null;
      this.connectionState = "disconnected";
      this.log = [];
      this.onDisconnected = null;
    }

    async connect() {
      if (!navigator.bluetooth) {
        throw new Error("Web Bluetooth API is not supported in this browser (Ensure Chrome on Android over HTTPS or localhost)");
      }

      this.log.push("Requesting Bluetooth device...");

      // acceptAllDevices: true allows scanning any BLE device regardless of advertised service
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: KNOWN_PRINTER_SERVICES
      });

      this.connectionState = "connecting";
      this.log.push(`Device selected: ${this.device.name || "Unknown device"}`);

      // Listen for unexpected disconnections
      this.device.addEventListener("gattserverdisconnected", () => {
        this.connectionState = "disconnected";
        this.characteristic = null;
        this.log.push("Device disconnected");
        if (typeof this.onDisconnected === "function") {
          this.onDisconnected();
        }
      });

      const server = await this.device.gatt.connect();
      this.log.push("Connected to GATT server");

      // Discover available printer service & writable characteristic
      this.characteristic = await this._findWritableCharacteristic(server);

      if (!this.characteristic) {
        throw new Error("No writable print characteristic found on this device");
      }

      this.connectionState = "connected";
      this.log.push(`Ready to print: ${this.device.name || "Printer"}`);

      return this.device;
    }

    async _findWritableCharacteristic(server) {
      // 1. Try finding services via getPrimaryServices()
      try {
        const services = await server.getPrimaryServices();
        for (const service of services) {
          const chars = await service.getCharacteristics();
          const writeChar = chars.find(
            (c) => c.properties.write || c.properties.writeWithoutResponse
          );
          if (writeChar) {
            this.log.push(`Found writable characteristic in service: ${service.uuid}`);
            return writeChar;
          }
        }
      } catch (e) {
        // Fall back to trying known printer services individually
      }

      // 2. Fallback: try known printer service UUIDs directly
      for (const sUuid of KNOWN_PRINTER_SERVICES) {
        try {
          const service = await server.getPrimaryService(sUuid);
          const chars = await service.getCharacteristics();
          const writeChar = chars.find(
            (c) => c.properties.write || c.properties.writeWithoutResponse
          );
          if (writeChar) {
            this.log.push(`Found writable characteristic via known UUID: ${sUuid}`);
            return writeChar;
          }
        } catch (err) {
          // Service not available on this device, check next
        }
      }

      return null;
    }

    async sendCpcl(cpclPayload) {
      if (!this.characteristic) {
        const preview = this.getMockPreview(cpclPayload);
        this.log.push("Mock mode: no Bluetooth printer connected");
        return {
          mode: "mock",
          payload: preview,
          log: this.log
        };
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(cpclPayload);

      // Chunk data into 100-byte pieces to avoid BLE MTU overflow on thermal printers
      const CHUNK_SIZE = 100;
      for (let i = 0; i < data.length; i += CHUNK_SIZE) {
        const chunk = data.slice(i, i + CHUNK_SIZE);
        if (this.characteristic.writeValueWithoutResponse && this.characteristic.properties.writeWithoutResponse) {
          await this.characteristic.writeValueWithoutResponse(chunk);
        } else {
          await this.characteristic.writeValue(chunk);
        }
        // Small delay between chunks to allow the printer's serial buffer to process
        await new Promise((resolve) => setTimeout(resolve, 25));
      }

      this.log.push("CPCL payload sent via Bluetooth");

      return {
        mode: "bluetooth",
        payload: cpclPayload,
        log: this.log
      };
    }

    disconnect() {
      if (this.device && this.device.gatt && this.device.gatt.connected) {
        this.device.gatt.disconnect();
      }
      this.connectionState = "disconnected";
      this.characteristic = null;
    }

    getMockPreview(cpclPayload) {
      return cpclPayload.replace(/\r\n/g, "\n");
    }
  };
});
