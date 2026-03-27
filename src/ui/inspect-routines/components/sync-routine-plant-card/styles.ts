import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: 'flex-start',
    minHeight: 85,
    borderWidth: 0.02,
    borderRadius: 16,
    elevation: 4,
    padding: 8,
    marginHorizontal: 2,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  headerTitle: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncStatusText: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    marginBottom: 12,
    textAlign: 'center',
    alignSelf: 'flex-end',
  },
  plantChangesInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 55,
    marginVertical: 12,
    borderRadius: 18,
    paddingHorizontal: 10,
  },
});
