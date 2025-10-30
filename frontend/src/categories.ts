export const CATEGORIES = [
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Productivity', label: 'Productivity' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'Music', label: 'Music' },
  { value: 'Education', label: 'Education' },
  { value: 'Cloud Storage', label: 'Cloud Storage' },
  { value: 'Fitness', label: 'Fitness' },
  { value: 'News', label: 'News' },
  { value: 'Software', label: 'Software' },
  { value: 'Other', label: 'Other' }
];

export const getCategoryColor = (category: string) => {
  const colors: { [key: string]: { bgColor: string; color: string } } = {
    'Entertainment': { bgColor: '#ffe5e5', color: '#cc0000' },
    'Productivity': { bgColor: '#e5f5ff', color: '#0066cc' },
    'Gaming': { bgColor: '#f0e5ff', color: '#6600cc' },
    'Music': { bgColor: '#ffe5f5', color: '#cc0066' },
    'Education': { bgColor: '#e5ffe5', color: '#00cc00' },
    'Cloud Storage': { bgColor: '#fff5e5', color: '#cc6600' },
    'Fitness': { bgColor: '#e5ffff', color: '#00cccc' },
    'News': { bgColor: '#ffffe5', color: '#cccc00' },
    'Software': { bgColor: '#f5f5f5', color: '#666666' },
    'Other': { bgColor: '#f0f0f0', color: '#999999' }
  };
  
  return colors[category] || colors['Other'];
};
