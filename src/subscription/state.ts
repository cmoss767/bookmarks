import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  onboardingCompleted: 'onboarding.completed',
  trialStartedAt: 'trial.startedAt',
  subscriptionActive: 'subscription.active',
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
}

export async function deactivateSubscription(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.subscriptionActive);
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
  ]);
}

export const TRIAL_DAYS = TRIAL_LENGTH_DAYS;

