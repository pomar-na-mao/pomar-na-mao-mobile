/* eslint-disable @typescript-eslint/no-require-imports */
import { annotationLocation, annotationOccurrenceType } from '@/test/annotation/fixtures';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { AnnotationDataModal } from './index';

const mockUseAnnotation = jest.fn();
const mockCloseAnnotationModal = jest.fn();
const mockSaveAnnotation = jest.fn();

jest.mock('@/ui/annotation/view-models/use-annotation', () => ({
  useAnnotation: () => mockUseAnnotation(),
}));

jest.mock('@/ui/shared/components/Button', () => {
  const { Pressable, Text } = require('react-native');
  return {
    __esModule: true,
    default: ({ title, onPress }: { title: string; onPress: () => void }) => (
      <Pressable onPress={onPress} accessibilityRole="button">
        <Text>{title}</Text>
      </Pressable>
    ),
  };
});

describe('AnnotationDataModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAnnotation.mockReturnValue({
      closeAnnotationModal: mockCloseAnnotationModal,
      currentLocation: annotationLocation,
      isAnnotationModalVisible: true,
      occurrenceTypes: [annotationOccurrenceType],
      saveAnnotation: mockSaveAnnotation,
      validationMessage: null,
    });
  });

  it('renders annotation choices and saves selected data', () => {
    render(<AnnotationDataModal />);

    fireEvent.press(screen.getByText(annotationOccurrenceType.name));
    fireEvent.press(screen.getByText('Alta'));
    fireEvent.changeText(screen.getByPlaceholderText('Opcional'), 'folhas afetadas');
    fireEvent.press(screen.getByText('Salvar'));

    expect(mockSaveAnnotation).toHaveBeenCalledWith({
      notes: 'folhas afetadas',
      occurrence: annotationOccurrenceType,
      severity: 'high',
    });
  });

  it('shows validation messages from the view model', () => {
    mockUseAnnotation.mockReturnValue({
      closeAnnotationModal: mockCloseAnnotationModal,
      currentLocation: annotationLocation,
      isAnnotationModalVisible: true,
      occurrenceTypes: [annotationOccurrenceType],
      saveAnnotation: mockSaveAnnotation,
      validationMessage: 'Selecione o tipo de ocorrência.',
    });

    render(<AnnotationDataModal />);

    expect(screen.getByText('Selecione o tipo de ocorrência.')).toBeOnTheScreen();
  });

  it('keeps save actionable and shows occurrence validation when missing', () => {
    render(<AnnotationDataModal />);

    fireEvent.press(screen.getByText('Salvar'));

    expect(screen.getByText('Selecione o tipo de ocorrência.')).toBeOnTheScreen();
    expect(mockSaveAnnotation).not.toHaveBeenCalled();
  });
});
