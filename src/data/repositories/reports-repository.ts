import type { ReportDataContainer } from '@/domain/models/report-data.model';
import { reportsService } from '../services/reports-service';

class ReportsRepository {
  async getReportData(): Promise<ReportDataContainer> {
    const [
      summary,
      occurrenceDistribution,
      plantsByRegion,
      inspectionsByRegion,
      alteredPlants
    ] = await Promise.all([
      reportsService.getSummaryKPIs(),
      reportsService.getOccurrenceDistribution(),
      reportsService.getPlantsByRegion(),
      reportsService.getInspectionsByRegion(),
      reportsService.getAlteredPlants(),
    ]);

    return {
      summary,
      occurrenceDistribution,
      plantsByRegion,
      inspectionsByRegion,
      alteredPlants,
    };
  }
}

export const reportsRepository = new ReportsRepository();
