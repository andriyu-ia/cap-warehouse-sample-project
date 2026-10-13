# Project Scope: Warehouse Label Printing Solution

## Executive Summary
Build an end-to-end warehouse label printing solution as a SAP BTP Multi-Target Application (MTA) monorepo. The system enables Android handheld devices (Datalogic) to print barcode and QR code labels directly to an HPRT HM-A300E portable thermal printer via Web Bluetooth API, using CPCL (Comtec Printer Control Language) commands.

---

## Business Context

### Use Case
Mobile warehouse application for stock opname/batch labeling. Warehouse staff use Datalogic handheld devices to view stock batch information and print thermal labels with barcodes and QR codes.

### Hardware
- Client Device: Datalogic Android handheld running SAPUI5 via browser
- Target Printer: HPRT HM-A300E portable thermal printer
  - 203 DPI resolution
  - ~576 dots printable width
  - Connected via Web Bluetooth API (RFCOMM protocol)
- Printer Language: CPCL (native format for optimal print quality)

### Connectivity Model
- Local Web Bluetooth API directly from handheld to printer (no network printing)
- Printer paired at Bluetooth level; app opens RFCOMM serial stream
- Built-in Mock/Debug Mode when no physical printer available (onscreen preview)

---

## Technical Architecture

### Monorepo Structure (MTA)
```
project-root/
├── db/                    # CDS schema and mock data
│   ├── schema.cds
│   └── data/              # CSV mock data
├── srv/                   # CAP Node.js services
│   ├── print-service.cds
│   ├── print-service.js   # CPCL payload generator
│   └── ...
├── app/                   # SAPUI5 frontend application
│   ├── label-printer-ui/
│   │   └── webapp/        # Controllers, views, models
│   └── ...
├── package.json
├── mta.yaml               # BTP Cloud Foundry deployment spec
├── WALKTHROUGH.md         # Execution runbook
├── README.md              # Project overview
└── plan.md                # Project planning notes
```

### Technology Stack
- Backend: CAP Node.js + SQLite for local development
- Frontend: SAPUI5 LTS (1.96) UI on Datalogic handheld
- Printer protocol: CPCL command strings, QR code formatting, local Bluetooth streaming

---

## Core Requirements
- Create an entity `StockBatches` with material, batch, plant, storage location, quantity, and stock opname metadata
- Provide a backend action `generateCpclPayload(batchId)` returning a raw CPCL label payload
- Keep backend printer-agnostic and isolate query logic for future S/4HANA integration
- Build a touch-friendly SAPUI5 app with device list and print trigger
- Include a mock mode that shows CPCL preview when no physical printer is available

---

## Deliverables
- `db/schema.cds`
- `db/data/my.company-StockBatches.csv`
- `srv/print-service.cds`
- `srv/print-service.js`
- `app/label-printer-ui/webapp/*`
- `package.json`
- `mta.yaml`
- `WALKTHROUGH.md`
- `README.md`

---

## Implementation Approach
1. Start with a minimal but runnable monorepo skeleton.
2. Add safe CAP schema and sample data.
3. Add a CPCL generator service that returns print commands.
4. Add a lightweight SAPUI5 UI for batch review and print actions.
5. Document the full setup process in `WALKTHROUGH.md`.

---

## Important Constraints
- Web Bluetooth requires secure context on Android and is best used from a browser over HTTPS or localhost.
- CPCL line separators must be `\r\n` to avoid printer misreads.
- No backend socket printing: all printer transmission is handled by the frontend app.
- Production integration can swap the data source behind the service layer without affecting the print logic.
