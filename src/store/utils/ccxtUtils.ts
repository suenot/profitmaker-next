// CCXT загружается через CDN script tag - доступен как window.ccxt
declare global {
  interface Window {
    ccxt: any;
  }
}

/**
 * Получение CCXT из глобального объекта (CDN версия)
 */
export const getCCXT = () => {
  if (!window.ccxt) {
    console.error('CCXT не загружен! Проверьте подключение CDN script tag');
    return null;
  }
  return window.ccxt;
};

/**
 * Получение CCXT Pro (для WebSocket)
 */
export const getCCXTPro = () => {
  const ccxt = getCCXT();
  if (ccxt && ccxt.pro) {
    return ccxt.pro;
  }
  
  console.error('❌ CCXT Pro не доступен. Убедитесь что используется полная версия CCXT с поддержкой WebSocket');
  return null;
}; 