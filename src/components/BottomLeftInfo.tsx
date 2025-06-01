import React from 'react';

const BottomLeftInfo: React.FC = () => {
  return (
    <div className="fixed left-4 bottom-4 z-50 bg-terminal-widget/90 text-terminal-muted px-4 py-2 rounded-xl shadow flex items-center text-sm font-medium" style={{ minWidth: 220 }}>
      <span>2 059,62 USD</span>
      <span className="mx-2">|</span>
      <span>
        Today <span className="text-terminal-negative">-1,24 USD</span> <span className="text-xs text-terminal-muted">(0,06%)</span>
      </span>
    </div>
  );
};

export default BottomLeftInfo; 