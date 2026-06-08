import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MOCK_TASKS, MOCK_USERS } from '../../lib/mock-data'
import { TASK_CATEGORIES } from 'shared'

const ME = MOCK_USERS[0]
const CLUTCH_PURPLE = '#6355f5'

export default function MapScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {ME.name.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreeting}>Jackson Heights · Queens</Text>
        </View>
        <View style={styles.creditsBadge}>
          <Text style={styles.creditsText}>◈ {ME.credits_balance}</Text>
        </View>
      </View>

      {/* Map placeholder */}
      <View style={styles.mapContainer}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={styles.mapTitle}>Map View</Text>
        <Text style={styles.mapSubtitle}>
          Live map with Mapbox enabled{'\n'}in production
        </Text>
        {/* Simulated task pins */}
        <View style={styles.pins}>
          {MOCK_TASKS.slice(0, 4).map((task, i) => (
            <Pressable
              key={task.id}
              style={[
                styles.pin,
                {
                  left: `${20 + (i * 20) % 55}%` as any,
                  top: `${25 + (i * 18) % 45}%` as any,
                },
              ]}
              onPress={() => router.push(`/tasks/${task.id}` as any)}
            >
              <Text style={{ fontSize: 16 }}>{TASK_CATEGORIES[task.category]?.icon ?? '📍'}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Nearby tasks */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Nearby tasks</Text>
        <Pressable onPress={() => router.push('/tasks' as any)}>
          <Text style={styles.seeAll}>See all →</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.taskScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
        {MOCK_TASKS.slice(0, 4).map(task => (
          <Pressable
            key={task.id}
            style={styles.taskChip}
            onPress={() => router.push(`/tasks/${task.id}` as any)}
          >
            <Text style={{ fontSize: 20 }}>{TASK_CATEGORIES[task.category]?.icon}</Text>
            <Text style={styles.taskChipTitle} numberOfLines={2}>{task.title}</Text>
            <Text style={styles.taskChipNeighborhood}>{task.neighborhood}</Text>
            <View style={styles.taskChipPayment}>
              <Text style={styles.taskChipPaymentText}>
                {task.payment_type === 'credits'
                  ? `◈ ${task.credits_amount} CR`
                  : task.payment_type === 'cash'
                    ? `$ ${task.payment_amount}`
                    : task.payment_type === 'exchange'
                      ? '⇄ Exchange'
                      : '♥ Free'}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  greeting: { fontFamily: 'Poppins_700Bold', fontSize: 18, color: '#111827' },
  subGreeting: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6b7280' },
  creditsBadge: {
    backgroundColor: CLUTCH_PURPLE,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  creditsText: { fontFamily: 'Poppins_600SemiBold', color: '#fff', fontSize: 13 },
  mapContainer: {
    margin: 16,
    height: 200,
    backgroundColor: '#ede9fe',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mapEmoji: { fontSize: 32, marginBottom: 6 },
  mapTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#4c1d95' },
  mapSubtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#7c3aed', textAlign: 'center', marginTop: 4 },
  pins: { position: 'absolute', width: '100%', height: '100%' },
  pin: {
    position: 'absolute',
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#111827' },
  seeAll: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: CLUTCH_PURPLE },
  taskScroll: { flexGrow: 0 },
  taskChip: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  taskChipTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 12, color: '#111827', marginTop: 6, lineHeight: 17 },
  taskChipNeighborhood: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9ca3af', marginTop: 3 },
  taskChipPayment: {
    marginTop: 8,
    backgroundColor: '#ede9fe',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  taskChipPaymentText: { fontFamily: 'Poppins_600SemiBold', fontSize: 10, color: CLUTCH_PURPLE },
})
