export const getReadableId = (mongoId, type) => {
  if (!mongoId) return 'N/A';
  const idStr = String(mongoId);
  const prefix = type === 'hotel' ? 'TEH' : 'TEF';
  
  const cleanPrefix = prefix.toUpperCase();
  const part1 = idStr.substring(0, 4).toUpperCase();
  const part2 = idStr.substring(Math.max(0, idStr.length - 4)).toUpperCase();
  
  return `${cleanPrefix}-${part1}-${part2}`;
};
