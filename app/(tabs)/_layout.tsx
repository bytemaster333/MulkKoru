import { Tabs } from 'expo-router';
import { LayoutDashboard, Building2, Users, Calendar } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:            false,
        tabBarStyle: {
          backgroundColor:      Colors.dark.surface,
          borderTopColor:       Colors.dark.border,
          borderTopWidth:       1,
          height:               64,
          paddingBottom:        10,
          paddingTop:           8,
        },
        tabBarActiveTintColor:   Colors.brand.DEFAULT,
        tabBarInactiveTintColor: Colors.dark.muted,
        tabBarLabelStyle: {
          fontSize:    11,
          fontWeight:  '600',
          marginTop:   2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Özet',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: 'Mülkler',
          tabBarIcon: ({ color, size }) => (
            <Building2 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tenants"
        options={{
          title: 'Kiracılar',
          tabBarIcon: ({ color, size }) => (
            <Users size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Takvim',
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
