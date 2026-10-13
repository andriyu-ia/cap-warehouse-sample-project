# Walkthrough: Warehouse Label Printing Project

This project is a minimal but reproducible SAP BTP CAP + SAPUI5 monorepo for a mobile warehouse label-printing flow. It is designed to be built incrementally and reviewed later without losing context.

## 1. Environment Setup

### Prerequisites
- Node.js 18+ recommended
- npm
- SAP Business Technology Platform (BTP) CLI tools
- A browser that supports Web Bluetooth (Chrome/Edge on Android or secure localhost)

### Validation Commands
```bash
node -v
npm -v
```

If the SAP CAP tools are not yet installed globally:
```bash
npm install -g @sap/cds-dk
```

### Files Created
- `package.json`
- `README.md`
- `plan.md`

### Why
These files establish the base project metadata and documentation for the CAP-based label-printing workflow.

---

## 2. CAP Project Initialization

### Command Sequence
```bash
cd "C:\Users\LENOVO\Documents\Projects\Arisa\Sample - Print Label"
cds init
```

### Common Pitfalls
- Ensure you run the command inside the project directory.
- If the system cannot find `cds`, use the global installation command above.

### Files Typically Created by `cds init`
- `package.json`
- `db/`
- `srv/`
- `app/`
- `mta.yaml`

This project uses a manual scaffold to keep the structure aligned with the plan and to allow easier revision of the print logic.

---

## 3. Database and CDS Model

### Files Created or Modified
- `db/schema.cds`
- `db/data/my.company-StockBatches.csv`

### Example Command
```bash
cd "C:\Users\LENOVO\Documents\Projects\Arisa\Sample - Print Label"
```

### Model Content
The `StockBatches` entity includes:
- `ID`
- `materialCode`
- `materialDesc`
- `batchNo`
- `plant`
- `storageLoc`
- `qty`
- `uom`
- `opnameType`

### Why This Matters
This structure matches the use case for warehouse stock opname and label creation. It can later be swapped to S/4HANA-backed OData without affecting the print module.

---

## 4. Service Layer and CPCL Payload Generation

### Files Created or Modified
- `srv/print-service.cds`
- `srv/print-service.js`

### Example Command
```bash
cd "C:\Users\LENOVO\Documents\Projects\Arisa\Sample - Print Label"
```

### CAP Service Pattern
The service exposes:
- OData entity `StockBatches`
- Custom action `generateCpclPayload(batchId)`

The JS implementation creates a CPCL string that includes:
- label header
- material line
- QR payload line
- print command
- CRLF separators for compatibility with the printer

### CPCL Pattern
```text
! 0 200 200 180 1
TEXT 4 0 30 30 Finished Goods - Red Widget
B QR 30 180 M 2 U 5
{...json payload...}
ENDQR
PRINT
```

### Important Notes
- Do not print directly from the backend.
- The backend only prepares the payload.
- The frontend is responsible for Bluetooth output.

---

## 5. SAPUI5 Frontend Setup

### Files Created or Modified
- `app/label-printer-ui/webapp/manifest.json`
- `app/label-printer-ui/webapp/Component.js`
- `app/label-printer-ui/webapp/controller/App.controller.js`
- `app/label-printer-ui/webapp/view/App.view.xml`
- `app/label-printer-ui/webapp/BluetoothManager.js`
- `app/label-printer-ui/webapp/index.html`

### Example Command
```bash
cd "C:\Users\LENOVO\Documents\Projects\Arisa\Sample - Print Label"
```

### Frontend Responsibilities
- Show a list of batches
- Let users select a label to print
- Trigger a CPCL print job
- Support Bluetooth or mock preview mode
- Provide Fiori shell-level actions (notifications, settings, user menu)
- Support routed enterprise flow (Batch List -> Batch Detail -> Print Preview)

### Bluetooth Flow
The UI uses a modular `BluetoothManager` with a `sendCpcl` method. If the browser does not expose Web Bluetooth or no device is selected, it falls back to a preview representation for local testing.

### Fiori Shell and Settings Flow
- Root shell is implemented in `App.view.xml` using `sap.f.ShellBar`.
- The shell includes:
  - notifications action
  - settings action
  - user action menu
- Settings dialog controls:
  - default warehouse
  - mock print mode
  - auto reconnect preference
- In mock mode, print execution always generates preview output without opening Bluetooth connection.

### Common Pitfalls
- Web Bluetooth only works in secure context (HTTPS or localhost)
- Android browsers can be strict about Bluetooth permissions
- CPCL must use `\r\n` end-of-line values

---

## 6. Local Testing

### Start the CAP server
```bash
cd "C:\Users\LENOVO\Documents\Projects\Arisa\Sample - Print Label"
cds watch
```

### Optional UI Preview
```bash
cd "C:\Users\LENOVO\Documents\Projects\Arisa\Sample - Print Label"
python -m http.server 8080
```
Then open:
```text
http://localhost:8080/app/label-printer-ui/webapp/index.html
```

### Testing Checklist
- Confirm the batch list loads
- Confirm a selected batch generates a CPCL payload
- Confirm mock preview appears when no printer is connected
- Confirm `PRINT` command appears at the end of the payload

---

## 7. Production / Migration Preparation

### Guidance
The structure is intentionally designed to allow future migration from mock data to S/4HANA OData without rewriting the print logic itself.

To prepare for production:
- replace the read data source behind the CAP service with a remote OData source
- keep `generateCpclPayload` as the interface boundary
- keep all printer logic in the frontend or a dedicated print module

### Recommended Architecture Change
- Current local phase: SQLite + CSV mock data
- Future production phase: S/4HANA OData as data source
- Shared print behavior: same `generateCpclPayload` semantics and native CPCL generation

---

## 8. Troubleshooting

### Browser refuses Bluetooth
- Use secure context or localhost
- Use Chrome/Edge on Android
- Check that the printer is paired and powered on

### Labels print incorrectly
- Validate CRLF line endings (`\r\n`)
- Check for unsupported special characters in the material text
- Confirm label width and print commands match the printer model

### CAP service fails
- Ensure the model and service definitions are aligned
- Check that the CSV row IDs match the expected UUID format

---

## Next Steps
1. Install CAP runtime dependencies.
2. Create or expand the mock dataset.
3. Publish the UI to a local secure server for Bluetooth testing.
4. Extend the app with device selection and printer status management.
5. Replace the mock backend source with an S/4HANA OData data flow when ready.
