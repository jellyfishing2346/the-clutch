import { View, Text, FlatList, Pressable, TextInput, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { router } from 'expo-router'
import { MOCK_TASKS } from '../../lib/mock-data'
import { TASK_CATEGORIES } from 'shared'
import type { Task } from 'shared'

const CLUTCH_PURPLE = '#6355f5'

function TaskRow({ task }: { task: Task }) {
  const cat = TASK_CATEGORIES[task.category]
  return (
    <Pressable style={styles.taskRow} onPress={() => router.push(`/tasks/${task.id}` as any)}>
      <View style={styles.taskIconWrap}>
        <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
        <Text style={styles.taskMeta}>{task.neighborhood} · {cat.label}</Text>
        {task.applicant_count > 0 && (
          <Text style={styles.applicantCount}>
            {task.applicant_count} {task.applicant_count === 1 ? 'offer' : 'offers'}
          </Text>
        )}
      </View>
      <View style={styles.paymentPill}>
        <Text style={styles.paymentText}>
          {task.payment_type === 'credits'
            ? `◈${task.credits_amount}`
            : task.payment_type === 'cash'
              ? `$${task.payment_amount}`
              : task.payment_type === 'exchange'
                ? '⇄'
                : '♥'}
        </Text>
      </View>
    </Pressable>
  )
}

export default function TasksScreen() {
  const [search, setSearch] = useState('')
  const tasks = MOCK_TASKS.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse Tasks</Text>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={t => t.id}
        renderItem={({ item }) => <TaskRow task={item} />}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <Text style={{ fontSize: 40 }}>🔍</Text>
            <Text style={{ fontFamily: 'Poppins_500Medium', color: '#6b7280', marginTop: 10 }}>
              No tasks found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#111827' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#111827',
  },
  taskRow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  taskIconWrap: {
    width: 44,
    height: 44,
    backgroundColor: '#ede9fe',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#111827' },
  taskMeta: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: '#9ca3af', marginTop: 2 },
  applicantCount: { fontFamily: 'Poppins_500Medium', fontSize: 10, color: CLUTCH_PURPLE, marginTop: 2 },
  paymentPill: {
    backgroundColor: '#ede9fe',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  paymentText: { fontFamily: 'Poppins_700Bold', fontSize: 11, color: CLUTCH_PURPLE },
})
