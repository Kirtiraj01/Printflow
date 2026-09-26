export function calculateOrderPrice({ pages, copies = 1, colorMode = 'bw', paperSize = 'A4', rates }) {
  const effectiveRates = rates || { bwPerPage: 2, colorPerPage: 8, a3Multiplier: 1.5 };
  const ratePerPage = colorMode === 'color' ? effectiveRates.colorPerPage : effectiveRates.bwPerPage;
  const multiplier = paperSize === 'A3' ? effectiveRates.a3Multiplier : 1;
  return Math.max(1, Math.round(pages * copies * ratePerPage * multiplier));
}
