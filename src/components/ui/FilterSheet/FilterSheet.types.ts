import type { IoniconName } from "@/src/components/ui/Icon";

export type FilterOption = {
  label: string;
  value: string;
  icon?: IoniconName;
};

export type FilterGroup = {
  title: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};

export type FilterSheetProps = {
  visible: boolean;
  title: string;
  groups: FilterGroup[];
  onClose: () => void;
  testID?: string;
};
