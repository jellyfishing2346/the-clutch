import { View, Text, ScrollView, Pressable, TextInput, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'
import { router } from 'expo-router'
import { TASK_CATEGORIES } from 'shared'
import type { TaskCategory, PaymentType } from 'shared'

const CLUTCH_PURPLE = '#6355f5'

const PAYMENT_OPTIONS: { value: PaymentType; label: string; emoji: string }[] = [
  { value: 'credits', label: 'Credits', emoji: '◈' },
  { value: 'cash', label: 'Cash', emoji: '$' },
  { value: 'exchange', label: 'Exchange', emoji: '⇄' },
  { value: 'free', label: 'Free', emoji: '♥' },
]

export default function PostScreen() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TaskCategory | ''>('')
  const [payment, setPayment] = useState<PaymentType>('credits')
  const [submitting, setSubmitting] = useState(false)

  async function handlePost() {
    if (!title || !description || !category) return
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 900))
    setSubmitting(false)
    router.push('/tasks' as any)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={styles.header}>
        <Text style={styles.title}>Post a task</Text>
        <Text style={styles.subtitle}>Tell neighbors what you need.</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View>
          <Text style={styles.label}>What do you need? *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Help carry groceries from the store"
            placeholderTextColor="#9ca3af"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Category */}
        <View>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.categoryGrid}>
            {(Object.entries(TASK_CATEGORIES) as [TaskCategory, typeof TASK_CATEGORIES[TaskCategory]][]).slice(0, 8).map(([key, cat]) => (
              <Pressable
                key={key}
                style={[styles.categoryChip, category === key && styles.categoryChipSelected]}
                onPress={() => setCategory(key)}
              >
                <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
                <Text style={[styles.categoryLabel, category === key && styles.categoryLabelSelected]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Description */}
        <View>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Add more detail — how long it'll take, any requirements..."
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={600}
          />
          <Text style={styles.charCount}>{description.length}/600</Text>
        </View>

        {/* Payment */}
        <View>
          <Text style={styles.label}>Payment type *</Text>
          <View style={styles.paymentRow}>
            {PAYMENT_OPTIONS.map(opt => (
              <Pressable
                key={opt.value}
                style={[styles.paymentOption, payment === opt.value && styles.paymentOptionSelected]}
                onPress={() => setPayment(opt.value)}
              >
                <Text style={{ fontSize: 18 }}>{opt.emoji}</Text>
                <Text style={[styles.paymentLabel, payment === opt.value && styles.paymentLabelSelected]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Submit */}
        <Pressable
          style={[styles.submitBtn, (!title || !description || !category) && styles.submitBtnDisabled]}
          onPress={handlePost}
          disabled={submitting || !title || !description || !category}
        >
          <Text style={styles.submitText}>
            {submitting ? 'Posting...' : '🚀 Post task'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#111827' },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6b7280', marginTop: 2 },
  label: { fontFamily: 'Poppins_600SemiBold', fontSize: 13, color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  charCount: { textAlign: 'right', fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9ca3af', marginTop: 4 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  categoryChipSelected: { borderColor: CLUTCH_PURPLE, backgroundColor: '#ede9fe' },
  categoryLabel: { fontFamily: 'Poppins_500Medium', fontSize: 10, color: '#374151', marginTop: 4, textAlign: 'center' },
  categoryLabelSelected: { color: CLUTCH_PURPLE },
  paymentRow: { flexDirection: 'row', gap: 8 },
  paymentOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  paymentOptionSelected: { borderColor: CLUTCH_PURPLE, backgroundColor: '#ede9fe' },
  paymentLabel: { fontFamily: 'Poppins_500Medium', fontSize: 10, color: '#374151', marginTop: 4 },
  paymentLabelSelected: { color: CLUTCH_PURPLE },
  submitBtn: {
    backgroundColor: CLUTCH_PURPLE,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { fontFamily: 'Poppins_700Bold', color: '#fff', fontSize: 15 },
})
