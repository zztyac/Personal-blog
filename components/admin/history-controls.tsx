"use client";

export function HistoryControls() {
  return (
    <div className="history-controls">
      <button type="button" className="button-secondary nav-button" onClick={() => window.history.back()}>
        返回
      </button>
      <button type="button" className="button-secondary nav-button" onClick={() => window.history.forward()}>
        前进
      </button>
    </div>
  );
}
