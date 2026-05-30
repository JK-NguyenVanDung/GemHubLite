export const colors = {
  background: "#F7FAFA",
  surface: "#FFFFFF",
  surfaceMuted: "#F2F5F5",
  text: "#111827",
  secondaryText: "#6B7280",
  tertiaryText: "#9CA3AF",
  border: "#E5ECEC",
  accent: "#18B8B8",
  accentDark: "#079999",
  accentSoft: "#E8FAFA",
  danger: "#EF4444",
  cameraPanel: "#F5F7F7",
  black: "#050505",
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  screenTitle: { fontSize: 22, fontWeight: "700" as const, lineHeight: 28 },
  sectionTitle: { fontSize: 13, fontWeight: "700" as const, lineHeight: 18, letterSpacing: 0.4 },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  bodyStrong: { fontSize: 15, fontWeight: "700" as const, lineHeight: 22 },
  metadata: { fontSize: 12, fontWeight: "500" as const, lineHeight: 16 },
  sku: { fontSize: 12, fontWeight: "700" as const, lineHeight: 16 },
  button: { fontSize: 14, fontWeight: "700" as const, lineHeight: 18 },
} as const;

export const shadows = {
  card: {
    boxShadow: "0 6px 14px rgba(15, 23, 42, 0.06)",
  },
} as const;
