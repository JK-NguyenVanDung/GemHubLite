import type { PropsWithChildren, ReactNode } from "react";
import type { ScrollViewProps, StyleProp, ViewStyle } from "react-native";
import type { Edge } from "react-native-safe-area-context";

/** ScreenProps defines the safe-area page shell used by router screens. */
export type ScreenProps = PropsWithChildren<
  Pick<ScrollViewProps, "testID"> & {
    footer?: ReactNode;
    scroll?: boolean;
    constrainContent?: boolean;
    safeAreaEdges?: Edge[];
    contentStyle?: StyleProp<ViewStyle>;
  }
>;
