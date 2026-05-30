import type { IoniconName } from "@/src/components/ui/Icon/Icon.types";

/** EmptyStateCardProps supports compact first-run states for tabs and detail fallbacks. */
export type EmptyStateCardProps = {
  icon: IoniconName;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
};
