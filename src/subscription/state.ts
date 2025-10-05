import AsyncStorage from '@react-native-async-storage/async-storage';
import { storeKitService, SUBSCRIPTION_CONFIG } from './storekit';

const STORAGE_KEYS = {
  onboardingCompleted: 'onboarding.completed',
  trialStartedAt: 'trial.startedAt',
  subscriptionActive: 'subscription.active',
  subscriptionProductId: 'subscription.productId',
  subscriptionExpiryDate: 'subscription.expiryDate',
} as const;

const TRIAL_LENGTH_DAYS = 7;

export async function markOnboardingCompleted(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.onboardingCompleted, 'true');
}

export async function isOnboardingCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.onboardingCompleted);
  return value === 'true';
}

export async function startTrial(): Promise<void> {
  const now = Date.now().toString();
  await AsyncStorage.setItem(STORAGE_KEYS.trialStartedAt, now);
}

export async function getTrialRemainingDays(): Promise<number> {
  const startedAtStr = await AsyncStorage.getItem(STORAGE_KEYS.trialStartedAt);
  if (!startedAtStr) return 0;
  const startedAt = Number(startedAtStr);
  const msElapsed = Date.now() - startedAt;
  const daysElapsed = Math.floor(msElapsed / (1000 * 60 * 60 * 24));
  const remaining = TRIAL_LENGTH_DAYS - daysElapsed;
  return remaining > 0 ? remaining : 0;
}

export async function isTrialActive(): Promise<boolean> {
  const remaining = await getTrialRemainingDays();
  return remaining > 0;
}

export async function activateSubscription(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.subscriptionActive, 'true');
  await AsyncStorage.setItem(STORAGE_KEYS.subscriptionProductId, SUBSCRIPTION_CONFIG.productId);
  // Set expiry date to 1 year from now
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  await AsyncStorage.setItem(STORAGE_KEYS.subscriptionExpiryDate, expiryDate.toISOString());
}

export async function deactivateSubscription(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.subscriptionActive,
    STORAGE_KEYS.subscriptionProductId,
    STORAGE_KEYS.subscriptionExpiryDate,
  ]);
}

export async function isSubscribed(): Promise<boolean> {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.subscriptionActive);
  return value === 'true';
}

export async function resetSubscriptionState(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.onboardingCompleted,
    STORAGE_KEYS.trialStartedAt,
    STORAGE_KEYS.subscriptionActive,
    STORAGE_KEYS.subscriptionProductId,
    STORAGE_KEYS.subscriptionExpiryDate,
  ]);
}

// StoreKit integration functions
export async function initializeStoreKit(): Promise<void> {
  try {
    await storeKitService.initialize();
    
    // Set up purchase callbacks
    storeKitService.setPurchaseCallbacks(
      async (_purchase) => {
        console.log('Purchase successful, activating subscription');
        await activateSubscription();
      },
      (error) => {
        console.error('Purchase failed:', error);
      }
    );
  } catch (error) {
    console.error('Failed to initialize StoreKit:', error);
    throw error;
  }
}

export async function purchaseSubscription(): Promise<void> {
  try {
    await storeKitService.purchaseSubscription(SUBSCRIPTION_CONFIG.productId);
  } catch (error) {
    console.error('Failed to purchase subscription:', error);
    throw error;
  }
}

export async function restorePurchases(): Promise<void> {
  try {
    const purchases = await storeKitService.restorePurchases();
    
    // Check if any of the restored purchases is our subscription
    const hasValidSubscription = purchases.some(purchase => 
      purchase.productId === SUBSCRIPTION_CONFIG.productId
    );
    
    if (hasValidSubscription) {
      await activateSubscription();
    }
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
}

export async function getSubscriptionInfo(): Promise<{
  isActive: boolean;
  productId?: string;
  expiryDate?: string;
  daysRemaining?: number;
}> {
  const isActive = await isSubscribed();
  const productId = await AsyncStorage.getItem(STORAGE_KEYS.subscriptionProductId);
  const expiryDateStr = await AsyncStorage.getItem(STORAGE_KEYS.subscriptionExpiryDate);
  
  let daysRemaining: number | undefined;
  if (expiryDateStr) {
    const expiryDate = new Date(expiryDateStr);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  return {
    isActive,
    productId: productId || undefined,
    expiryDate: expiryDateStr || undefined,
    daysRemaining: daysRemaining && daysRemaining > 0 ? daysRemaining : undefined,
  };
}

export async function cleanupStoreKit(): Promise<void> {
  try {
    await storeKitService.cleanup();
  } catch (error) {
    console.error('Failed to cleanup StoreKit:', error);
  }
}

export const TRIAL_DAYS = TRIAL_LENGTH_DAYS;
export { SUBSCRIPTION_CONFIG };

