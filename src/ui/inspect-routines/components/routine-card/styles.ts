import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: '100%',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    elevation: 4,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftSideContainer: {
    flex: 1,
    gap: 12,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexDirection: 'column',
    width: 'auto',
  },
  leftSideItem: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  treeImage: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },
  rightSideContainer: {
    flex: 1,
    gap: 12,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  rightSideTopInfoContainer: {
    marginTop: 4,
    flex: 1,
    gap: 2,
    alignItems: 'flex-end',
    flexDirection: 'column',
    width: '100%',
  },
  zoneText: {
    marginLeft: 4,
  },
  routineCircle: {
    width: 70,
    height: 70,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
