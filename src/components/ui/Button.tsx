type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "success";
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-400"
      : variant === "success"
        ? "bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-emerald-300"
        : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 disabled:text-slate-400";

  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${variantClass} ${className}`}
      {...props}
    />
  );
}
