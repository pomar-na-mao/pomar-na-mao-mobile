import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  mockControls: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    left: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    zIndex: 2,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  mockButton: {
    minWidth: 40,
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mockButtonPrimary: {
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  mockButtonText: {
    fontWeight: '600',
  },
  mockButtonPrimaryText: {
    fontWeight: '700',
  },
});
