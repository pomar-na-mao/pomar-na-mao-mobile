import { StyleSheet } from 'react-native';

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: -80, // Pull the card up under the logo (half of logo height)
    zIndex: 1, // Ensure logo is above the card
  },
  logo: {
    width: 120,
    height: 120,
  },
  cardContainer: {
    borderRadius: 24,
    padding: 24,
    paddingTop: 60,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 8,
    marginVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  form: {
    marginBottom: 2,
  },
  eyeButton: {
    position: 'absolute',
    padding: 12,
    right: 6,
  },
  link: {
    alignSelf: 'flex-end',
    marginBottom: 0,
    marginTop: -4,
  },
  fieldWorksButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  footer: {
    marginTop: 16,
    gap: 12,
  },
});
