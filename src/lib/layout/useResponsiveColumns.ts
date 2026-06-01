import { useWindowDimensions } from "react-native";

export function useResponsiveColumns({ compact, expanded, medium }: { compact: number; medium: number; expanded: number }) {
  const { width } = useWindowDimensions();

  if (width >= 900) return expanded;
  if (width >= 600) return medium;
  return compact;
}

export function useResponsiveLayout() {
  const { height, width } = useWindowDimensions();
  const isCompactWidth = width < 360;
  const isMediumWidth = width >= 600;
  const isExpandedWidth = width >= 900;
  const isShortHeight = height < 720;

  return {
    cardPadding: isExpandedWidth ? 18 : isCompactWidth ? 10 : 12,
    contentMaxWidth: isExpandedWidth ? 960 : isMediumWidth ? 720 : undefined,
    contentGap: isShortHeight ? 12 : 16,
    fieldGap: isShortHeight ? 8 : 10,
    gridGap: isMediumWidth ? 14 : 12,
    pagePadding: isExpandedWidth ? 24 : isMediumWidth ? 20 : isCompactWidth ? 12 : 16,
    tabBarBottomPadding: isShortHeight ? 104 : 112,
  };
}
