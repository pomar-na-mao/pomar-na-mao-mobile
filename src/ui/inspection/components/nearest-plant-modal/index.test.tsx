import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { inspectionFilterOptions, inspectionPlant } from '@/test/inspection/fixtures';
import { NearestPlantModal } from './index';

const mockCloseNearestPlantModal = jest.fn();
const mockSaveOccurrenceChange = jest.fn();
const mockUseInspection = jest.fn();

jest.mock('@/ui/inspection/view-models/use-inspection', () => ({
  useInspection: () => mockUseInspection(),
}));

jest.mock('@/ui/shared/components/form/dropdown/ThemedDropdown', () => ({
  __esModule: true,
  default: ({
    label,
    onSelect,
    options,
  }: {
    label: string;
    onSelect: (value: string | number) => void;
    options: { label: string; value: string | number }[];
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pressable, Text, View } = require('react-native');

    return (
      <View>
        <Text>{label}</Text>
        {options.map((option) => (
          <Pressable
            key={`${label}-${option.value}`}
            testID={`${label}-${option.value}`}
            onPress={() => onSelect(option.value)}
          >
            <Text>{option.label}</Text>
          </Pressable>
        ))}
      </View>
    );
  },
}));

describe('NearestPlantModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInspection.mockReturnValue({
      closeNearestPlantModal: mockCloseNearestPlantModal,
      filterOptions: inspectionFilterOptions,
      isNearestPlantModalVisible: true,
      nearestPlant: { ...inspectionPlant, distanceMeters: 2.4 },
      saveOccurrenceChange: mockSaveOccurrenceChange,
    });
  });

  it('renders nearest plant details, occurrences, and saves selected changes', async () => {
    render(<NearestPlantModal />);

    expect(screen.getByTestId('nearest-plant-safe-area')).toHaveProp('edges', {
      bottom: 'additive',
      left: 'off',
      right: 'off',
      top: 'additive',
    });
    expect(screen.getByTestId('nearest-plant-keyboard-avoiding-view')).toBeOnTheScreen();
    expect(screen.getByTestId('nearest-plant-content')).toHaveStyle({ height: '85%' });
    expect(screen.getByTestId('nearest-plant-scroll')).toHaveProp('keyboardShouldPersistTaps', 'handled');
    expect(screen.getByTestId('nearest-plant-scroll')).toHaveProp('keyboardDismissMode', 'on-drag');
    expect(screen.getByText(/Planta mais/)).toBeOnTheScreen();
    expect(screen.getByText('plant-1')).toBeOnTheScreen();
    expect(screen.getByText('2.4 m')).toBeOnTheScreen();
    expect(screen.getByText('Talhao 1')).toBeOnTheScreen();
    expect(screen.getAllByText('Praga').length).toBeGreaterThan(0);

    expect(screen.getByTestId(/A.*add_occurrence/)).toBeOnTheScreen();
    expect(screen.getByTestId(/A.*remove_occurrence/)).toBeOnTheScreen();
    expect(screen.queryByTestId(/A.*update_occurrence/)).toBeNull();
    expect(screen.queryByTestId(/A.*resolve_occurrence/)).toBeNull();
    expect(screen.getByText('Fechar')).toBeOnTheScreen();
    expect(screen.getByText('Salvar')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId(/A.*remove_occurrence/));
    fireEvent.press(screen.getByTestId(/Ocorr.*occurrence-1/));
    fireEvent.press(screen.getByText('Média'));
    fireEvent.changeText(screen.getByPlaceholderText(/Observa/), 'observada no campo');
    await act(async () => {
      fireEvent.press(screen.getByText('Salvar'));
    });

    expect(mockSaveOccurrenceChange).toHaveBeenCalledWith({
      changeType: 'remove_occurrence',
      notes: 'observada no campo',
      occurrence: inspectionFilterOptions.occurrenceTypes[0],
      severity: 'medium',
    });
  });

  it('renders the no-nearest-plant state and closes from the action', () => {
    mockUseInspection.mockReturnValue({
      closeNearestPlantModal: mockCloseNearestPlantModal,
      filterOptions: inspectionFilterOptions,
      isNearestPlantModalVisible: true,
      nearestPlant: null,
      saveOccurrenceChange: mockSaveOccurrenceChange,
    });

    render(<NearestPlantModal />);

    expect(screen.getByText(/Nenhuma planta/)).toBeOnTheScreen();
  });

  it('closes from the close button when a plant is available', () => {
    render(<NearestPlantModal />);

    fireEvent.press(screen.getByText('Fechar'));
    expect(mockCloseNearestPlantModal).toHaveBeenCalled();
  });

  it('renders multiple occurrences properly inside the scroll view', () => {
    const multipleOccurrences = Array.from({ length: 15 }, (_, i) => ({
      code: `OCC-${i}`,
      name: `Ocorrência ${i + 1}`,
      occurrenceTypeId: `occ-type-${i}`,
      observedAt: '2026-05-30T12:00:00.000Z',
      severity: i % 2 === 0 ? 'alta' : null,
      status: 'open',
    }));

    mockUseInspection.mockReturnValue({
      closeNearestPlantModal: mockCloseNearestPlantModal,
      filterOptions: inspectionFilterOptions,
      isNearestPlantModalVisible: true,
      nearestPlant: { ...inspectionPlant, occurrences: multipleOccurrences, distanceMeters: 1.5 },
      saveOccurrenceChange: mockSaveOccurrenceChange,
    });

    render(<NearestPlantModal />);

    expect(screen.getByText('Ocorrência 1')).toBeOnTheScreen();
    expect(screen.getByText('Ocorrência 15')).toBeOnTheScreen();
    expect(screen.getByText('Baixa')).toBeOnTheScreen();
    expect(screen.getByText('Média')).toBeOnTheScreen();
    expect(screen.getByText('Alta')).toBeOnTheScreen();
    expect(screen.getByPlaceholderText(/Observa/)).toBeOnTheScreen();
    expect(screen.getByTestId('nearest-plant-scroll')).toHaveProp('showsVerticalScrollIndicator', true);
  });

  it('maps severity codes like high, medium, low to user-facing labels in current occurrences list', () => {
    mockUseInspection.mockReturnValue({
      closeNearestPlantModal: mockCloseNearestPlantModal,
      filterOptions: inspectionFilterOptions,
      isNearestPlantModalVisible: true,
      nearestPlant: {
        ...inspectionPlant,
        occurrences: [
          {
            code: 'PST',
            name: 'Lagarta',
            occurrenceTypeId: 'occ-1',
            status: 'open',
            severity: 'high',
          },
        ],
      },
      saveOccurrenceChange: mockSaveOccurrenceChange,
    });

    render(<NearestPlantModal />);

    expect(screen.getByText('Lagarta')).toBeOnTheScreen();
    expect(screen.getAllByText('Alta').length).toBeGreaterThan(0);
  });
});
