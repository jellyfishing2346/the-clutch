import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MOCK_USERS, MOCK_REVIEWS } from '../../lib/mock-data'
import { TRUST_LEVELS, SUPPORTED_LANGUAGES } from 'shared'

const ME = MOCK_USERS[0]
const CLUTCH_PURPLE = '#6355f5'

const TRUST_COLORS = {
  new: '#6b7280',
  established: '#2563eb',
  trusted: '#7c3aed',
  verified: '#059669',
}

export default function ProfileScreen() {
  const trustInfo = TRUST_LEVELS[ME.trust_level]
  const reviews = MOCK_REVIEWS.filter(r => r.reviewee_id === ME.id)
  const langLabels = ME.languages.map(
    code => SUPPORTED_LANGUAGES.find(l => l.code === code)?.label ?? code
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile hero */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 40 }}>👤</Text>
          </View>
          <Text style={styles.name}>{ME.name}</Text>
          <Text style={styles.location}>{ME.neighborhood}, {ME.borough}</Text>
          <View style={[styles.trustBadge, { borderColor: TRUST_COLORS[ME.trust_level] }]}>
            <Text style={[styles.trustText, { color: TRUST_COLORS[ME.trust_level] }]}>
              ★ {trustInfo.label}
            </Text>
          </View>
          <Text style={styles.rating}>
            {'★'.repeat(Math.round(ME.rating_avg))} {ME.rating_avg.toFixed(1)} ({ME.rating_count} reviews)
          </Text>
          {ME.bio && <Text style={styles.bio}>{ME.bio}</Text>}
        </View>

        <View style={{ padding: 16, gap: 14 }}>
          {/* Stats */}
          <View style={styles.statsGrid}>
            {[
              { label: 'Done', value: ME.tasks_completed },
              { label: 'Posted', value: ME.tasks_posted },
              { label: 'Credits', value: ME.credits_balance },
              { label: 'Reviews', value: ME.rating_count },
            ].map(s => (
              <View key={s.label} style={styles.statBox}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Languages */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Languages</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {langLabels.map(lang => (
                <View key={lang} style={styles.langPill}>
                  <Text style={styles.langText}>{lang}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Trust info */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trust level: {trustInfo.label}</Text>
            {trustInfo.requirements.map(req => (
              <View key={req} style={styles.reqRow}>
                <Text style={{ color: '#059669' }}>✓</Text>
                <Text style={styles.reqText}>{req}</Text>
              </View>
            ))}
            {ME.is_id_verified && (
              <View style={styles.reqRow}>
                <Text style={{ color: '#059669' }}>✓</Text>
                <Text style={[styles.reqText, { color: '#059669', fontFamily: 'Poppins_600SemiBold' }]}>
                  ID Verified
                </Text>
              </View>
            )}
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Reviews ({reviews.length})</Text>
              {reviews.map(r => (
                <View key={r.id} style={styles.reviewItem}>
                  <Text style={styles.reviewStars}>{'★'.repeat(r.rating)}</Text>
                  <Text style={styles.reviewComment}>&ldquo;{r.comment}&rdquo;</Text>
                  <Text style={styles.reviewAuthor}>— {r.reviewer?.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    paddingTop: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { fontFamily: 'Poppins_700Bold', fontSize: 20, color: '#111827' },
  location: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#6b7280', marginTop: 2 },
  trustBadge: {
    marginTop: 10,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  trustText: { fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  rating: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#92400e', marginTop: 6 },
  bio: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
  statsGrid: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  statValue: { fontFamily: 'Poppins_700Bold', fontSize: 22, color: CLUTCH_PURPLE },
  statLabel: { fontFamily: 'Poppins_400Regular', fontSize: 10, color: '#6b7280', marginTop: 2 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', fontSize: 14, color: '#111827', marginBottom: 12 },
  langPill: { backgroundColor: '#ede9fe', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  langText: { fontFamily: 'Poppins_500Medium', fontSize: 11, color: CLUTCH_PURPLE },
  reqRow: { flexDirection: 'row', gap: 8, paddingVertical: 4, alignItems: 'center' },
  reqText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#374151' },
  reviewItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  reviewStars: { color: '#d97706', fontSize: 14 },
  reviewComment: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#374151', fontStyle: 'italic', marginTop: 3 },
  reviewAuthor: { fontFamily: 'Poppins_500Medium', fontSize: 11, color: '#9ca3af', marginTop: 3 },
})
