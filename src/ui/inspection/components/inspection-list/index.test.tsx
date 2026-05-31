import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { inspectionListItem } from '@/test/inspection/fixtures';
import { InspectionList } from './index';

const mockUseInspection = jest.fn();
const mockSyncInspection = jest.fn();

jest.mock('@/ui/inspection/view-models/use-inspection', () => ({
  useInspection: () => mockUseInspection(),
}));

jest.mock('react-native-gesture-handler/ReanimatedSwipeable', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');

    return <View>{children}</View>;
  },
}));

jest.mock('react-native-gesture-handler', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pressable } = require('react-native');

  return {
    RectButton: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
      <Pressable onPress={onPress}>{children}</Pressable>
    ),
    ScrollView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('InspectionList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInspection.mockReturnValue({
      inspections: [],
      syncInspection: mockSyncInspection,
    });
  });

  it('renders the empty inspection state', () => {
    render(<InspectionList />);

    expect(screen.getByText(/Nenhuma inspe/)).toBeOnTheScreen();
    expect(screen.getByText(/Carregue plantas/)).toBeOnTheScreen();
  });

  it('renders inspection metrics and syncs finished pending inspections', () => {
    mockUseInspection.mockReturnValue({
      inspections: [{ ...inspectionListItem, status: 'finished', syncStatus: 'pending' }],
      syncInspection: mockSyncInspection,
    });

    render(<InspectionList />);

    expect(screen.getByText('Talhao 1')).toBeOnTheScreen();
    expect(screen.getByText('2 plantas carregadas')).toBeOnTheScreen();
    expect(screen.getByText('0 plantas alteradas')).toBeOnTheScreen();
    expect(screen.getByText('Pendente')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('Sincronizar'));
    expect(mockSyncInspection).toHaveBeenCalledWith(inspectionListItem.id);
  });

  it('renders compact synced items without empty state', () => {
    mockUseInspection.mockReturnValue({
      inspections: [{ ...inspectionListItem, status: 'synced', syncStatus: 'synced' }],
      syncInspection: mockSyncInspection,
    });

    render(<InspectionList compact />);

    expect(screen.getByText('Sincronizada')).toBeOnTheScreen();
    expect(screen.queryByText(/Nenhuma inspe/)).toBeNull();
  });
});
