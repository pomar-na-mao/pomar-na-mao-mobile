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

    expect(screen.getByText(/Planta mais/)).toBeOnTheScreen();
    expect(screen.getByText('plant-1')).toBeOnTheScreen();
    expect(screen.getByText('2.4 m')).toBeOnTheScreen();
    expect(screen.getByText('Talhao 1')).toBeOnTheScreen();
    expect(screen.getAllByText('Praga').length).toBeGreaterThan(0);

    expect(screen.getByTestId(/A.*add_occurrence/)).toBeOnTheScreen();
    expect(screen.getByTestId(/A.*remove_occurrence/)).toBeOnTheScreen();
    expect(screen.queryByTestId(/A.*update_occurrence/)).toBeNull();
    expect(screen.queryByTestId(/A.*resolve_occurrence/)).toBeNull();

    fireEvent.press(screen.getByTestId(/A.*remove_occurrence/));
    fireEvent.press(screen.getByTestId(/Ocorr.*occurrence-1/));
    fireEvent.changeText(screen.getByPlaceholderText('Severidade'), 'media');
    fireEvent.changeText(screen.getByPlaceholderText(/Observa/), 'observada no campo');
    await act(async () => {
      fireEvent.press(screen.getByText('Salvar'));
    });

    expect(mockSaveOccurrenceChange).toHaveBeenCalledWith({
      changeType: 'remove_occurrence',
      notes: 'observada no campo',
      occurrence: inspectionFilterOptions.occurrenceTypes[0],
      severity: 'media',
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
});
