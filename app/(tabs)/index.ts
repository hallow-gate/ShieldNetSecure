import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useSecurityScan } from '../../hooks/useSecurityScan';
import { GlassCard } from '../../components/ui/GlassCard';
import { SecurityShield } from '../../components/ui/SecurityShield';
import { WeatherWidget } from '../../components/ui/WeatherWidget';
import { RadarAnimation } from '../../components/ui/RadarAnimation';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { isDark, colors } = useTheme();
  const { securityScore, recentThreats, scanNow } = useSecurityScan();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const getSecurityStatusColor = () => {
    if (securityScore.overall >= 90) return '#10B981';
    if (securityScore.overall >= 70) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={isDark ? 
          ['#0A0E21', '#1A1F3A', '#0A0E21'] : 
          ['#F0F4FF', '#E8EEFF', '#F0F4FF']
        }
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            Welcome back
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            ShieldNet Secure
          </Text>
        </View>
        <View style={styles.headerRight}>
          <RadarAnimation size={40} />
        </View>
      </View>

      {/* Security Score Card */}
      <Animated.View 
        style={[
          styles.scoreCard,
          { opacity: fadeAnim, transform: [{ scale: pulseAnim }] }
        ]}
      >
        <GlassCard style={styles.scoreCardInner}>
          <LinearGradient
            colors={['rgba(96, 165, 250, 0.1)', 'rgba(139, 92, 246, 0.1)']}
            style={styles.scoreGradient}
          >
            <View style={styles.scoreHeader}>
              <SecurityShield size={60} color={getSecurityStatusColor()} />
              <View style={styles.scoreInfo}>
                <Text style={[styles.scoreNumber, { color: colors.text }]}>
                  {securityScore.overall}%
                </Text>
                <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
                  Security Score
                </Text>
              </View>
            </View>
            
            <View style={styles.scoreMetrics}>
              <View style={styles.metric}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                <Text style={[styles.metricText, { color: colors.text }]}>
                  {securityScore.phishing}%
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Anti-Phishing
                </Text>
              </View>
              <View style={styles.metric}>
                <Ionicons name="bug" size={20} color="#F59E0B" />
                <Text style={[styles.metricText, { color: colors.text }]}>
                  {securityScore.malware}%
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Malware
                </Text>
              </View>
              <View style={styles.metric}>
                <Ionicons name="lock-closed" size={20} color="#3B82F6" />
                <Text style={[styles.metricText, { color: colors.text }]}>
                  {securityScore.privacy}%
                </Text>
                <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                  Privacy
                </Text>
              </View>
            </View>
          </LinearGradient>
        </GlassCard>
      </Animated.View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity onPress={scanNow} style={styles.scanButton}>
          <GlassCard style={styles.scanButtonInner}>
            <Ionicons name="flash" size={24} color="#60A5FA" />
            <Text style={[styles.scanText, { color: colors.text }]}>
              Quick Scan
            </Text>
          </GlassCard>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <GlassCard style={styles.actionButtonInner}>
            <MaterialCommunityIcons name="shield-sync" size={24} color="#10B981" />
            <Text style={[styles.actionText, { color: colors.text }]}>
              Real-time Protection
            </Text>
            <View style={styles.statusDot} />
          </GlassCard>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Activity
        </Text>
        {recentThreats.slice(0, 3).map((threat, index) => (
          <GlassCard key={threat.id} style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View style={[
                styles.activityIcon,
                { backgroundColor: threat.severity === 'critical' ? 
                  'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)' }
              ]}>
                <Ionicons 
                  name={threat.severity === 'critical' ? 'warning' : 'alert-circle'} 
                  size={20} 
                  color={threat.severity === 'critical' ? '#EF4444' : '#F59E0B'} 
                />
              </View>
              <View style={styles.activityInfo}>
                <Text style={[styles.activityType, { color: colors.text }]}>
                  {threat.type.toUpperCase()}
                </Text>
                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                  {new Date(threat.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <View style={[
                styles.severityBadge,
                { backgroundColor: threat.severity === 'critical' ? 
                  'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)' }
              ]}>
                <Text style={[
                  styles.severityText,
                  { color: threat.severity === 'critical' ? '#EF4444' : '#F59E0B' }
                ]}>
                  {threat.severity}
                </Text>
              </View>
            </View>
          </GlassCard>
        ))}
      </View>

      {/* Weather Widget */}
      <WeatherWidget />

      {/* Daily Stats */}
      <GlassCard style={styles.statsCard}>
        <Text style={[styles.statsTitle, { color: colors.text }]}>
          Today's Protection
        </Text>
        <View style={styles.statsGrid}>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>
              {securityScore.threatsBlocked}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Threats Blocked
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
              {Math.floor(Math.random() * 50) + 10}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              URLs Scanned
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>
              {Math.floor(Math.random() * 100) + 50}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Messages Protected
            </Text>
          </View>
        </View>
      </GlassCard>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerRight: {
    padding: 10,
  },
  scoreCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  scoreCardInner: {
    padding: 20,
  },
  scoreGradient: {
    borderRadius: 20,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreInfo: {
    marginLeft: 15,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  scoreMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricText: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 5,
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  scanButton: {
    flex: 1,
  },
  scanButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    gap: 8,
  },
  scanText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flex: 1,
  },
  actionButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  activityCard: {
    marginBottom: 10,
    padding: 15,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityType: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  spacer: {
    height: 100,
  },
});
