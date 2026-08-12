import { localAnnotationOccurrence, localAnnotationOperation } from '@/test/annotation/fixtures';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { AnnotationScreen } from './index';

const mockUseAnnotation = jest.fn();
const mockOpenAnnotationModal = jest.fn();
const mockFinishActiveAnnotationOperation = jest.fn();
const mockSyncAnnotations = jest.fn();
const mockClearAnnotations = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

jest.mock('@/ui/annotation/view-models/use-annotation', () => ({
  useAnnotation: () => mockUseAnnotation(),
}));

jest.mock('@/ui/annotation/components/annotation-map', () => ({
  AnnotationMap: () => null,
}));

jest.mock('@/ui/annotation/components/annotation-data-modal', () => ({
  AnnotationDataModal: () => null,
}));

describe('AnnotationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAnnotation.mockReturnValue({
      activeOperation: null,
      annotations: [],
      clearAnnotations: mockClearAnnotations,
      finishActiveAnnotationOperation: mockFinishActiveAnnotationOperation,
      openAnnotationModal: mockOpenAnnotationModal,
      summary: { error: 0, pending: 0, synced: 0, total: 0 },
      syncAnnotations: mockSyncAnnotations,
    });
  });

  it('renders the shared header and opens the annotation modal', () => {
    render(<AnnotationScreen />);

    expect(screen.getByLabelText(/Voltar para trabalhos de campo/)).toBeOnTheScreen();
    expect(screen.getByText('Vazio')).toBeOnTheScreen();
    expect(screen.getByText('Marcar')).toBeOnTheScreen();
    expect(screen.getByText('Finalizar')).toBeOnTheScreen();

    fireEvent.press(screen.getByLabelText(/Voltar para trabalhos de campo/));
    fireEvent.press(screen.getByLabelText(/Abrir dados/));

    expect(mockBack).toHaveBeenCalled();
    expect(mockOpenAnnotationModal).toHaveBeenCalled();
  });

  it('shows active operation metrics and triggers finalize and sync', () => {
    mockUseAnnotation.mockReturnValue({
      activeOperation: localAnnotationOperation,
      annotations: [{ occurrence: localAnnotationOccurrence, operation: localAnnotationOperation }],
      clearAnnotations: mockClearAnnotations,
      finishActiveAnnotationOperation: mockFinishActiveAnnotationOperation,
      openAnnotationModal: mockOpenAnnotationModal,
      summary: { error: 1, pending: 2, synced: 3, total: 6 },
      syncAnnotations: mockSyncAnnotations,
    });

    render(<AnnotationScreen />);

    expect(screen.getByText('Em campo')).toBeOnTheScreen();
    expect(screen.getByText('6')).toBeOnTheScreen();
    expect(screen.getByText('2')).toBeOnTheScreen();
    expect(screen.getByText('1')).toBeOnTheScreen();

    fireEvent.press(screen.getByLabelText(/Finalizar/));
    fireEvent.press(screen.getByLabelText(/Sincronizar/));
    fireEvent.press(screen.getByLabelText(/Apagar/));

    expect(mockFinishActiveAnnotationOperation).toHaveBeenCalled();
    expect(mockSyncAnnotations).toHaveBeenCalled();
    expect(mockClearAnnotations).toHaveBeenCalled();
  });
});
