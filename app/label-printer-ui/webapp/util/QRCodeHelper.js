sap.ui.define([], function () {
  "use strict";

  return {
    /**
     * Generates a base64 PNG data URL for a given string using QRCode.js
     * @param {string} text - Payload to encode in QR code
     * @param {number} [width=120] - Width in px
     * @param {number} [height=120] - Height in px
     * @returns {Promise<string>} Data URL string (data:image/png;base64,...)
     */
    generateDataUrl: function (text, width, height) {
      return new Promise(function (resolve) {
        width = width || 120;
        height = height || 120;

        function renderQr() {
          try {
            const tempDiv = document.createElement("div");
            tempDiv.style.position = "absolute";
            tempDiv.style.left = "-9999px";
            tempDiv.style.top = "-9999px";
            document.body.appendChild(tempDiv);

            new window.QRCode(tempDiv, {
              text: text,
              width: width,
              height: height,
              correctLevel: window.QRCode.CorrectLevel.M
            });

            // QRCode.js creates a canvas and an img element
            setTimeout(function () {
              try {
                const canvas = tempDiv.querySelector("canvas");
                const img = tempDiv.querySelector("img");
                let dataUrl = "";
                if (canvas && typeof canvas.toDataURL === "function") {
                  dataUrl = canvas.toDataURL("image/png");
                } else if (img && img.src) {
                  dataUrl = img.src;
                }
                if (tempDiv.parentNode) {
                  document.body.removeChild(tempDiv);
                }
                resolve(dataUrl);
              } catch (e) {
                if (tempDiv.parentNode) {
                  document.body.removeChild(tempDiv);
                }
                resolve("");
              }
            }, 40);
          } catch (err) {
            console.error("Error creating QR Code:", err);
            resolve("");
          }
        }

        // If QRCode is not yet loaded on window, dynamically inject it
        if (typeof window.QRCode === "undefined") {
          const sScriptUrl = sap.ui.require.toUrl("sample/print/label/util/qrcode.min.js");
          const oScript = document.createElement("script");
          oScript.src = sScriptUrl;
          oScript.onload = renderQr;
          oScript.onerror = function () {
            console.warn("Failed to load qrcode.min.js");
            resolve("");
          };
          document.head.appendChild(oScript);
        } else {
          renderQr();
        }
      });
    }
  };
});

