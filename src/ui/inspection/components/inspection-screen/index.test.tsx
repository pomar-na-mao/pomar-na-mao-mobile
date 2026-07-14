import { inspectionPlant, localInspection } from '@/test/inspection/fixtures';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { InspectionScreen } from './index';

const mockUseInspection = jest.fn();
const mockOpenFilterModal = jest.fn();
const mockOpenNearestPlantModal = jest.fn();
const mockFinishActiveInspection = jest.fn();
const mockSyncInspection = jest.fn();

jest.mock('@/ui/inspection/view-models/use-inspection', () => ({
  useInspection: () => mockUseInspection(),
}));

jest.mock('@/ui/inspection/components/inspection-map', () => ({
  InspectionMap: () => null,
}));

jest.mock('@/ui/inspection/components/inspection-filter-modal', () => ({
  InspectionFilterModal: () => null,
}));

jest.mock('@/ui/inspection/components/nearest-plant-modal', () => ({
  NearestPlantModal: () => null,
}));

describe('InspectionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInspection.mockReturnValue({
      activeInspection: null,
      finishActiveInspection: mockFinishActiveInspection,
      loadedPlants: [],
      nearestPlant: null,
      openFilterModal: mockOpenFilterModal,
      openNearestPlantModal: mockOpenNearestPlantModal,
      syncInspection: mockSyncInspection,
    });
  });

  it('renders empty state summary and disabled finish action', () => {
    render(<InspectionScreen />);

    expect(screen.getByText(/Inspe/)).toBeOnTheScreen();
    expect(screen.getByText('Vazio')).toBeOnTheScreen();
    expect(screen.getAllByText('0')).toHaveLength(2);
    expect(screen.getByText('Exibir plantas')).toBeOnTheScreen();
    expect(screen.getByText('Finalizar')).toBeOnTheScreen();
    expect(screen.getByTestId('inspection-summary-panel')).toHaveStyle({ top: 44 });

    fireEvent.press(screen.getByLabelText(/Abrir filtro/));
    expect(mockOpenFilterModal).toHaveBeenCalled();
  });

  it('finishes an active inspection and opens nearest plant details', () => {
    mockUseInspection.mockReturnValue({
      activeInspection: localInspection,
      finishActiveInspection: mockFinishActiveInspection,
      loadedPlants: [inspectionPlant],
      nearestPlant: { ...inspectionPlant, distanceMeters: 2.4 },
      openFilterModal: mockOpenFilterModal,
      openNearestPlantModal: mockOpenNearestPlantModal,
      syncInspection: mockSyncInspection,
    });

    render(<InspectionScreen />);

    expect(screen.getByText('Em campo')).toBeOnTheScreen();
    expect(screen.getByText('plant-1')).toBeOnTheScreen();
    expect(screen.getByText(/2.4 m/)).toBeOnTheScreen();

    fireEvent.press(screen.getByLabelText(/Finalizar/));
    fireEvent.press(screen.getByLabelText(/Abrir detalhes/));
    expect(mockFinishActiveInspection).toHaveBeenCalled();
    expect(mockOpenNearestPlantModal).toHaveBeenCalled();
  });

  it('syncs finished inspections and disables already synced inspections', () => {
    mockUseInspection.mockReturnValue({
      activeInspection: { ...localInspection, status: 'finished', sync_status: 'pending' },
      finishActiveInspection: mockFinishActiveInspection,
      loadedPlants: [inspectionPlant],
      nearestPlant: null,
      openFilterModal: mockOpenFilterModal,
      openNearestPlantModal: mockOpenNearestPlantModal,
      syncInspection: mockSyncInspection,
    });

    const { rerender } = render(<InspectionScreen />);

    fireEvent.press(screen.getByLabelText(/Sincronizar/));
    expect(mockSyncInspection).toHaveBeenCalledWith(localInspection.id);

    mockUseInspection.mockReturnValue({
      activeInspection: { ...localInspection, status: 'synced', sync_status: 'synced' },
      finishActiveInspection: mockFinishActiveInspection,
      loadedPlants: [inspectionPlant],
      nearestPlant: null,
      openFilterModal: mockOpenFilterModal,
      openNearestPlantModal: mockOpenNearestPlantModal,
      syncInspection: mockSyncInspection,
    });
    rerender(<InspectionScreen />);

    expect(screen.getAllByText('Sincronizada').length).toBeGreaterThan(0);
  });
});
