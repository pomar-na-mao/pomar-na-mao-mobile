import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { inspectionFilterOptions } from '@/test/inspection/fixtures';
import { InspectionFilterModal } from './index';

const mockApplyFilters = jest.fn();
const mockCloseFilterModal = jest.fn();
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
          <Pressable key={option.value} testID={`${label}-${option.value}`} onPress={() => onSelect(option.value)}>
            <Text>{option.label}</Text>
          </Pressable>
        ))}
      </View>
    );
  },
}));

describe('InspectionFilterModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInspection.mockReturnValue({
      applyFilters: mockApplyFilters,
      closeFilterModal: mockCloseFilterModal,
      filterOptions: inspectionFilterOptions,
      isFilterModalVisible: true,
    });
  });

  it('renders filter options and submits the selected values', () => {
    render(<InspectionFilterModal />);

    expect(screen.getByText(/Filtro da inspe/)).toBeOnTheScreen();
    expect(screen.getByText('Zona')).toBeOnTheScreen();
    expect(screen.getByText(/Ocorr/)).toBeOnTheScreen();
    expect(screen.getByText('Talhao 1')).toBeOnTheScreen();
    expect(screen.getByText('Praga')).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId('Zona-zone-1'));
    fireEvent.press(screen.getByTestId(/Ocorr.*occurrence-1/));
    fireEvent.press(screen.getByText('Carregar'));

    expect(mockApplyFilters).toHaveBeenCalledWith({
      occurrenceCode: 'PST',
      occurrenceName: 'Praga',
      occurrenceTypeId: 'occurrence-1',
      zoneId: 'zone-1',
      zoneName: 'Talhao 1',
    });
  });

  it('closes from the cancel action', () => {
    render(<InspectionFilterModal />);

    fireEvent.press(screen.getByText('Cancelar'));
    expect(mockCloseFilterModal).toHaveBeenCalled();
  });

  it('does not render modal content when hidden', () => {
    mockUseInspection.mockReturnValue({
      applyFilters: mockApplyFilters,
      closeFilterModal: mockCloseFilterModal,
      filterOptions: inspectionFilterOptions,
      isFilterModalVisible: false,
    });

    render(<InspectionFilterModal />);

    expect(screen.queryByText(/Filtro da inspe/)).toBeNull();
  });
});
