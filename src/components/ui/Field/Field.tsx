import { useState } from "react";
import { TextInput, View } from "react-native";

import { Text } from "@/src/components/ui/Text/Text";
import { useResponsiveLayout } from "@/src/lib/layout/useResponsiveColumns";
import { useTheme } from "@/src/theme";

import type { FieldProps } from "@/src/components/ui/Field/Field.types";

/** Field renders GemHub Lite form inputs with label, helper, and error text. */
export function Field({ error, helperText, hideLabel = false, label, multiline, onBlur, onFocus, required, style, testID, ...props }: FieldProps) {
  const theme = useTheme();
  const layout = useResponsiveLayout();
  const hasError = Boolean(error);
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ gap: layout.fieldGap }}>
      {hideLabel ? null : <Text variant="metadata" tone="secondary">{label}{required ? " *" : ""}</Text>}
      <TextInput
        maxFontSizeMultiplier={1.3}
        multiline={multiline}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        placeholderTextColor={theme.colors.inputPlaceholder}
        testID={testID}
        style={[
          theme.typography.body,
          {
            backgroundColor: theme.colors.surface,
            borderColor: hasError ? theme.colors.danger : focused ? theme.colors.accent : theme.colors.inputBorder,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            color: theme.colors.text,
            minHeight: multiline ? 104 : 44,
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
