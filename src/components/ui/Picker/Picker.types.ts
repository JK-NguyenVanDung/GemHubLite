/** PickerProps mirrors Field visuals but delegates option selection to parent-owned sheets. */
export type PickerProps = {
  label: string;
  value?: string;
  placeholder?: string;
  onPress: () => void;
  required?: boolean;
  error?: string;
  helperText?: string;
  testID?: string;
};
