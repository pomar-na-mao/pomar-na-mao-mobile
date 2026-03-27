import { useInspectRoutinesStore } from '@/data/store/inspect-routines/use-inspect-routines-store';
import { Colors } from '@/shared/constants/theme';
import { useAlertBoxStore } from '@/shared/hooks/use-alert-box';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ConfirmationModal } from '@/ui/shared/components/confirmation-modal';
import { EmptyList } from '@/ui/shared/components/empty-list';
import * as Network from 'expo-network';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { FlatList, Modal, View } from 'react-native';
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useInspectRoutine } from '../../view-models/useInspectRoutine';
import { InspectRoutineRequiredFilters } from '../inspect-routine-required-filters';
import { RoutineCard } from '../routine-card';
import { RoutineCardOption } from '../routine-card-option';
import { RoutineListAddAction } from './routine-list-add-action';

export const InspectRoutineList = () => {
  const swipeableRef = useRef<SwipeableMethods | null>(null);

  const rowRefs = useRef<Record<number, SwipeableMethods | null>>({}).current;

  const { setMessage, setIsVisible } = useAlertBoxStore();

  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null);

  const [showConfirmationDeleteRoutine, setShowConfirmationDeleteRoutine] = useState(false);

  const [showConfirmationSendRoutine, setShowConfirmationSendRoutine] = useState(false);

  const { routines } = useInspectRoutinesStore((state) => state);

  const { deleteRoutineListHandle, sendRoutineListHandle } = useInspectRoutine();

  const theme = useColorScheme() ?? 'light';

  const handleCreateRoutine = async () => {
    const networkState = await Network.getNetworkStateAsync();
    const isConnected = networkState.isConnected ?? false;

    if (!isConnected) {
      setMessage('Sem conexão com a internet. Conecte-se e tente novamente.');
      setIsVisible(true);
      return;
    }

    setShowFiltersMenu(true);
  };

  const onSwipeableWillOpenHandle = (direction: 'left' | 'right', id: number) => {
    setSelectedRoutineId(id);

    if (swipeableRef.current && swipeableRef.current !== rowRefs[id]) {
      swipeableRef.current.close();
    }

    swipeableRef.current = rowRefs[id];

    if (direction === 'right') {
      setShowConfirmationDeleteRoutine(true);
    }
  };

  const confirmDeleteRoutineListHandle = async () => {
    setShowConfirmationDeleteRoutine(false);
    await deleteRoutineListHandle(selectedRoutineId);
  };

  const cancelDeleteRoutineListHandle = () => {
    setShowConfirmationDeleteRoutine(false);
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }

    swipeableRef.current = null;
  };

  const cancelSendRoutineListHandle = () => {
    setShowConfirmationSendRoutine(false);
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }

    swipeableRef.current = null;
  };

  const sendRoutineList = (): void => {
    setShowConfirmationSendRoutine(true);
  };

  const confirmSendRoutineListHandle = async () => {
    setShowConfirmationSendRoutine(false);
    await sendRoutineListHandle(selectedRoutineId);
  };

  const [showFiltersMenu, setShowFiltersMenu] = useState(false);

  const handleShowFiltersMenu = (state: boolean) => {
    setShowFiltersMenu(state);
  };

  return (
    <View
      style={{
        marginVertical: 5,
        flex: 1,
      }}
    >
      <View>
        <Modal
          visible={showFiltersMenu}
          animationType="fade"
          transparent={true}
          onRequestClose={() => handleShowFiltersMenu(false)}
        >
          {showFiltersMenu ? <InspectRoutineRequiredFilters closeMenu={() => handleShowFiltersMenu(false)} /> : null}
        </Modal>
      </View>

      <ConfirmationModal
        visible={showConfirmationSendRoutine}
        title="Finalizar Rotina"
        message="Tem certeza que deseja finalizar esta rotina de inspeção?"
        onConfirm={() => confirmSendRoutineListHandle()}
        onCancel={() => cancelSendRoutineListHandle()}
      />

      <ConfirmationModal
        visible={showConfirmationDeleteRoutine}
        title="Remover Rotina"
        message="Tem certeza que deseja deletar esta rotina de inspeção?"
        onConfirm={() => confirmDeleteRoutineListHandle()}
        onCancel={() => cancelDeleteRoutineListHandle()}
      />

      <FlatList
        data={routines}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<EmptyList title="Sem resultados!" subtitle="Crie uma rotina para iniciar uma inspeção" />}
        renderItem={({ item }) => {
          return (
            <ReanimatedSwipeable
              ref={
                ((ref: SwipeableMethods | null) => {
                  rowRefs[item.id] = ref;
                }) as never
              }
              containerStyle={{ backgroundColor: Colors[theme].danger, borderRadius: 5 }}
              rightThreshold={1}
              leftThreshold={0.1}
              dragOffsetFromLeftEdge={0.1}
              overshootLeft={true}
              overshootRight={false}
              onSwipeableWillOpen={(direction) => onSwipeableWillOpenHandle(direction, item.id)}
              renderLeftActions={() => (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: Colors[theme].danger,
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                  }}
                >
                  <RoutineCardOption icon="delete" backgroundColor={Colors[theme].danger} />
                </View>
              )}
              renderRightActions={() => (
                <View style={{ flexDirection: 'row' }}>
                  <RoutineCardOption
                    icon="open-in-new"
                    backgroundColor={Colors[theme].tint}
                    onPress={() => {
                      router.replace({
                        pathname: '/inspect-routine-in-action-detection/[id]',
                        params: { id: item.id },
                      });
                    }}
                  />
                  <RoutineCardOption icon="done" backgroundColor={Colors[theme].secondary} onPress={sendRoutineList} />
                </View>
              )}
            >
              <RoutineCard
                id={item.id}
                date={item.date}
                region={item.region}
                plantDatas={item.plant_data}
                routineName={item.routine_name}
              />
            </ReanimatedSwipeable>
          );
        }}
        contentContainerStyle={{ gap: 14, paddingBottom: 110, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />

      <RoutineListAddAction onCreateRoutine={handleCreateRoutine} />
    </View>
  );
};
