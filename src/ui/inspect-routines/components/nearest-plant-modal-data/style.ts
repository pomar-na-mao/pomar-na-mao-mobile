import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconContainer: {
    alignItems: 'flex-end',
    width: '100%',
    marginRight: 24,
  },
  searchFiltersContainer: {
    flex: 1,
    width: '100%',
    padding: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  label: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
    textTransform: 'capitalize',
  },
});
