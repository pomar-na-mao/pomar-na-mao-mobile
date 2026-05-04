import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  mockControls: {
    alignSelf: 'center',
    borderRadius: 40,
    elevation: 6,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    zIndex: 110,
  },
  mockButton: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: 16,
  },
  mockIconButton: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  mockButtonPrimary: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  mockButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
