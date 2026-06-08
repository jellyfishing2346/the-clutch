import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MOCK_USERS, MOCK_TRANSACTIONS } from '../../lib/mock-data'
import { CREDITS_CONFIG } from 'shared'

const ME = MOCK_USERS[0]
const CLUTCH_PURPLE = '#6355f5'

export default function CreditsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <View style={styles.header}>
        <Text style={styles.title}>Credits</Text>
        <Text style={styles.subtitle}>Earn by helping · Spend to get help</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
        {/* Balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceNum}>{ME.credits_balance}</Text>
          <Text style={styles.balanceLabel}>Clutch Credits</Text>
          <View style={styles.balanceMeta}>
            <Text style={styles.balanceMetaText}>↑ +30 this month</Text>
            <Text style={styles.balanceMetaText}>↓ -15 this month</Text>
          </View>
        </View>

        {/* Earn */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>↑ Ways to earn</Text>
          {[
            { emoji: '🤝', label: 'Help with a free task', amount: `+${CREDITS_CONFIG.earnPerHelpTask}` },
            { emoji: '⭐', label: 'Receive a 5-star review', amount: '+5' },
            { emoji: '🎁', label: 'Welcome bonus', amount: `+${CREDITS_CONFIG.bonusOnboarding}` },
          ].map(item => (
            <View key={item.label} style={styles.row}>
              <Text style={{ fontSize: 18, width: 30 }}>{item.emoji}</Text>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.earnAmount}>{item.amount} CR</Text>
            </View>
          ))}
        </View>

        {/* Spend */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>↓ Ways to spend</Text>
          {[
            { emoji: '🤝', label: 'Simple task', amount: `-${CREDITS_CONFIG.simpleTaskCost}` },
            { emoji: '🔧', label: 'Moderate task', amount: `-${CREDITS_CONFIG.moderateTaskCost}` },
            { emoji: '⚡', label: 'Skilled task', amount: `-${CREDITS_CONFIG.skilledTaskCost}` },
          ].map(item => (
            <View key={item.label} style={styles.row}>
              <Text style={{ fontSize: 18, width: 30 }}>{item.emoji}</Text>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.spendAmount}>{item.amount} CR</Text>
            </View>
          ))}
        </View>

        {/* History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>History</Text>
          {MOCK_TRANSACTIONS.map(tx => (
            <View key={tx.id} style={styles.txRow}>
              <View style={[styles.txIcon, { backgroundColor: tx.amount > 0 ? '#d1fae5' : '#fee2e2' }]}>
                <Text style={{ fontSize: 14 }}>{tx.type === 'bonus' ? '★' : tx.amount > 0 ? '↑' : '↓'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txDesc}>{tx.description}</Text>
                <Text style={styles.txDate}>{new Date(tx.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount > 0 ? '#059669' : '#374151' }]}>
                {tx.amount > 0 ? '+' : ''}{tx.amount} CR
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  title: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#111827' },
  subtitle: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6b7280', marginTop: 2 },
  balanceCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    backgroundColor: CLUTCH_PURPLE,
  },
  balanceNum: { fontFamily: 'Poppins_700Bold', fontSize: 64, color: '#fff', lineHeight: 72 },
  balanceLabel: { fontFamily: 'Poppins_500Medium', fontSize: 14, color: '#c4b5fd' },
  balanceMeta: { flexDirection: 'row', gap: 16, marginTop: 12 },
  balanceMetaText: { fontFamily: 'Poppins_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#111827', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  rowLabel: { flex: 1, fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#374151' },
  earnAmount: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: '#059669' },
  spendAmount: { fontFamily: 'Poppins_700Bold', fontSize: 13, color: CLUTCH_PURPLE },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  txIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  txDesc: { fontFamily: 'Poppins_500Medium', fontSize: 12, color: '#111827' },
  txDate: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#9ca3af', marginTop: 1 },
  txAmount: { fontFamily: 'Poppins_700Bold', fontSize: 13 },
})
