/** ChipTone maps compact labels to neutral metadata or selected accent state. */
export type ChipTone = "neutral" | "accent" | "danger";

/** ChipProps renders SKU/filter pills without exposing raw colors. */
export type ChipProps = {
  label: string;
  tone?: ChipTone;
  testID?: string;
};
