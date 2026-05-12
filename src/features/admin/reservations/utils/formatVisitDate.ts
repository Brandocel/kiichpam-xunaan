const MONTHS_ES = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
  ];
  
  function formatDateOnly(dateOnly: string): string {
    const [year, month, day] = dateOnly.split('-');
  
    const monthIndex = Number(month) - 1;
    const monthName = MONTHS_ES[monthIndex] ?? '';
  
    return `${Number(day)} ${monthName} ${year}`;
  }
  
  export function formatVisitDate(value?: string | Date | null): string {
    if (!value) {
      return 'Sin fecha';
    }
  
    const rawValue = String(value);
  
    /**
     * Si el backend manda:
     * 2026-05-11T17:00:00.000Z
     *
     * Para fecha de visita nos interesa la parte calendario:
     * 2026-05-11
     *
     * Así evitamos que el navegador cambie el día por zona horaria.
     */
    const dateOnlyMatch = rawValue.match(/^(\d{4}-\d{2}-\d{2})/);
  
    if (dateOnlyMatch) {
      return formatDateOnly(dateOnlyMatch[1]);
    }
  
    const date = new Date(value);
  
    if (Number.isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
  
    const parts = new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'America/Cancun',
    }).formatToParts(date);
  
    const day = parts.find((part) => part.type === 'day')?.value ?? '';
    const month = parts
      .find((part) => part.type === 'month')
      ?.value.replace('.', '') ?? '';
    const year = parts.find((part) => part.type === 'year')?.value ?? '';
  
    return `${day} ${month} ${year}`;
  }