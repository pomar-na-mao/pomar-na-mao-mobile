import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  title: {
    marginBottom: 2,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    width: '100%',
    paddingHorizontal: 32,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
});
