import { Component, type ErrorInfo, type ReactNode } from "react";
import { View } from "react-native";

import { Button, Card, Text } from "@/src/components/ui";
import { colors, spacing } from "@/src/theme/tokens";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.error("Unhandled app error", error, info.componentStack);
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={{ flex: 1, justifyContent: "center", padding: spacing.md, backgroundColor: colors.background }}>
        <Card style={{ gap: spacing.md }}>
          <Text variant="screenTitle">Something went wrong</Text>
          <Text variant="body" tone="secondary">GemHub Lite kept your local data safe. Restart this screen and try again.</Text>
          <Button label="Retry" onPress={() => this.setState({ error: null })} />
        </Card>
      </View>
    );
  }
}
