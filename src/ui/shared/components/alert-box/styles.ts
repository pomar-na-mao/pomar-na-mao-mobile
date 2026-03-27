import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '90%',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  title: {
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
});
