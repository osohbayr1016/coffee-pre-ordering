import React, { useEffect, useState } from "react";

export type DialogProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: "default" | "danger" | "success" | "warning";
};

export default function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions,
  variant = "default",
}: DialogProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => setShow(false), 300); // fade out duration
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  if (!isOpen && !show) return null;

  const getBorderColor = () => {
    switch (variant) {
      case "danger": return "border-red-500/50 shadow-red-500/20";
      case "success": return "border-green-500/50 shadow-green-500/20";
      case "warning": return "border-amber-500/50 shadow-amber-500/20";
      default: return "border-white/20 shadow-black/50";
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "danger": return "text-red-500";
      case "success": return "text-green-500";
      case "warning": return "text-amber-500";
      default: return "text-amber-500";
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? "opacity-100 bg-black/60" : "opacity-0 bg-transparent pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`glass-panel w-full max-w-md p-6 rounded-2xl border ${getBorderColor()} shadow-2xl transition-all duration-300 transform ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-2 rounded-xl bg-white/5 ${getIconColor()} border border-white/10`}>
            {variant === "danger" && "⚠️"}
            {variant === "success" && "✅"}
            {variant === "warning" && "🔔"}
            {variant === "default" && "📄"}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{title}</h3>
            {description && <p className="text-sm text-zinc-400 mt-1">{description}</p>}
          </div>
        </div>

        {children && <div className="my-6 border-t border-white/10 pt-4 text-sm text-zinc-300 max-h-60 overflow-y-auto">{children}</div>}

        <div className="flex justify-end gap-3 mt-6 border-t border-white/10 pt-4">
          {actions ? (
            actions
          ) : (
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
