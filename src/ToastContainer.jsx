import { useToast } from "./ToastContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  const colors = {
    success: { bg: "#065f46", border: "#10b981" },
    error: { bg: "#7f1d1d", border: "#ef4444" },
    warning: { bg: "#78350f", border: "#f59e0b" },
    info: { bg: "#1e3a5f", border: "#3b82f6" },
  };

  return (
    <div style={{
      position: "fixed",
      top: "80px",
      right: "20px",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      maxWidth: "380px",
      width: "100%",
      pointerEvents: "none"
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            backgroundColor: colors[t.type]?.bg || colors.info.bg,
            borderLeft: `4px solid ${colors[t.type]?.border || colors.info.border}`,
            color: "white",
            padding: "14px 40px 14px 16px",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
            fontSize: "14px",
            lineHeight: "1.4",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            position: "relative",
            pointerEvents: "auto",
            animation: t.leaving ? "toastSlideOut 0.3s ease forwards" : "toastSlideIn 0.3s ease",
          }}
        >
          <span style={{
            fontWeight: "bold",
            fontSize: "16px",
            lineHeight: "1",
            flexShrink: 0,
            marginTop: "1px"
          }}>
            {icons[t.type] || icons.info}
          </span>
          <span>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: "16px",
              padding: "2px",
              lineHeight: "1"
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
