# Sample Print Label

This repository is a minimal SAP BTP CAP + SAPUI5 monorepo for a warehouse label-printing mobile app. It is designed for Datalogic handheld devices and uses Web Bluetooth to send an HPRT HM-A300E label job in CPCL format.

## Goals
- Show a CAP service that exposes batch data
- Generate a native CPCL payload for a thermal label print
- Provide a touch-friendly SAPUI5 app for printing labels on-device
- Support a mock preview mode when no Bluetooth printer is connected

## Folder Layout

```text
.
├── app/
│   └── label-printer-ui/
│       └── webapp/
├── db/
│   ├── data/
│   └── schema.cds
├── srv/
│   ├── print-service.cds
│   └── print-service.js
├── mta.yaml
├── package.json
├── plan.md
├── WALKTHROUGH.md
└── README.md
```

## Runtime Model
- CAP backend exposes OData entities and action `generateCpclPayload(batchId)`
- Frontend loads batch data and triggers a Bluetooth job
- Bluetooth manager handles real hardware and mock preview fallback

## Fiori UI/UX Direction
- UI follows SAP Fiori patterns using SAPUI5 controls (`sap.m` + `sap.f`)
- Main layout uses Dynamic Page style with semantic statuses and action toolbar
- Root shell now uses a launchpad-like header (ShellBar + notifications + settings + user menu)
- Theme is set to `sap_horizon` to align with the latest modern Fiori visual language
- Interaction model is optimized for handheld use (single-select batch table + primary print action)
- Enterprise flow now uses router-based pages:
  - Batch List
  - Batch Detail
  - Print Preview
- Global settings are available from shell:
  - default warehouse
  - mock print mode
  - auto reconnect preference

## Notes
This is a minimal project skeleton intended to be extended into a production-capable solution. It keeps the structure aligned with the requirement to support local testing, mock data, Bluetooth printing, and future S/4HANA integration without rewriting the print workflow.
