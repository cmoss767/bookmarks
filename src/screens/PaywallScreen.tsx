import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { activateSubscription, getTrialRemainingDays, isSubscribed, startTrial, TRIAL_DAYS } from '../subscription/state';

type RootStackParamList = {
  Paywall: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const PaywallScreen: React.FC<Props> = ({ navigation }) => {
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(0);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setTrialDaysLeft(await getTrialRemainingDays());
      setHasSubscription(await isSubscribed());
    })();
  }, []);

  const handleStartTrial = useCallback(async () => {
    await startTrial();
    setTrialDaysLeft(await getTrialRemainingDays());
    navigation.replace('Home');
  }, [navigation]);

  const handleSubscribe = useCallback(async () => {
    // Placeholder: integrate storekit/billing here
    await activateSubscription();
    Alert.alert('Success', 'Subscription activated. Thank you!');
    navigation.replace('Home');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Go Pro</Text>
      <Text style={styles.subtitle}>Support development and unlock future features.</Text>
      <View style={styles.card}>
        <Text style={styles.price}>$9.99 / year</Text>
        <Text style={styles.note}>Cancel anytime</Text>
      </View>

      {trialDaysLeft > 0 ? (
        <Text style={styles.trialText}>Trial: {trialDaysLeft} day(s) left</Text>
      ) : (
        <Text style={styles.trialText}>Start your {TRIAL_DAYS}-day free trial</Text>
      )}

      {trialDaysLeft <= 0 && (
        <TouchableOpacity style={styles.primaryBtn} onPress={handleStartTrial}>
          <Text style={styles.primaryBtnText}>Start Free Trial</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.secondaryBtn} onPress={handleSubscribe}>
        <Text style={styles.secondaryBtnText}>{hasSubscription ? 'Manage Subscription' : 'Subscribe Now'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
    color: '#111',
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#f5f7ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0a1c6b',
  },
  note: {
    fontSize: 12,
    color: '#334',
    marginTop: 6,
  },
  trialText: {
    textAlign: 'center',
    color: '#333',
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryBtnText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default PaywallScreen;

