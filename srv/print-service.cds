using my.company as my from '../db/schema';

service PrintService {
  entity StockBatches as projection on my.StockBatches;

  action generateCpclPayload(batchId: String) returns String;
}
