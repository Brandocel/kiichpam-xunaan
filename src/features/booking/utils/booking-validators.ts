export function canQuoteBooking(params: {
    packageCode: string;
    visitDate: string;
    adults: number;
  }) {
    return Boolean(params.packageCode && params.visitDate && params.adults > 0);
  }