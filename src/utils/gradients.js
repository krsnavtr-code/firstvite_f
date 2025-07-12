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
    'bg-[#F47C26] dark:bg-[#F47C26]/30',
    // 'bg-green-300 dark:bg-green-900/30',
    // 'bg-purple-300 dark:bg-purple-900/30',
    // 'bg-amber-300 dark:bg-amber-900/30',
    // 'bg-pink-300 dark:bg-pink-900/30',
    // 'bg-indigo-300 dark:bg-indigo-900/30',
    // 'bg-teal-300 dark:bg-teal-900/30',
    // 'bg-rose-300 dark:bg-rose-900/30',
    // 'bg-emerald-300 dark:bg-emerald-900/30',
    // 'bg-cyan-300 dark:bg-cyan-900/30',
  ];

  return bgColors[Math.abs(hash) % bgColors.length];
};

// For backward compatibility
export const getCardGradient = getCardBgColor;
