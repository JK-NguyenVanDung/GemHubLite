import { TextInput, View } from "react-native";

import { Text } from "@/src/components/ui/Text/Text";
import { useTheme } from "@/src/theme";

import type { FieldProps } from "@/src/components/ui/Field/Field.types";

/** Field renders GemHub Lite form inputs with label, helper, and error text. */
export function Field({ error, helperText, label, multiline, required, style, testID, ...props }: FieldProps) {
  const theme = useTheme();
  const hasError = Boolean(error);

  return (
    <View style={{ gap: theme.spacing.xs }}>
      <Text variant="metadata" tone="secondary">
        {label}{required ? " *" : ""}
      </Text>
      <TextInput
        multiline={multiline}
        placeholderTextColor={theme.colors.tertiaryText}
        testID={testID}
        style={[
          theme.typography.body,
          {
            backgroundColor: theme.colors.surfaceMuted,
            borderColor: hasError ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            color: theme.colors.text,
            minHeight: multiline ? 92 : 46,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            textAlignVertical: multiline ? "top" : "center",
          },
          style,
        ]}
        {...props}
      />
      {hasError ? <Text variant="metadata" tone="danger">{error}</Text> : helperText ? <Text variant="metadata" tone="tertiary">{helperText}</Text> : null}
    </View>
  );
}
