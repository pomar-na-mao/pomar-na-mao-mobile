import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  map: {
    height: '65%',
    width: '100%',
    paddingHorizontal: 16,
  },
  mapDraft: {
    height: '65%',
    marginHorizontal: 16,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  cards: {
    marginVertical: 30,
  },
});
