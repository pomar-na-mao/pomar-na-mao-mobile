import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, marginVertical: 20, paddingHorizontal: 16 },
  card: {
    height: 150,
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 0.02,
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  leftSideContainer: {
    flex: 1,
    width: '70%',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingLeft: 12,
    paddingVertical: 10,
    height: '100%',
  },
  infoContainer: {
    gap: 10,
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItemContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 8,
  },
  textPlaceholder: {
    width: '80%',
    height: 20,
    borderRadius: 8,
  },
  textPlaceholderSmall: {
    width: '60%',
    height: 15,
    borderRadius: 8,
  },
  textPlaceholderExtraSmall: {
    width: '40%',
    height: 15,
    borderRadius: 8,
  },
  circlePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  rightSideContainer: {
    width: '30%',
    height: '100%',
  },
  buttonPlaceholder: {
    width: '100%',
    height: '100%',
  },
});
