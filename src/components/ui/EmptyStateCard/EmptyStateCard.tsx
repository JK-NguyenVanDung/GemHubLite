import { View } from "react-native";

import { Button } from "@/src/components/ui/Button/Button";
import { Card } from "@/src/components/ui/Card/Card";
import { Icon } from "@/src/components/ui/Icon/Icon";
import { Text } from "@/src/components/ui/Text/Text";
import { useTheme } from "@/src/theme";

import type { EmptyStateCardProps } from "@/src/components/ui/EmptyStateCard/EmptyStateCard.types";

/** EmptyStateCard explains empty tabs and offers one next action without domain coupling. */
export function EmptyStateCard({ actionLabel, body, icon, onAction, testID, title }: EmptyStateCardProps) {
  const theme = useTheme();

  return (
    <Card testID={testID} style={{ alignItems: "center", gap: theme.spacing.sm, paddingVertical: theme.spacing.xl }}>
      <View
        style={{
          alignItems: "center",
          backgroundColor: theme.colors.accentSoft,
          borderRadius: theme.radius.pill,
          height: 48,
          justifyContent: "center",
          width: 48,
        }}
      >
        <Icon name={icon} size={24} tone="accent" />
      </View>
      <Text variant="bodyStrong" align="center">
        {title}
      </Text>
      <Text variant="body" tone="secondary" align="center">
        {body}
      </Text>
      {actionLabel ? <Button label={actionLabel} onPress={onAction} variant={onAction ? "primary" : "secondary"} /> : null}
    </Card>
  );
}
