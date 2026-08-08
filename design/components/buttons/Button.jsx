import React from "react";

const sizes = {
  sm: { padding: "8px 16px", fontSize: "var(--text-sm)", radius: "var(--radius-sm)" },
  md: { padding: "12px 22px", fontSize: "var(--text-base)", radius: "var(--radius-md)" },
  lg: { padding: "16px 28px", fontSize: "var(--text-md)", radius: "var(--radius-lg)" },
};

const variants = {
  primary: { background: "var(--brand-gold)", color: "var(--ink-900)", border: "none" },
  secondary: { background: "transparent", color: "var(--ink-900)", border: "1.5px solid var(--ink-900)" },
  ghost: { background: "transparent", color: "var(--ink-700)", border: "none" },
  ai: { background: "var(--brand-violet)", color: "#fff", border: "none" },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = "right",
  onClick,
  type = "button",
  style,
  ...props
}) {
  const s = sizes[size];
  const v = variants[variant];
  const [hover, setHover] = React.useState(false);

  const hoverBg = {
    primary: "var(--brand-gold-600)",
    secondary: "var(--surface-sunken)",
    ghost: "var(--surface-sunken)",
    ai: "var(--brand-violet-600)",
  }[variant];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontFamily: "var(--font-display)",
        fontWeight: 600,
        letterSpacing: "var(--tracking-normal)",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)",
        width: fullWidth ? "100%" : "auto",
        opacity: disabled ? 0.45 : 1,
        padding: s.padding,
        fontSize: s.fontSize,
        borderRadius: s.radius,
        background: hover && !disabled ? hoverBg : v.background,
        color: v.color,
        border: v.border,
        transform: hover && !disabled ? "translateY(-1px)" : "none",
        ...style,
      }}
      {...props}
    >
      {icon && iconPosition === "left" && icon}
      <span>{children}</span>
      {icon && iconPosition === "right" && icon}
    </button>
  );
}
