import React, { forwardRef, useImperativeHandle } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MarkerPressEvent {
  nativeEvent: {
    coordinate: LatLng;
    position: { x: number; y: number };
    id: string;
    action: 'marker-press';
  };
}

export interface MapViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  initialRegion?: Region;
  region?: Region;
  onPress?: (event: unknown) => void;
  onLongPress?: (event: unknown) => void;
  onRegionChange?: (region: Region) => void;
  onRegionChangeComplete?: (region: Region) => void;
  customMapStyle?: unknown;
  provider?: string;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  testID?: string;
}

export interface MarkerProps {
  children?: React.ReactNode;
  coordinate?: LatLng;
  onPress?: (event: unknown) => void;
  title?: string;
  description?: string;
  anchor?: { x: number; y: number };
  pinColor?: string;
  testID?: string;
  tracksViewChanges?: boolean;
  zIndex?: number;
  identifier?: string;
}

export const MapView = forwardRef<unknown, MapViewProps>(({ children, style, testID }, ref) => {
  useImperativeHandle(ref, () => ({
    fitToCoordinates: () => {},
    animateCamera: () => {},
    animateToRegion: () => {},
    fitToElements: () => {},
    fitToSuppliedMarkers: () => {},
    setCamera: () => {},
    getCamera: async () => ({}),
    getMapBoundaries: async () => ({
      northEast: { latitude: 0, longitude: 0 },
      southWest: { latitude: 0, longitude: 0 },
    }),
    takeSnapshot: async () => '',
    injectJavaScript: () => {},
  }));

  return (
    <View style={[styles.mapContainer, style]} testID={testID}>
      {children}
    </View>
  );
});

MapView.displayName = 'MapView';
export default MapView;

export const Marker = forwardRef<unknown, MarkerProps>(({ children, onPress, testID }, ref) => {
  useImperativeHandle(ref, () => ({
    showCallout: () => {},
    hideCallout: () => {},
    redrawCallout: () => {},
    animateMarkerToCoordinate: () => {},
  }));

  if (!children) return null;

  if (onPress) {
    return (
      <Pressable style={styles.markerContainer} onPress={onPress} testID={testID}>
        {children}
      </Pressable>
    );
  }

  return (
    <View style={styles.markerContainer} testID={testID}>
      {children}
    </View>
  );
});

Marker.displayName = 'Marker';

export const Polyline: React.FC<unknown> = () => null;
export const Polygon: React.FC<unknown> = () => null;
export const Circle: React.FC<unknown> = () => null;
export const Overlay: React.FC<unknown> = () => null;
export const UrlTile: React.FC<unknown> = () => null;
export const WMSTile: React.FC<unknown> = () => null;
export const LocalTile: React.FC<unknown> = () => null;
export const Heatmap: React.FC<unknown> = () => null;
export const Geojson: React.FC<unknown> = () => null;
export const Callout: React.FC<{ children?: React.ReactNode }> = ({ children }) => <View>{children}</View>;

const styles = StyleSheet.create({
  mapContainer: {
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
    position: 'relative',
  },
  markerContainer: {
    position: 'absolute',
  },
});
