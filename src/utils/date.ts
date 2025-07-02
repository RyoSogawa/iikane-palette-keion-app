export const formatDateString = (date: Date | string): string => {
  const dateString = typeof date === 'string' ? date : date.toISOString();
  const datePart = dateString.split('T')[0];
  return datePart ? datePart.replace(/-/g, '/') : '';
};
