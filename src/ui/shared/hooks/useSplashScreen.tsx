import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

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
   * Safety-net: if the video somehow doesn't play within 8 s,
   * skip the animation and show the app.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!appIsReady) {
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
          <VideoView player={player} contentFit="cover" nativeControls={false} style={StyleSheet.absoluteFill} />
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
