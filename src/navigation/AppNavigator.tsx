import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AddBookmarkScreen from '../screens/AddBookmarkScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PaywallScreen from '../screens/PaywallScreen';
import { isOnboardingCompleted, isSubscribed, isTrialActive } from '../subscription/state';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const completed = await isOnboardingCompleted();
      if (!completed) {
        setInitialRoute('Onboarding');
        return;
      }
      const subscribed = await isSubscribed();
      const trial = await isTrialActive();
      if (subscribed || trial) {
        setInitialRoute('Home');
      } else {
        setInitialRoute('Paywall');
      }
    })();
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Paywall" component={PaywallScreen} options={{ title: 'Upgrade' }} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddBookmark" component={AddBookmarkScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 