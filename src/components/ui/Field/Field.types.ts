import type { TextInputProps } from "react-native";

/** FieldProps renders a controlled or uncontrolled input shell; parent owns validation + persistence. */
export type FieldProps = TextInputProps & {
  label: string;
  hideLabel?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  testID?: string;
};
