/* @ds-bundle: {"format":4,"namespace":"SabiLearnDesignSystem_2075a4","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"AIToolCard","sourcePath":"components/cards/AIToolCard.jsx"},{"name":"CourseCard","sourcePath":"components/cards/CourseCard.jsx"},{"name":"StatCard","sourcePath":"components/cards/StatCard.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"ProgressBar","sourcePath":"components/feedback/ProgressBar.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Footer","sourcePath":"components/navigation/Footer.jsx"},{"name":"Navbar","sourcePath":"components/navigation/Navbar.jsx"},{"name":"Dialog","sourcePath":"components/overlay/Dialog.jsx"},{"name":"Tabs","sourcePath":"components/overlay/Tabs.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"4ac2b2718660","components/cards/AIToolCard.jsx":"698e7a8dfa2f","components/cards/CourseCard.jsx":"d4b46de88c0f","components/cards/StatCard.jsx":"9a3d186da371","components/feedback/Badge.jsx":"08d218a4edb4","components/feedback/ProgressBar.jsx":"78c414968dba","components/feedback/Toast.jsx":"b754066e9d78","components/forms/Checkbox.jsx":"79279eda3760","components/forms/Input.jsx":"e6a45fe7bdf0","components/forms/Radio.jsx":"791b75626fb2","components/forms/Select.jsx":"212947acd7bf","components/forms/Switch.jsx":"e3dee87afb0f","components/navigation/Footer.jsx":"8ac25c6788b0","components/navigation/Navbar.jsx":"c97f03f7b535","components/overlay/Dialog.jsx":"fe82cb6587da","components/overlay/Tabs.jsx":"108460e6d80a","ui_kits/platform/AIToolDialog.jsx":"7da7323573b4","ui_kits/platform/App.jsx":"e35e31120fbf","ui_kits/platform/CourseCatalog.jsx":"bd67c6d73c93","ui_kits/platform/CourseDetail.jsx":"2318a0289e35","ui_kits/platform/Dashboard.jsx":"ff142cbc1eee","ui_kits/platform/Login.jsx":"4d90e4311b37"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.SabiLearnDesignSystem_2075a4 = window.SabiLearnDesignSystem_2075a4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const sizes = {
  sm: {
    padding: "8px 16px",
    fontSize: "var(--text-sm)",
    radius: "var(--radius-sm)"
  },
  md: {
    padding: "12px 22px",
    fontSize: "var(--text-base)",
    radius: "var(--radius-md)"
  },
  lg: {
    padding: "16px 28px",
    fontSize: "var(--text-md)",
    radius: "var(--radius-lg)"
  }
};
const variants = {
  primary: {
    background: "var(--brand-gold)",
    color: "var(--ink-900)",
    border: "none"
  },
  secondary: {
    background: "transparent",
    color: "var(--ink-900)",
    border: "1.5px solid var(--ink-900)"
  },
  ghost: {
    background: "transparent",
    color: "var(--ink-700)",
    border: "none"
  },
  ai: {
    background: "var(--brand-violet)",
    color: "#fff",
    border: "none"
  }
};
function Button({
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
    ai: "var(--brand-violet-600)"
  }[variant];
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
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
      ...style
    }
  }, props), icon && iconPosition === "left" && icon, /*#__PURE__*/React.createElement("span", null, children), icon && iconPosition === "right" && icon);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/cards/AIToolCard.jsx
try { (() => {
function AIToolCard({
  icon,
  title,
  description,
  cta = "Try it",
  onClick
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      padding: "24px",
      borderRadius: "var(--radius-2xl)",
      background: "var(--brand-violet)",
      color: "#fff",
      fontFamily: "var(--font-body)",
      width: "260px",
      boxShadow: "var(--shadow-md)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "44px",
      height: "44px",
      borderRadius: "var(--radius-md)",
      background: "rgba(255,255,255,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-md)",
      fontWeight: 700
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: "var(--text-sm)",
      color: "var(--brand-violet-100)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, description)), /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      marginTop: "auto",
      background: "#fff",
      color: "var(--brand-violet-600)",
      border: "none",
      padding: "10px 18px",
      borderRadius: "var(--radius-md)",
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--text-sm)",
      cursor: "pointer",
      alignSelf: "flex-start"
    }
  }, cta));
}
Object.assign(__ds_scope, { AIToolCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/AIToolCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/CourseCard.jsx
try { (() => {
function CourseCard({
  image,
  level = "Beginner",
  title,
  instructor,
  price,
  free = false,
  progress,
  dark = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      borderRadius: "var(--radius-2xl)",
      background: dark ? "var(--ink-900)" : "var(--surface-card)",
      overflow: "hidden",
      boxShadow: "var(--shadow-sm)",
      fontFamily: "var(--font-body)",
      width: "280px",
      transition: "box-shadow var(--duration-normal) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: "100%",
      aspectRatio: "4/3",
      background: "var(--surface-sunken)",
      overflow: "hidden"
    }
  }, image && /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: title,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "12px",
      left: "12px",
      padding: "4px 12px",
      borderRadius: "var(--radius-full)",
      fontSize: "var(--text-xs)",
      fontWeight: 600,
      background: "rgba(255,255,255,0.9)",
      color: "var(--ink-900)"
    }
  }, level)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "18px",
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    }
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-md)",
      fontWeight: 700,
      color: dark ? "#fff" : "var(--ink-900)"
    }
  }, title), instructor && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: dark ? "var(--ink-300)" : "var(--text-muted)"
    }
  }, instructor), typeof progress === "number" ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "6px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "6px",
      borderRadius: "var(--radius-full)",
      background: dark ? "rgba(255,255,255,0.15)" : "var(--surface-sunken)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: `${progress}%`,
      background: "var(--brand-gold)",
      borderRadius: "var(--radius-full)"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: dark ? "var(--ink-300)" : "var(--text-muted)"
    }
  }, progress, "% complete")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "8px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      color: dark ? "var(--brand-gold)" : "var(--ink-900)"
    }
  }, free ? "Free" : `₦${price?.toLocaleString?.() ?? price}`))));
}
Object.assign(__ds_scope, { CourseCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/CourseCard.jsx", error: String((e && e.message) || e) }); }

// components/cards/StatCard.jsx
try { (() => {
function StatCard({
  value,
  label,
  trend
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      padding: "20px",
      borderRadius: "var(--radius-lg)",
      background: "var(--surface-card)",
      boxShadow: "var(--shadow-xs)",
      fontFamily: "var(--font-body)",
      minWidth: "160px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 700,
      color: "var(--ink-900)"
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)"
    }
  }, label), trend && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: 600,
      color: trend.startsWith("-") ? "var(--danger)" : "var(--success)"
    }
  }, trend));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cards/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
const tones = {
  gold: {
    bg: "var(--brand-gold-100)",
    fg: "var(--brand-gold-600)"
  },
  violet: {
    bg: "var(--brand-violet-100)",
    fg: "var(--brand-violet-600)"
  },
  success: {
    bg: "var(--success-100)",
    fg: "var(--success)"
  },
  danger: {
    bg: "var(--danger-100)",
    fg: "var(--danger)"
  },
  warning: {
    bg: "var(--warning-100)",
    fg: "var(--warning)"
  },
  neutral: {
    bg: "var(--surface-sunken)",
    fg: "var(--ink-700)"
  },
  dark: {
    bg: "var(--ink-900)",
    fg: "#fff"
  }
};
function Badge({
  children,
  tone = "neutral"
}) {
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 12px",
      borderRadius: "var(--radius-full)",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-xs)",
      fontWeight: 600,
      letterSpacing: "var(--tracking-wide)",
      textTransform: "uppercase",
      background: t.bg,
      color: t.fg
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/ProgressBar.jsx
try { (() => {
function ProgressBar({
  value = 0,
  max = 100,
  tone = "gold",
  label
}) {
  const pct = Math.max(0, Math.min(100, value / max * 100));
  const color = tone === "violet" ? "var(--brand-violet)" : tone === "success" ? "var(--success)" : "var(--brand-gold)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      fontFamily: "var(--font-body)",
      width: "100%"
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", null, Math.round(pct), "%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: "8px",
      borderRadius: "var(--radius-full)",
      background: "var(--surface-sunken)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: `${pct}%`,
      background: color,
      borderRadius: "var(--radius-full)",
      transition: "width var(--duration-slow) var(--ease-standard)"
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const tones = {
  info: {
    bg: "var(--ink-900)",
    fg: "#fff"
  },
  success: {
    bg: "var(--success)",
    fg: "#fff"
  },
  danger: {
    bg: "var(--danger)",
    fg: "#fff"
  }
};
function Toast({
  children,
  tone = "info",
  onClose
}) {
  const t = tones[tone] || tones.info;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "14px 18px",
      borderRadius: "var(--radius-lg)",
      background: t.bg,
      color: t.fg,
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      boxShadow: "var(--shadow-lg)",
      maxWidth: "360px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, children), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      color: "inherit",
      cursor: "pointer",
      fontSize: "16px",
      padding: 0,
      lineHeight: 1,
      opacity: 0.7
    }
  }, "\xD7"));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function Checkbox({
  label,
  checked,
  onChange,
  disabled
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      fontFamily: "var(--font-body)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      width: "20px",
      height: "20px",
      borderRadius: "6px",
      border: `1.5px solid ${checked ? "var(--brand-gold)" : "var(--line-strong)"}`,
      background: checked ? "var(--brand-gold)" : "var(--surface-card)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, checked && /*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "12",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--ink-900)",
    strokeWidth: "3"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M5 13l4 4L19 7"
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--ink-900)"
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  placeholder,
  error,
  helpText,
  disabled,
  type = "text",
  value,
  onChange,
  ...props
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      fontFamily: "var(--font-body)",
      width: "100%"
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: "var(--ink-900)"
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    placeholder: placeholder,
    disabled: disabled,
    value: value,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      padding: "11px 14px",
      borderRadius: "var(--radius-md)",
      border: `1.5px solid ${error ? "var(--danger)" : focused ? "var(--ink-900)" : "var(--line)"}`,
      background: disabled ? "var(--surface-sunken)" : "var(--surface-card)",
      color: "var(--ink-900)",
      outline: "none",
      transition: "border var(--duration-fast) var(--ease-standard)"
    }
  }, props)), (error || helpText) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: error ? "var(--danger)" : "var(--text-muted)"
    }
  }, error || helpText));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function Radio({
  label,
  checked,
  onChange,
  disabled
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      fontFamily: "var(--font-body)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => !disabled && onChange && onChange(true),
    style: {
      width: "20px",
      height: "20px",
      borderRadius: "var(--radius-full)",
      border: `1.5px solid ${checked ? "var(--brand-gold)" : "var(--line-strong)"}`,
      background: "var(--surface-card)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: "10px",
      height: "10px",
      borderRadius: "var(--radius-full)",
      background: "var(--brand-gold)"
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--ink-900)"
    }
  }, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function Select({
  label,
  options = [],
  value,
  onChange,
  disabled,
  placeholder = "Select"
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      fontFamily: "var(--font-body)",
      width: "100%"
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: "var(--ink-900)"
    }
  }, label), /*#__PURE__*/React.createElement("select", {
    value: value,
    onChange: onChange,
    disabled: disabled,
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-base)",
      padding: "11px 14px",
      borderRadius: "var(--radius-md)",
      border: "1.5px solid var(--line)",
      background: disabled ? "var(--surface-sunken)" : "var(--surface-card)",
      color: "var(--ink-900)",
      outline: "none",
      appearance: "none"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(opt => /*#__PURE__*/React.createElement("option", {
    key: opt.value ?? opt,
    value: opt.value ?? opt
  }, opt.label ?? opt))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({
  label,
  checked,
  onChange,
  disabled
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "10px",
      fontFamily: "var(--font-body)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      width: "40px",
      height: "24px",
      borderRadius: "var(--radius-full)",
      background: checked ? "var(--brand-violet)" : "var(--line-strong)",
      position: "relative",
      transition: "background var(--duration-fast) var(--ease-standard)",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "3px",
      left: checked ? "19px" : "3px",
      width: "18px",
      height: "18px",
      borderRadius: "var(--radius-full)",
      background: "#fff",
      transition: "left var(--duration-fast) var(--ease-standard)",
      boxShadow: "var(--shadow-xs)"
    }
  })), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--ink-900)"
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Footer.jsx
try { (() => {
function Footer() {
  const cols = [{
    title: "Learn",
    links: ["Courses", "AI Tools", "Certificates"]
  }, {
    title: "Company",
    links: ["About", "Careers", "Contact"]
  }, {
    title: "Legal",
    links: ["Terms", "Privacy"]
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--ink-900)",
      color: "#fff",
      padding: "56px 32px 32px",
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "32px",
      maxWidth: "var(--container-max)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "var(--text-lg)"
    }
  }, "Sabi", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--brand-gold)"
    }
  }, "Learn")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--ink-300)",
      fontSize: "var(--text-sm)",
      marginTop: "10px",
      maxWidth: "220px",
      lineHeight: "var(--leading-relaxed)"
    }
  }, "Learn a skill. Sabi it for life.")), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.title,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "10px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 700,
      color: "#fff"
    }
  }, c.title), c.links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--ink-300)",
      textDecoration: "none"
    }
  }, l))))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid rgba(255,255,255,0.1)",
      marginTop: "40px",
      paddingTop: "20px",
      textAlign: "center",
      color: "var(--ink-300)",
      fontSize: "var(--text-xs)"
    }
  }, "\xA9 2026 SabiLearn. Made in Nigeria."));
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Footer.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Navbar.jsx
try { (() => {
function Navbar({
  links = [],
  active,
  loggedIn = false,
  onLogin,
  onEnroll
}) {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 32px",
      background: "var(--surface-card)",
      borderBottom: "1px solid var(--line)",
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "var(--text-lg)",
      color: "var(--ink-900)"
    }
  }, "Sabi", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--brand-gold)"
    }
  }, "Learn")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: "28px"
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href || "#",
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      textDecoration: "none",
      color: l.label === active ? "var(--brand-gold-600)" : "var(--ink-700)"
    }
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "16px"
    }
  }, !loggedIn && /*#__PURE__*/React.createElement("a", {
    onClick: onLogin,
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: "var(--ink-700)",
      cursor: "pointer",
      textDecoration: "none"
    }
  }, "Log in"), /*#__PURE__*/React.createElement("button", {
    onClick: onEnroll,
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 600,
      fontSize: "var(--text-sm)",
      background: "var(--ink-900)",
      color: "#fff",
      border: "none",
      padding: "10px 20px",
      borderRadius: "var(--radius-md)",
      cursor: "pointer"
    }
  }, "Get started")));
}
Object.assign(__ds_scope, { Navbar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Navbar.jsx", error: String((e && e.message) || e) }); }

// components/overlay/Dialog.jsx
try { (() => {
function Dialog({
  open,
  title,
  children,
  onClose,
  footer
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      background: "rgba(14,14,26,0.55)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "var(--surface-card)",
      borderRadius: "var(--radius-xl)",
      padding: "28px",
      width: "min(440px, 90vw)",
      boxShadow: "var(--shadow-xl)",
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-lg)",
      fontWeight: 700,
      color: "var(--ink-900)"
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "20px",
      color: "var(--ink-500)",
      lineHeight: 1
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-base)",
      color: "var(--text-body)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px"
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlay/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/overlay/Tabs.jsx
try { (() => {
function Tabs({
  tabs = [],
  active,
  onChange
}) {
  const [internal, setInternal] = React.useState(tabs[0]?.value);
  const current = active ?? internal;
  const set = v => {
    setInternal(v);
    onChange && onChange(v);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "4px",
      background: "var(--surface-sunken)",
      padding: "4px",
      borderRadius: "var(--radius-lg)",
      fontFamily: "var(--font-body)",
      width: "fit-content"
    }
  }, tabs.map(t => {
    const isActive = t.value === current;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      onClick: () => set(t.value),
      style: {
        padding: "8px 18px",
        borderRadius: "var(--radius-md)",
        border: "none",
        fontSize: "var(--text-sm)",
        fontWeight: 600,
        cursor: "pointer",
        background: isActive ? "var(--surface-card)" : "transparent",
        color: isActive ? "var(--ink-900)" : "var(--ink-500)",
        boxShadow: isActive ? "var(--shadow-xs)" : "none",
        transition: "all var(--duration-fast) var(--ease-standard)"
      }
    }, t.label);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/overlay/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/AIToolDialog.jsx
try { (() => {
const {
  Button,
  Dialog,
  Badge
} = window.SabiLearnDesignSystem_2075a4;
function AIToolDialog({
  tool,
  onClose
}) {
  const [input, setInput] = React.useState("");
  const [result, setResult] = React.useState(null);
  if (!tool) return null;
  const run = () => setResult(SAMPLE_OUTPUT[tool.key]);
  return /*#__PURE__*/React.createElement(Dialog, {
    open: !!tool,
    title: tool.title,
    onClose: onClose,
    footer: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: run
    }, tool.cta)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "violet"
  }, "AI-generated"), /*#__PURE__*/React.createElement("textarea", {
    value: input,
    onChange: e => setInput(e.target.value),
    placeholder: "Paste your notes or ask a question...",
    rows: 4,
    style: {
      width: "100%",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-sm)",
      padding: "12px",
      borderRadius: "var(--radius-md)",
      border: "1.5px solid var(--line)",
      resize: "none",
      outline: "none",
      boxSizing: "border-box"
    }
  }), result && /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--brand-violet-100)",
      borderRadius: "var(--radius-md)",
      padding: "14px",
      fontSize: "var(--text-sm)",
      color: "var(--ink-900)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, result)));
}
const SAMPLE_OUTPUT = {
  summarizer: "Summary: Data normalization removes redundancy across tables; use 3NF for most transactional schemas.",
  quiz: "Q1. What does 3NF eliminate? A) Redundant data  B) Indexes  C) Foreign keys  D) Views",
  flashcards: "Card 1 — Front: 3NF · Back: Third Normal Form — no transitive dependencies.",
  qa: "Answer: 3NF requires the table to already be in 2NF, with no transitive dependency on the primary key."
};
window.AIToolDialog = AIToolDialog;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/AIToolDialog.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/App.jsx
try { (() => {
function App() {
  const [page, setPage] = React.useState("login");
  const [course, setCourse] = React.useState(null);
  const [activeTool, setActiveTool] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", null, page === "login" && /*#__PURE__*/React.createElement(window.Login, {
    onLogin: () => setPage("dashboard")
  }), page !== "login" && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 32px",
      background: "#fff",
      borderBottom: "1px solid var(--line)",
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "var(--text-lg)",
      color: "var(--ink-900)"
    }
  }, "Sabi", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--brand-gold)"
    }
  }, "Learn")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: "28px"
    }
  }, [["dashboard", "Dashboard"], ["catalog", "Courses"]].map(([key, label]) => /*#__PURE__*/React.createElement("a", {
    key: key,
    onClick: () => setPage(key),
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      cursor: "pointer",
      textDecoration: "none",
      color: page === key ? "var(--brand-gold-600)" : "var(--ink-700)"
    }
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "36px",
      height: "36px",
      borderRadius: "var(--radius-full)",
      background: "var(--ink-900)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "var(--text-sm)"
    }
  }, "A")), page === "dashboard" && /*#__PURE__*/React.createElement(window.Dashboard, {
    onOpenTool: setActiveTool,
    onOpenCatalog: () => setPage("catalog")
  }), page === "catalog" && /*#__PURE__*/React.createElement(window.CourseCatalog, {
    onOpenCourse: c => {
      setCourse(c);
      setPage("course");
    }
  }), page === "course" && /*#__PURE__*/React.createElement(window.CourseDetail, {
    course: course,
    onBack: () => setPage("catalog")
  })), /*#__PURE__*/React.createElement(window.AIToolDialog, {
    tool: activeTool,
    onClose: () => setActiveTool(null)
  }));
}
ReactDOM.createRoot(document.getElementById("root")).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/CourseCatalog.jsx
try { (() => {
const {
  CourseCard,
  Tabs,
  Badge
} = window.SabiLearnDesignSystem_2075a4;
const CATALOG = [{
  title: "Intro to Data Analysis",
  instructor: "Chidi Okafor",
  level: "Beginner",
  price: 5000,
  image: "../../assets/images/studying-laptop.jpg",
  cat: "tech"
}, {
  title: "UI/UX Foundations",
  instructor: "Funmi Bello",
  level: "Intermediate",
  price: 7500,
  image: "../../assets/images/students-stairs.jpg",
  cat: "design"
}, {
  title: "Chemistry for WAEC",
  instructor: "Dr. Ibrahim Musa",
  level: "Beginner",
  free: true,
  image: "../../assets/images/vial-gloved-hand.jpg",
  cat: "science"
}, {
  title: "Organic Chemistry Lab Skills",
  instructor: "Dr. Ibrahim Musa",
  level: "Advanced",
  price: 6000,
  image: "../../assets/images/lab-vials.jpg",
  cat: "science"
}, {
  title: "Digital Marketing Basics",
  instructor: "Kemi Alade",
  level: "Beginner",
  free: true,
  image: "../../assets/images/students-stairs.jpg",
  cat: "business"
}, {
  title: "Frontend Web Development",
  instructor: "Tunde Bakare",
  level: "Intermediate",
  price: 8500,
  image: "../../assets/images/studying-laptop.jpg",
  cat: "tech"
}];
function CourseCatalog({
  onOpenCourse
}) {
  const [tab, setTab] = React.useState("all");
  const filtered = tab === "all" ? CATALOG : CATALOG.filter(c => c.cat === tab);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "40px 32px 80px",
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 700,
      color: "var(--ink-900)",
      margin: "0 0 20px",
      letterSpacing: "var(--tracking-tight)"
    }
  }, "Courses"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "28px"
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    tabs: [{
      label: "All",
      value: "all"
    }, {
      label: "Tech",
      value: "tech"
    }, {
      label: "Design",
      value: "design"
    }, {
      label: "Science",
      value: "science"
    }, {
      label: "Business",
      value: "business"
    }],
    active: tab,
    onChange: setTab
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, 280px)",
      gap: "20px"
    }
  }, filtered.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.title,
    onClick: () => onOpenCourse(c),
    style: {
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(CourseCard, {
    image: c.image,
    level: c.level,
    title: c.title,
    instructor: c.instructor,
    price: c.price,
    free: c.free
  })))));
}
window.CourseCatalog = CourseCatalog;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/CourseCatalog.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/CourseDetail.jsx
try { (() => {
const {
  Button,
  Badge,
  Tabs
} = window.SabiLearnDesignSystem_2075a4;
function CourseDetail({
  course,
  onBack
}) {
  const [tab, setTab] = React.useState("overview");
  if (!course) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: "320px",
      background: "var(--ink-900)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: course.image,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity: 0.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "0 32px",
      maxWidth: "var(--container-max)",
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("a", {
    onClick: onBack,
    style: {
      color: "var(--ink-300)",
      fontSize: "var(--text-sm)",
      cursor: "pointer",
      marginBottom: "16px",
      textDecoration: "none"
    }
  }, "\u2190 Back to courses"), /*#__PURE__*/React.createElement(Badge, {
    tone: "gold"
  }, course.level), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 700,
      color: "#fff",
      margin: "12px 0 6px",
      letterSpacing: "var(--tracking-tight)"
    }
  }, course.title), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--ink-300)",
      fontSize: "var(--text-base)"
    }
  }, "Taught by ", course.instructor))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "36px 32px 80px",
      display: "grid",
      gridTemplateColumns: "1fr 320px",
      gap: "48px"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Tabs, {
    tabs: [{
      label: "Overview",
      value: "overview"
    }, {
      label: "Curriculum",
      value: "curriculum"
    }, {
      label: "Reviews",
      value: "reviews"
    }],
    active: tab,
    onChange: setTab
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "24px",
      color: "var(--text-body)",
      fontSize: "var(--text-base)",
      lineHeight: "var(--leading-relaxed)"
    }
  }, tab === "overview" && /*#__PURE__*/React.createElement("p", null, "Build practical, job-ready skills with hands-on projects, mentor feedback, and AI-assisted study tools built into every lesson."), tab === "curriculum" && /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      paddingLeft: "20px"
    }
  }, /*#__PURE__*/React.createElement("li", null, "Module 1 \u2014 Foundations"), /*#__PURE__*/React.createElement("li", null, "Module 2 \u2014 Core techniques"), /*#__PURE__*/React.createElement("li", null, "Module 3 \u2014 Applied project"), /*#__PURE__*/React.createElement("li", null, "Module 4 \u2014 Certification exam")), tab === "reviews" && /*#__PURE__*/React.createElement("p", null, "\"Clear, practical, and the AI quiz generator kept me on track.\" \u2014 Bola, student"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--surface-card)",
      borderRadius: "var(--radius-xl)",
      padding: "24px",
      boxShadow: "var(--shadow-sm)",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      height: "fit-content"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-2xl)",
      fontWeight: 700,
      color: "var(--ink-900)"
    }
  }, course.free ? "Free" : `₦${course.price?.toLocaleString()}`), /*#__PURE__*/React.createElement(Button, {
    fullWidth: true
  }, "Enroll now"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, "Full access \xB7 Certificate on completion \xB7 AI study tools included"))));
}
window.CourseDetail = CourseDetail;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/CourseDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/Dashboard.jsx
try { (() => {
const {
  Badge,
  CourseCard,
  AIToolCard,
  StatCard,
  ProgressBar
} = window.SabiLearnDesignSystem_2075a4;
const AI_TOOLS = [{
  key: "summarizer",
  title: "Summarizer",
  description: "Turn any lecture note or PDF into a short, clear summary.",
  cta: "Summarize a note"
}, {
  key: "quiz",
  title: "Quiz Generator",
  description: "Generate practice questions from your course material.",
  cta: "Generate a quiz"
}, {
  key: "flashcards",
  title: "Flashcards Generator",
  description: "Turn key terms into a spaced-repetition flashcard deck.",
  cta: "Build flashcards"
}, {
  key: "qa",
  title: "Q&A AI",
  description: "Ask a question about your course and get a grounded answer.",
  cta: "Ask a question"
}];
const ICONS = {
  summarizer: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M9 12h6m-6 4h6M9 8h1M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
  })),
  quiz: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z"
  })),
  flashcards: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M4 6h13a2 2 0 012 2v9a2 2 0 01-2 2H4V6zM4 6L9 3h9"
  })),
  qa: /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "22",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.8"
  }, /*#__PURE__*/React.createElement("path", {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    d: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zM21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
  }))
};
function Dashboard({
  onOpenTool,
  onOpenCatalog
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "40px 32px 80px",
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "36px"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 700,
      color: "var(--ink-900)",
      margin: "0 0 6px",
      letterSpacing: "var(--tracking-tight)"
    }
  }, "Welcome back, Ada."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      margin: 0,
      fontSize: "var(--text-base)"
    }
  }, "You're 62% through Data Analysis this week \u2014 keep going.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "16px",
      marginBottom: "44px",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    value: "12",
    label: "Courses enrolled",
    trend: "+2 this month"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: "86%",
    label: "Quiz average",
    trend: "+4% this month"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: "9-day",
    label: "Learning streak"
  }), /*#__PURE__*/React.createElement(StatCard, {
    value: "3",
    label: "Certificates earned"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: "44px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      marginBottom: "18px"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-xl)",
      fontWeight: 700,
      color: "var(--ink-900)",
      margin: 0
    }
  }, "Continue learning"), /*#__PURE__*/React.createElement("a", {
    onClick: onOpenCatalog,
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: 600,
      color: "var(--brand-gold-600)",
      cursor: "pointer",
      textDecoration: "none"
    }
  }, "Browse all courses")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "18px",
      overflowX: "auto",
      paddingBottom: "4px"
    }
  }, /*#__PURE__*/React.createElement(CourseCard, {
    image: "../../assets/images/studying-laptop.jpg",
    level: "Beginner",
    title: "Intro to Data Analysis",
    instructor: "Chidi Okafor",
    progress: 62
  }), /*#__PURE__*/React.createElement(CourseCard, {
    image: "../../assets/images/students-stairs.jpg",
    level: "Intermediate",
    title: "UI/UX Foundations",
    instructor: "Funmi Bello",
    progress: 28
  }), /*#__PURE__*/React.createElement(CourseCard, {
    image: "../../assets/images/vial-gloved-hand.jpg",
    level: "Beginner",
    title: "Chemistry for WAEC",
    instructor: "Dr. Ibrahim Musa",
    progress: 90
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-xl)",
      fontWeight: 700,
      color: "var(--ink-900)",
      margin: "0 0 18px"
    }
  }, "AI study tools"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "18px",
      flexWrap: "wrap"
    }
  }, AI_TOOLS.map(t => /*#__PURE__*/React.createElement(AIToolCard, {
    key: t.key,
    icon: ICONS[t.key],
    title: t.title,
    description: t.description,
    cta: t.cta,
    onClick: () => onOpenTool(t)
  })))));
}
window.Dashboard = Dashboard;
window.AI_TOOLS = AI_TOOLS;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/platform/Login.jsx
try { (() => {
const {
  Button,
  Input,
  Badge,
  ProgressBar
} = window.SabiLearnDesignSystem_2075a4;
function Login({
  onLogin
}) {
  const [mode, setMode] = React.useState("login");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      minHeight: "100vh",
      fontFamily: "var(--font-body)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "0 72px",
      gap: "28px",
      background: "var(--surface-page)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontWeight: 700,
      fontSize: "var(--text-lg)",
      color: "var(--ink-900)"
    }
  }, "Sabi", /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--brand-gold)"
    }
  }, "Learn")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-3xl)",
      fontWeight: 700,
      color: "var(--ink-900)",
      margin: "0 0 8px",
      letterSpacing: "var(--tracking-tight)"
    }
  }, mode === "login" ? "Welcome back." : "Create your account."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-muted)",
      fontSize: "var(--text-base)",
      margin: 0
    }
  }, mode === "login" ? "Log in to keep learning." : "Start free. Upgrade any time.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      maxWidth: "380px"
    }
  }, mode === "signup" && /*#__PURE__*/React.createElement(Input, {
    label: "Full name",
    placeholder: "Ada Eze"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Email address",
    placeholder: "you@example.com"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    type: "password",
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
  }), /*#__PURE__*/React.createElement(Button, {
    fullWidth: true,
    onClick: onLogin
  }, mode === "login" ? "Log in" : "Create account"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)"
    }
  }, mode === "login" ? "New here? " : "Already have an account? ", /*#__PURE__*/React.createElement("a", {
    onClick: () => setMode(mode === "login" ? "signup" : "login"),
    style: {
      color: "var(--brand-gold-600)",
      fontWeight: 600,
      cursor: "pointer",
      textDecoration: "none"
    }
  }, mode === "login" ? "Create an account" : "Log in")))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      background: "var(--ink-900)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/images/studying-laptop.jpg",
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity: 0.85
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      background: "linear-gradient(180deg, rgba(14,14,26,0.1), rgba(14,14,26,0.75))"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      bottom: "56px",
      left: "56px",
      right: "56px",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-2xl)",
      fontWeight: 700,
      lineHeight: "var(--leading-snug)",
      margin: "0 0 12px"
    }
  }, "\"SabiLearn's quiz generator turned my messy notes into a real study plan.\""), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--ink-300)"
    }
  }, "Amaka O. \u2014 Data Analysis student"))));
}
window.Login = Login;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/platform/Login.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.AIToolCard = __ds_scope.AIToolCard;

__ds_ns.CourseCard = __ds_scope.CourseCard;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.Navbar = __ds_scope.Navbar;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
