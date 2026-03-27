import { useInspectAnnotationsSyncStore } from '@/data/store/inspect-annotation/use-inspect-annotation-sync-store';
import type { SupabaseInspectAnnotation } from '@/domain/models/inspect-annotation/inspect-annotation-supabase';
import { EmptyList } from '@/ui/shared/components/empty-list';
import React from 'react';
import { FlatList, View } from 'react-native';
import { useSyncInspectAnnotation } from '../../view-models/useSyncInspectAnnotation';
import { SyncAnnotationCard } from '../sync-annotation-card';

const InspectAnnotationsSyncList: React.FC = () => {
  const { annotations } = useInspectAnnotationsSyncStore();
  const { handleSyncAnnotation } = useSyncInspectAnnotation();

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={annotations}
        keyExtractor={(item: SupabaseInspectAnnotation) => item.id?.toString() ?? Math.random().toString()}
        ListEmptyComponent={<EmptyList title="Sem resultados!" subtitle="Nenhuma anotação de inspeção disponível!" />}
        renderItem={({ item }) => (
          <SyncAnnotationCard
            date={item.created_at}
            occurrencesCount={Object.keys(item.occurrences || {}).length}
            isApproved={item.is_approved}
            onApproveAnnotation={() => handleSyncAnnotation(item)}
          />
        )}
        contentContainerStyle={{ minHeight: 200, marginTop: 14, paddingBottom: 90, gap: 12, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default InspectAnnotationsSyncList;
