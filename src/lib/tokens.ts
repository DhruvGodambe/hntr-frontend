export const surface = {
  page: "var(--e0)",
  nav: "var(--e1)",
  card: "var(--e2)",
  inner: "var(--e3)",
  pill: "var(--e4)",
  pressed: "var(--e5)",
} as const;

export const text = {
  t0: "var(--t0)",
  t1: "var(--t1)",
  t2: "var(--t2)",
  t3: "var(--t3)",
  t4: "var(--t4)",
} as const;

export const accent = {
  primary: "var(--accent)",
  primaryHover: "var(--accent-h)",
  success: "var(--green)",
  danger: "var(--red)",
} as const;

export const border = {
  subtle: "var(--bd0)",
  default: "var(--bd1)",
  strong: "var(--bd2)",
} as const;

export const shadow = {
  sm: "var(--sh1)",
  md: "var(--sh2)",
  lg: "var(--sh3)",
  xl: "var(--sh4)",
} as const;

export const radius = "var(--r)";

export const fontFamily = {
  sans: "var(--fn)",
  display: "var(--fd)",
  mono: "var(--fm)",
} as const;
