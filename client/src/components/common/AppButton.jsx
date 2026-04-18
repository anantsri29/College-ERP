const styleByVariant = {
  primary: "btn-primary border border-indigo-600",
  secondary: "btn-secondary",
  danger: "bg-rose-600 border border-rose-600 text-white hover:bg-rose-700",
};

const AppButton = ({
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  children,
  ...props
}) => {
  const variantClass = styleByVariant[variant] || styleByVariant.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default AppButton;
