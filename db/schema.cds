namespace my.company;

entity StockBatches {
  key ID: UUID;
  materialCode: String(30);
  materialDesc: String(80);
  batchNo: String(30);
  plant: String(10);
  storageLoc: String(10);
  qty: Decimal(13,3);
  uom: String(5);
  opnameType: String(30);
}
