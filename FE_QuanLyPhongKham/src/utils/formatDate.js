import dayjs from 'dayjs';

export const formatDate = (dateStr, format = 'DD/MM/YYYY') => {
  if (!dateStr) return 'N/A';
  const d = dayjs(dateStr);
  return d.isValid() ? d.format(format) : 'N/A';
};

export const formatDateTime = (dateStr, format = 'DD/MM/YYYY HH:mm') => {
  if (!dateStr) return 'N/A';
  const d = dayjs(dateStr);
  return d.isValid() ? d.format(format) : 'N/A';
};

export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return 0;
  return dayjs().diff(dayjs(dateOfBirth), 'year');
};
