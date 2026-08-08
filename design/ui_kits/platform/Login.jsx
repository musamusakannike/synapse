const { Button, Input, Badge, ProgressBar } = window.SabiLearnDesignSystem_2075a4;

function Login({ onLogin }) {
  const [mode, setMode] = React.useState("login");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px", gap: "28px", background: "var(--surface-page)" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--ink-900)" }}>
          Sabi<span style={{ color: "var(--brand-gold)" }}>Learn</span>
        </div>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, color: "var(--ink-900)", margin: "0 0 8px", letterSpacing: "var(--tracking-tight)" }}>
            {mode === "login" ? "Welcome back." : "Create your account."}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-base)", margin: 0 }}>
            {mode === "login" ? "Log in to keep learning." : "Start free. Upgrade any time."}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "380px" }}>
          {mode === "signup" && <Input label="Full name" placeholder="Ada Eze" />}
          <Input label="Email address" placeholder="you@example.com" />
          <Input label="Password" type="password" placeholder="••••••••" />
          <Button fullWidth onClick={onLogin}>{mode === "login" ? "Log in" : "Create account"}</Button>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
            {mode === "login" ? "New here? " : "Already have an account? "}
            <a onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ color: "var(--brand-gold-600)", fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>
              {mode === "login" ? "Create an account" : "Log in"}
            </a>
          </span>
        </div>
      </div>
      <div style={{ position: "relative", background: "var(--ink-900)", overflow: "hidden" }}>
        <img src="../../assets/images/studying-laptop.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(14,14,26,0.1), rgba(14,14,26,0.75))" }} />
        <div style={{ position: "absolute", bottom: "56px", left: "56px", right: "56px", color: "#fff" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 700, lineHeight: "var(--leading-snug)", margin: "0 0 12px" }}>
            "SabiLearn's quiz generator turned my messy notes into a real study plan."
          </p>
          <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-300)" }}>Amaka O. — Data Analysis student</span>
        </div>
      </div>
    </div>
  );
}
window.Login = Login;
