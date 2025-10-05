import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { 
  activateSubscription, 
  getTrialRemainingDays, 
  isSubscribed, 
  startTrial, 
  TRIAL_DAYS,
  initializeStoreKit,
  purchaseSubscription,
  restorePurchases,
  getSubscriptionInfo,
  SUBSCRIPTION_CONFIG
} from '../subscription/state';

type RootStackParamList = {
  Paywall: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const PaywallScreen: React.FC<Props> = ({ navigation }) => {
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(0);
  const [hasSubscription, setHasSubscription] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Initialize StoreKit
      await initializeStoreKit();
      setIsInitialized(true);
      
      // Load current state
      setTrialDaysLeft(await getTrialRemainingDays());
      setHasSubscription(await isSubscribed());
    } catch (error) {
      console.error('Failed to initialize app:', error);
      Alert.alert('Error', 'Failed to initialize subscription service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrial = useCallback(async () => {
    await startTrial();
    setTrialDaysLeft(await getTrialRemainingDays());
    navigation.replace('Home');
  }, [navigation]);

  const handleSubscribe = useCallback(async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Subscription service not initialized. Please try again.');
      return;
    }

    try {
      setIsLoading(true);
      await purchaseSubscription();
      
      // The purchase will be handled by the StoreKit listener
      // which will call activateSubscription automatically
      // We'll update the UI state after a short delay to allow the callback to complete
      setTimeout(async () => {
        const isSubscribedNow = await isSubscribed();
        setHasSubscription(isSubscribedNow);
        if (isSubscribedNow) {
          Alert.alert('Success', 'Subscription activated. Thank you!');
          navigation.replace('Home');
        }
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert('Purchase Failed', 'Unable to complete purchase. Please try again.');
      setIsLoading(false);
    }
  }, [navigation, isInitialized]);

  const handleRestorePurchases = useCallback(async () => {
    if (!isInitialized) {
      Alert.alert('Error', 'Subscription service not initialized. Please try again.');
      return;
    }

    try {
      setIsLoading(true);
      await restorePurchases();
      
      const subscriptionInfo = await getSubscriptionInfo();
      if (subscriptionInfo.isActive) {
        setHasSubscription(true);
        Alert.alert('Success', 'Purchases restored successfully!');
        navigation.replace('Home');
      } else {
        Alert.alert('No Purchases', 'No previous purchases found to restore.');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert('Restore Failed', 'Unable to restore purchases. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [navigation, isInitialized]);

  if (isLoading && !isInitialized) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Go Pro</Text>
      <Text style={styles.subtitle}>Support development and unlock future features.</Text>
      
      <View style={styles.card}>
        <Text style={styles.price}>{SUBSCRIPTION_CONFIG.price} / {SUBSCRIPTION_CONFIG.duration}</Text>
        <Text style={styles.note}>Cancel anytime</Text>
        
        <View style={styles.featuresList}>
          {SUBSCRIPTION_CONFIG.features.map((feature, index) => (
            <Text key={index} style={styles.featureItem}>• {feature}</Text>
          ))}
        </View>
      </View>

      {trialDaysLeft > 0 ? (
        <Text style={styles.trialText}>Trial: {trialDaysLeft} day(s) left</Text>
      ) : (
        <Text style={styles.trialText}>Start your {TRIAL_DAYS}-day free trial</Text>
      )}

      {trialDaysLeft <= 0 && !hasSubscription && (
        <TouchableOpacity 
          style={[styles.primaryBtn, isLoading && styles.disabledBtn]} 
          onPress={handleStartTrial}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryBtnText}>Start Free Trial</Text>
          )}
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={[styles.secondaryBtn, isLoading && styles.disabledBtn]} 
        onPress={hasSubscription ? handleRestorePurchases : handleSubscribe}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#007AFF" />
        ) : (
          <Text style={styles.secondaryBtnText}>
            {hasSubscription ? 'Restore Purchases' : 'Subscribe Now'}
          </Text>
        )}
      </TouchableOpacity>

      {!hasSubscription && (
        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestorePurchases}>
          <Text style={styles.restoreBtnText}>Restore Purchases</Text>
        </TouchableOpacity>
      )}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
  featuresList: {
    marginTop: 16,
  },
  featureItem: {
    fontSize: 14,
    color: '#0a1c6b',
    marginBottom: 8,
    lineHeight: 20,
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
  restoreBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  restoreBtnText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});

export default PaywallScreen;

