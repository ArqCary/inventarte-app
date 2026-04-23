interface ToastProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose?: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
  };

  const icons = {
    success: "check_circle",
    error: "error",
    info: "info",
    warning: "warning",
  };

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-lg border flex items-center gap-3 min-w-[300px] animate-slide-in z-[9999] ${styles[type]}`}>
      <i className="material-icons text-xl">{icons[type]}</i>
      <p className="text-sm font-medium flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="hover:opacity-70 transition">
          <i className="material-icons text-lg">close</i>
        </button>
      )}
    </div>
  );
}