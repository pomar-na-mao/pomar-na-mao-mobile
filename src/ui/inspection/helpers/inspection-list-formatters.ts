export function formatInspectionDateTime(value?: string | null) {
  if (!value) return 'Sem data';

  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}
