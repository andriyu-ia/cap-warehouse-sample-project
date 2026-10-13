const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
  const { StockBatches } = this.entities;

  this.on('generateCpclPayload', async (req) => {
    const batchId = req.data?.batchId;
    if (!batchId) {
      throw new Error('batchId is required');
    }

    const batch = await SELECT.one
      .from(StockBatches)
      .where({ ID: batchId });

    if (!batch) {
      throw new Error(`Batch ${batchId} was not found`);
    }

    return buildCpclPayload(batch);
  });
});

function buildCpclPayload(batch) {
  const materialText = (batch.materialDesc || batch.materialCode || 'Unknown').replace(/\r?\n/g, ' ');
  const qrPayload = JSON.stringify({
    materialCode: batch.materialCode,
    materialDesc: batch.materialDesc,
    batchNo: batch.batchNo,
    plant: batch.plant,
    storageLoc: batch.storageLoc,
    qty: batch.qty,
    uom: batch.uom,
    opnameType: batch.opnameType
  });

  return [
    '! 0 200 200 180 1',
    `TEXT 4 0 30 30 ${materialText}`,
    `TEXT 2 0 30 110 ${batch.materialCode}`,
    `TEXT 2 0 30 150 ${batch.batchNo}`,
    `B QR 30 180 M 2 U 5`,
    qrPayload,
    'ENDQR',
    `TEXT 2 0 30 260 ${batch.plant} / ${batch.storageLoc}`,
    `TEXT 2 0 30 300 ${batch.qty} ${batch.uom}`,
    'PRINT',
    ''
  ].join('\r\n');
}
