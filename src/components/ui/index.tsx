export { Logo } from "./Logo";
export { Toast } from "./Toast";

export function Input({
  label,
  error,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 
          focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 
          transition-all duration-200 hover:border-slate-300
          ${error ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : ""} 
          ${className}`}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}

export function Button({
  variant = "primary",
  children,
  className = "",
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/30",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 border border-slate-200",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-lg shadow-red-600/25",
    ghost: "text-slate-600 hover:bg-slate-100 active:bg-slate-200",
  };
  
  return (
    <button 
      {...props} 
      disabled={disabled} 
      className={`
        inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        ${variants[variant]} 
        ${className}
      `}
    >
      {children}
    </button>
  );
}

export function IconButton({
  icon,
  onClick,
  variant = "default",
  className = "",
  title,
  size = "md",
}: {
  icon: string;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger" | "success" | "ghost";
  className?: string;
  title?: string;
  size?: "sm" | "md" | "lg";
}) {
  const variants = {
    default: "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
    primary: "text-indigo-600 hover:bg-indigo-50",
    danger: "text-red-500 hover:bg-red-50 hover:text-red-600",
    success: "text-green-600 hover:bg-green-50 hover:text-green-700",
    ghost: "text-slate-400 hover:text-slate-600 hover:bg-slate-50",
  };
  
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        inline-flex items-center justify-center rounded-xl transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-indigo-500/50
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
    >
      <i className="material-icons">{icon}</i>
    </button>
  );
}

export function Card({
  children,
  title,
  actions,
  className = "",
}: {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${className}`}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-5">
          {title && <h2 className="text-lg font-semibold text-slate-800">{title}</h2>}
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Badge({
  variant = "default",
  children,
}: {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}) {
  const variants = {
    default: "bg-slate-100 text-slate-600",
    success: "bg-green-50 text-green-700 ring-1 ring-green-600/10",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10",
    danger: "bg-red-50 text-red-700 ring-1 ring-red-600/10",
    info: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/10",
  };
  
  const icons: Record<string, string> = {
    success: "check_circle",
    warning: "warning",
    danger: "error",
    info: "info",
  };
  
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
      ${variants[variant]}
    `}>
      {variant !== "default" && <i className="material-icons text-sm">{icons[variant]}</i>}
      {children}
    </span>
  );
}

export function Table({
  columns,
  data,
}: {
  columns: { key: string; label: string }[];
  data: object[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-slate-600">
                  {String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <i className="material-icons text-4xl mb-2">inbox</i>
          <p>No hay datos disponibles</p>
        </div>
      )}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <i className="material-icons">close</i>
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {trend && (
            <p className={`text-xs font-medium mt-1 ${trend.positive ? "text-green-600" : "text-red-600"}`}>
              {trend.positive ? "+" : ""}{trend.value}%
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}