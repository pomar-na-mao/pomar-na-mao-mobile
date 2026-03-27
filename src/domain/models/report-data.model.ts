export interface OccurrenceDistribution {
  name: string;
  count: number;
}

export interface PlantsByRegion {
  region: string;
  count: number;
}

export interface InspectionsByRegion {
  region: string;
  count: number;
}

export interface AlteredPlants {
  status: string; // 'Alterada' | 'Não Alterada'
  count: number;
}

export interface SummaryKPIs {
  totalPlants: number;
  deadPlants: number;
  missingPlants: number;
}

export interface ReportDataContainer {
  summary: SummaryKPIs;
  occurrenceDistribution: OccurrenceDistribution[];
  plantsByRegion: PlantsByRegion[];
  inspectionsByRegion: InspectionsByRegion[];
  alteredPlants: AlteredPlants[];
}
