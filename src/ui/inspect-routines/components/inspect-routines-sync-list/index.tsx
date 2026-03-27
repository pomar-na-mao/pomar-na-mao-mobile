import { useInspectRoutinesSyncStore } from '@/data/store/inspect-routines/use-inspect-routines-sync-store';
import type { SupabaseRoutine } from '@/domain/models/inspect-routines/inspect-routines.model';
import { EmptyList } from '@/ui/shared/components/empty-list';
import React from 'react';
import { FlatList, Modal, View } from 'react-native';
import { InspectRoutinesSyncFilters } from '../inspect-routines-sync-filters';
import { SyncRoutineCard } from '../sync-routine-card';

interface InspectRoutinesSyncListProps {
  showFiltersMenu: boolean;
  setShowFiltersMenu: (state: boolean) => void;
}

const InspectRoutinesSyncList: React.FC<InspectRoutinesSyncListProps> = ({ showFiltersMenu, setShowFiltersMenu }) => {
  const { routines } = useInspectRoutinesSyncStore();

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Modal
          visible={showFiltersMenu}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowFiltersMenu(false)}
        >
          {showFiltersMenu ? <InspectRoutinesSyncFilters closeMenu={() => setShowFiltersMenu(false)} /> : null}
        </Modal>
      </View>
      <FlatList
        data={routines}
        keyExtractor={(item: SupabaseRoutine) => item.id.toString()}
        ListEmptyComponent={<EmptyList title="Sem resultados!" subtitle="Nenhuma inspeção de planta disponível!" />}
        renderItem={({ item }) => <SyncRoutineCard id={item.id} date={item.created_at} zone={item.region} />}
        contentContainerStyle={{ minHeight: 200, marginTop: 14, gap: 14, paddingBottom: 90, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default InspectRoutinesSyncList;
