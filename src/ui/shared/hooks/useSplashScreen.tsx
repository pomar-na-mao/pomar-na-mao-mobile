import { useEventListener } from 'expo';
import * as SplashScreen from 'expo-splash-screen';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

// Prevent the native splash from auto-hiding — we control it manually.
SplashScreen.preventAutoHideAsync();

const splashVideo = require('@/assets/videos/splash.mp4');

interface SplashScreenContextProps {
  appIsReady: boolean;
}

const SplashScreenContext = createContext({} as SplashScreenContextProps);

export const SplashScreenProvider = ({ children }: { children: React.ReactNode }) => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const player = useVideoPlayer(splashVideo, (p) => {
    p.loop = false;
    p.play();
  });

  /**
   * Listens for the video reaching the end of playback.
   * When fired, we trigger the fade-out animation.
   */
  useEventListener(player, 'playToEnd', () => {
    setVideoFinished(true);
  });

  /**
   * Called when the VideoView renders the first frame.
   * At this point we hide the native splash so the video is visible.
   */
  const handleFirstFrameRender = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch {
      // Already hidden — safe to ignore.
    }
  }, []);

  /**
   * Once the video finishes, fade out the overlay then mark app as ready.
   */
  useEffect(() => {
    if (!videoFinished) return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setAppIsReady(true);
    });
  }, [videoFinished, fadeAnim]);

  /**
   * Safety-net: if the video somehow doesn't fire onFirstFrameRender within 8 s,
   * hide the native splash and skip the animation.
   */
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!appIsReady) {
        try {
          await SplashScreen.hideAsync();
        } catch {
          // ignore
        }
        setVideoFinished(true);
      }
    }, 8000);

    return () => clearTimeout(timeout);
  }, [appIsReady]);

  return (
    <SplashScreenContext.Provider value={{ appIsReady }}>
      {children}

      {/* Video splash overlay — sits on top of everything until finished */}
      {!appIsReady && (
        <Animated.View pointerEvents="none" style={[styles.overlay, { opacity: fadeAnim }]}>
          <VideoView
            player={player}
            contentFit="cover"
            nativeControls={false}
            onFirstFrameRender={handleFirstFrameRender}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </SplashScreenContext.Provider>
  );
};

export const useSplashScreen = () => useContext(SplashScreenContext);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: '#000',
  },
});
