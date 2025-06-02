// Форматирование цены
export const formatPrice = (price: number, decimals: number = 2): string => {
  if (price === 0) return '0.00';
  
  // Автоматически определяем количество знаков после запятой
  if (price >= 1000) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } else if (price >= 1) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    });
  } else if (price >= 0.01) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 6
    });
  } else {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 8
    });
  }
};

// Форматирование объема
export const formatVolume = (volume: number): string => {
  if (volume === 0) return '0';
  
  if (volume >= 1e9) {
    return (volume / 1e9).toFixed(2) + 'B';
  } else if (volume >= 1e6) {
    return (volume / 1e6).toFixed(2) + 'M';
  } else if (volume >= 1e3) {
    return (volume / 1e3).toFixed(2) + 'K';
  } else if (volume >= 1) {
    return volume.toFixed(2);
  } else {
    return volume.toFixed(6);
  }
};

// Форматирование временной метки
export const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return 'Никогда';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Если меньше минуты
  if (diff < 60000) {
    const seconds = Math.floor(diff / 1000);
    return `${seconds}с назад`;
  }
  
  // Если меньше часа
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}м назад`;
  }
  
  // Если меньше дня
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}ч назад`;
  }
  
  // Если больше дня, показываем дату
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Форматирование времени для отображения
export const formatTime = (timestamp: number): string => {
  if (!timestamp) return '--:--:--';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Форматирование даты
export const formatDate = (timestamp: number): string => {
  if (!timestamp) return '--.--.----';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Форматирование процентов
export const formatPercent = (value: number, decimals: number = 2): string => {
  if (value === 0) return '0.00%';
  
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

// Форматирование изменения цены
export const formatPriceChange = (change: number, percent: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${formatPrice(change)} (${formatPercent(percent)})`;
};

// Форматирование маркет-кап
export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else if (marketCap >= 1e3) {
    return `$${(marketCap / 1e3).toFixed(2)}K`;
  } else {
    return `$${marketCap.toFixed(2)}`;
  }
};

// Форматирование размера ордера
export const formatOrderSize = (size: number, symbol: string): string => {
  const baseCurrency = symbol.split('/')[0] || '';
  return `${formatVolume(size)} ${baseCurrency}`;
};

// Форматирование торгового объема в долларах
export const formatVolumeUSD = (volume: number, price: number): string => {
  const volumeUSD = volume * price;
  return `$${formatVolume(volumeUSD)}`;
};

// Форматирование спреда
export const formatSpread = (bid: number, ask: number): string => {
  if (!bid || !ask) return '--';
  
  const spread = ask - bid;
  const spreadPercent = (spread / bid) * 100;
  
  return `${formatPrice(spread)} (${spreadPercent.toFixed(3)}%)`;
};

// Форматирование времени до экспирации
export const formatTimeToExpiry = (expiryTimestamp: number): string => {
  const now = Date.now();
  const diff = expiryTimestamp - now;
  
  if (diff <= 0) return 'Истекло';
  
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  
  if (days > 0) {
    return `${days}д ${hours}ч`;
  } else if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  } else {
    return `${minutes}м`;
  }
};

// Форматирование количества знаков после запятой на основе цены
export const getDecimalPlaces = (price: number): number => {
  if (price >= 1000) return 2;
  if (price >= 1) return 4;
  if (price >= 0.01) return 6;
  return 8;
};

// Утилита для сокращения длинных строк
export const truncateString = (str: string, maxLength: number = 20): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};

// Форматирование хеша транзакции
export const formatTxHash = (hash: string, startLength: number = 6, endLength: number = 4): string => {
  if (hash.length <= startLength + endLength) return hash;
  return `${hash.substring(0, startLength)}...${hash.substring(hash.length - endLength)}`;
}; 