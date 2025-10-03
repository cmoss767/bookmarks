import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { markOnboardingCompleted, startTrial, TRIAL_DAYS } from '../subscription/state';

type RootStackParamList = {
  Onboarding: undefined;
  Paywall: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const handleContinue = useCallback(async () => {
    await markOnboardingCompleted();
    await startTrial();
    navigation.replace('Home');
  }, [navigation]);

  const handleSeePlans = useCallback(() => {
    navigation.navigate('Paywall');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Markd</Text>
      <Text style={styles.subtitle}>Save bookmarks you actually revisit.</Text>
      <View style={styles.featureList}>
        <Text style={styles.featureItem}>• Share to add links instantly</Text>
        <Text style={styles.featureItem}>• Daily reminder surfaces a random link</Text>
        <Text style={styles.featureItem}>• Lightweight, private, on-device</Text>
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue}>
        <Text style={styles.primaryBtnText}>Start {TRIAL_DAYS}-day free trial</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={handleSeePlans}>
        <Text style={styles.secondaryBtnText}>See plans</Text>
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
  featureList: {
    marginBottom: 40,
  },
  featureItem: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
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

export default OnboardingScreen;

