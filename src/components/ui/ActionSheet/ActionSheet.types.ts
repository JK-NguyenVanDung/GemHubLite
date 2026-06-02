import type { IoniconName } from "@/src/components/ui/Icon/Icon.types";

/** ActionSheetOption renders one tappable row inside the sheet. */
export type ActionSheetOption = {
  label: string;
  icon?: IoniconName;
  destructive?: boolean;
  /** Marks the row as the active choice so reopening the sheet shows current selection. */
  selected?: boolean;
  onPress: () => void;
  testID?: string;
};

/**
 * ActionSheetProps drives a cross-platform bottom sheet.
 * Parent owns `visible` so closing flows match controlled-component conventions.
 */
export type ActionSheetProps = {
  visible: boolean;
  title?: string;
  options: ActionSheetOption[];
  onClose: () => void;
  testID?: string;
};
