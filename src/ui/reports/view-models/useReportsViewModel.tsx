import { reportsRepository } from '@/data/repositories/reports-repository';
import type { ReportDataContainer } from '@/domain/models/report-data.model';
import { useCallback, useEffect, useState } from 'react';

export function useReportsViewModel() {
  const [data, setData] = useState<ReportDataContainer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const reportData = await reportsRepository.getReportData();
      setData(reportData);
    } catch (err) {
      console.error('Error loading report data:', err);
      setError('Erro ao carregar os dados dos relatórios. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    refresh: loadData,
  };
}
