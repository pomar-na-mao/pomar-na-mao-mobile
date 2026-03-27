import * as SplashScreen from 'expo-splash-screen';
import React, { createContext, useContext, useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync();

interface SplashScreenContextProps {
  appIsReady: boolean;
}

const SplashScreenContext = createContext({} as SplashScreenContextProps);

export const SplashScreenProvider = ({ children }: { children: React.ReactNode }) => {
  const [minTimePassed, setMinTimePassed] = useState(false);

  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function hideSplashScreen() {
      if (minTimePassed) {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    hideSplashScreen();
  }, [minTimePassed]);

  if (!appIsReady) {
    return null;
  }

  return <SplashScreenContext.Provider value={{ appIsReady }}>{children}</SplashScreenContext.Provider>;
};

export const useSplashScreen = () => useContext(SplashScreenContext);
