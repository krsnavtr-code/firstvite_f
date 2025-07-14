// Gradient utility functions
export const getGradientByIndex = (index) => {
  const gradients = [
    'from-blue-300 to-indigo-300 dark:from-blue-900/40 dark:to-indigo-900/40',
    'from-green-300 to-teal-300 dark:from-green-900/40 dark:to-teal-900/40',
    'from-purple-300 to-pink-300 dark:from-purple-900/40 dark:to-pink-900/40',
    'from-amber-300 to-orange-300 dark:from-amber-900/40 dark:to-orange-900/40',
    'from-emerald-300 to-cyan-300 dark:from-emerald-900/40 dark:to-cyan-900/40',
    'from-rose-300 to-fuchsia-300 dark:from-rose-900/40 dark:to-fuchsia-900/40',
  ];
  return gradients[index % gradients.length];
};

export const getGradientByString = (str) => {
  if (!str) return getGradientByIndex(0);
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return getGradientByIndex(hash);
};

// Background color classes for cards
export const getCardBgColor = (item, index = 0) => {
  let id = '';
  if (typeof item === 'string' || typeof item === 'number') {
    id = String(item);
  } else if (item && typeof item === 'object') {
    id = String(item._id || item.id || index);
  } else {
    id = String(index);
  }

  const hash = Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const bgColors = [
    // 'bg-[#F47C26]/30 dark:bg-[#2563EB]/30',
    // 'bg-[#ffbf91] dark:bg-[#2563EB]/30',
    'bg-[#2563EB]/30 dark:bg-[#2563EB]/30',
  ];

  return bgColors[Math.abs(hash) % bgColors.length];
};

// For backward compatibility
export const getCardGradient = getCardBgColor;
