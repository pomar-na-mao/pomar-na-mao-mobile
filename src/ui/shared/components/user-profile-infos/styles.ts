import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 22,
    minHeight: 200,
  },
  imageWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 24, marginBottom: 28 },
  image: {
    width: 90,
    height: 90,
    borderRadius: 100,
  },
  name: { textAlign: 'center' },
  email: { textAlign: 'center' },
  userType: {
    textAlign: 'center',
    marginTop: 4,
  },
});
