import { Tabs } from 'expo-router'
import { View, Text, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const CLUTCH_PURPLE = '#6355f5'

interface TabIconProps {
  emoji: string
  label: string
  focused: boolean
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
  return (
    <View className="items-center justify-center pt-1">
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 10,
          fontFamily: 'Poppins_500Medium',
          color: focused ? CLUTCH_PURPLE : '#9ca3af',
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  )
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopColor: '#f3f4f6',
          backgroundColor: '#ffffff',
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" label="Map" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Tasks" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: focused ? '#4530d4' : CLUTCH_PURPLE,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
                shadowColor: CLUTCH_PURPLE,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text style={{ color: 'white', fontSize: 26, lineHeight: 30 }}>+</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="credits"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="◈" label="Credits" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Me" focused={focused} />,
        }}
      />
    </Tabs>
  )
}
