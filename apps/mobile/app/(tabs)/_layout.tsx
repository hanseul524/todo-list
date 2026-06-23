import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#5e6ad2",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          borderTopColor: "#e5e7eb",
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: "카테고리",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
