import { Tabs } from "expo-router";
import { View } from "react-native";

import { Icon } from "@/src/components/ui";
import { useTheme } from "@/src/theme";
import type { IoniconName } from "@/src/components/ui";

function TabIcon({ focused, icon }: { focused: boolean; icon: IoniconName }) {
  return <Icon name={icon} size={22} tone={focused ? "accent" : "secondary"} />;
}

function CameraIcon({ focused }: { focused: boolean }) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        backgroundColor: focused ? theme.colors.accent : theme.colors.accentDark,
        borderColor: theme.colors.surface,
        borderRadius: theme.radius.pill,
        borderWidth: 4,
        height: 58,
        justifyContent: "center",
        marginTop: -22,
        width: 58,
      }}
    >
      <Icon name="camera" size={24} tone="onAccent" />
    </View>
  );
}

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accentDark,
        tabBarInactiveTintColor: theme.colors.secondaryText,
        tabBarLabelStyle: theme.typography.metadata,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 78,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="home-outline" />,
        }}
      />
      <Tabs.Screen
        name="media"
        options={{
          title: "Media",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="images-outline" />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          tabBarStyle: { display: "none" },
          title: "Camera",
          tabBarIcon: ({ focused }) => <CameraIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="diamond-outline" />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="ellipsis-horizontal" />,
        }}
      />
    </Tabs>
  );
}
