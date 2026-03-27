import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabText: {
    fontFamily: 'Rubik-Medium',
    fontSize: 14,
    color: '#6C757D',
  },
  disabledTabItem: {
    opacity: 0.4,
  },
});
