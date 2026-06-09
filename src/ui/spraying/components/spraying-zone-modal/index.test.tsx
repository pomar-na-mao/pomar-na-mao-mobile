import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SprayingZoneModal } from '.';

const mockCloseZoneSelection = jest.fn();
const mockLoadZone = jest.fn();

jest.mock('@/ui/shared/components/form/dropdown/ThemedDropdown', () => ({
  __esModule: true,
  default: ({
    error,
    label,
    onSelect,
    options,
  }: {
    error?: string;
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
        {error ? <Text>{error}</Text> : null}
      </View>
    );
  },
}));

jest.mock('@/ui/spraying/view-models/use-spraying', () => ({
  useSpraying: () => ({
    closeZoneSelection: mockCloseZoneSelection,
    isZoneSelectionVisible: true,
    loadZone: mockLoadZone,
    selectedZone: null,
    zones: [
      { id: 'zone-1', name: 'Talhao 1' },
      { id: 'zone-2', name: 'Talhao 2' },
    ],
  }),
}));

describe('SprayingZoneModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires a zone before loading plants', () => {
    render(<SprayingZoneModal />);

    fireEvent.press(screen.getByText('Carregar'));

    expect(screen.getByText('Selecione uma zona para carregar as plantas.')).toBeOnTheScreen();
    expect(mockLoadZone).not.toHaveBeenCalled();
  });

  it('loads plants only for the selected zone', () => {
    render(<SprayingZoneModal />);

    fireEvent.press(screen.getByTestId('Zona-zone-2'));
    fireEvent.press(screen.getByText('Carregar'));

    expect(mockLoadZone).toHaveBeenCalledWith('zone-2');
  });
});
