export const formatIsoDateToString = (dataIso: string): string => {
  const data = new Date(dataIso);

  // Verifica se a data é válida
  if (isNaN(data.getTime())) {
    throw new Error('Data inválida');
  }

  // 'pt-BR' garante o formato dia/mês/ano
  return new Intl.DateTimeFormat('pt-BR').format(data);
};

export const getTodayDate = (): string => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0
  const dd = String(today.getDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
};

export const formatDateToShortLabel = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('pt-BR', { month: 'short' }); // e.g., "Jul"
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
};

export const getCurrentDateFormatted = () => {
  const today = new Date();
  return (
    String(today.getDate()).padStart(2, '0') +
    '/' +
    String(today.getMonth() + 1).padStart(2, '0') +
    '/' +
    today.getFullYear()
  );
};
