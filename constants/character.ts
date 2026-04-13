export const COMPLEXITY_LABEL = ["", "Passive", "Simple", "Recurring", "State-tracking", "Multi-state"];

export const SEVERITY_STYLES: Record<string, { border: string; bg: string; icon: string; label: string }> = {
  critical: {
    border: "#8b1a1a",
    bg: "#1a0808",
    icon: "⚠",
    label: "Critical"
  },
  important: {
    border: "#7a5a00",
    bg: "#1a1500",
    icon: "⚡",
    label: "Important"
  },
  tip: { border: "#1a4a2e", bg: "#0a1a10", icon: "💡", label: "Tip" }
};

// Jinx interactions get their own distinct visual treatment
export const JINX_STYLE = {
  border: "#7a6200",
  bg: "#1a1500",
  icon: "⚖",
  label: "Djinn Jinx"
};
