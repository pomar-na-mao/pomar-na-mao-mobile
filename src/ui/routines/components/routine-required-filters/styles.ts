import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  closeIconContainer: {
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 10,
    marginRight: 24,
  },
  detectSearchFiltersContainer: {
    borderRadius: 16,
    padding: 2,
    minWidth: 300,
  },
  formContainer: {
    flex: 1,
    alignSelf: 'stretch',
    paddingTop: 12,
  },
  form: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  actionsContainer: {
    width: '100%',
    gap: 8,
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
});
