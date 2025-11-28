import { StyleSheet, ScrollView } from 'react-native';
import { Text, View } from '@/components/Themed';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react-native';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Portfolio Card */}
      <View style={styles.card}>
        <Text style={styles.label}>Total Equity</Text>
        <Text style={styles.balance}>$2,450,120.50</Text>
        <View style={styles.pnlContainer}>
          <TrendingUp size={16} color="#00FF94" />
          <Text style={styles.pnlText}>+$12,450.00 (0.51%)</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.iconBg, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <DollarSign size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statLabel}>Available</Text>
          <Text style={styles.statValue}>$850k</Text>
        </View>
        <View style={styles.statCard}>
          <View style={[styles.iconBg, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
            <Activity size={20} color="#F59E0B" />
          </View>
          <Text style={styles.statLabel}>Active</Text>
          <Text style={styles.statValue}>12 Pos</Text>
        </View>
      </View>

      {/* Recent Positions */}
      <Text style={styles.sectionTitle}>Active Positions</Text>

      <View style={styles.positionCard}>
        <View style={styles.positionHeader}>
          <View style={styles.coinInfo}>
            <View style={styles.coinIcon} />
            <Text style={styles.coinSymbol}>BTC/USDT</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>LONG</Text>
            </View>
          </View>
          <Text style={styles.pnlPositive}>+$4,250.00</Text>
        </View>
        <View style={styles.positionDetails}>
          <View>
            <Text style={styles.detailLabel}>Size</Text>
            <Text style={styles.detailValue}>2.5 BTC</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.detailLabel}>Entry</Text>
            <Text style={styles.detailValue}>$64,250.00</Text>
          </View>
        </View>
      </View>

      <View style={styles.positionCard}>
        <View style={styles.positionHeader}>
          <View style={styles.coinInfo}>
            <View style={[styles.coinIcon, { backgroundColor: '#627EEA' }]} />
            <Text style={styles.coinSymbol}>ETH/USDT</Text>
            <View style={[styles.badge, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
              <Text style={[styles.badgeText, { color: '#EF4444' }]}>SHORT</Text>
            </View>
          </View>
          <Text style={styles.pnlNegative}>-$120.50</Text>
        </View>
        <View style={styles.positionDetails}>
          <View>
            <Text style={styles.detailLabel}>Size</Text>
            <Text style={styles.detailValue}>50 ETH</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.detailLabel}>Entry</Text>
            <Text style={styles.detailValue}>$3,450.00</Text>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pnlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pnlText: {
    color: '#00FF94',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  positionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  coinIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F7931A',
  },
  coinSymbol: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 255, 148, 0.2)',
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00FF94',
  },
  pnlPositive: {
    color: '#00FF94',
    fontWeight: 'bold',
  },
  pnlNegative: {
    color: '#EF4444',
    fontWeight: 'bold',
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
