import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  weatherCard: {
    padding: 32,
    paddingTop: 40,
    borderRadius: 24,
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  blurCircle: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(252, 143, 52, 0.15)',
  },
  weatherTopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  weatherLocation: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    opacity: 0.8,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  temperature: {
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '800',
    marginBottom: 2,
  },
  weatherStatic: {
    fontSize: 18,
    fontWeight: '500',
  },
  weatherGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  weatherItem: {
    alignItems: 'center',
  },
  weatherLabel: {
    fontSize: 10,
    marginTop: 4,
    marginBottom: 2,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weatherValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
