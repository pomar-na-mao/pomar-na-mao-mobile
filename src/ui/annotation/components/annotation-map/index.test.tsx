import { annotationLocation } from '@/test/annotation/fixtures';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { AnnotationMap } from './index';

const mockUseAnnotation = jest.fn();

jest.mock('@/ui/annotation/view-models/use-annotation', () => ({
  useAnnotation: () => mockUseAnnotation(),
}));

jest.mock('@/ui/shared/components/user-marker-location', () => ({
  UserMarkerLocation: () => null,
}));

describe('AnnotationMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAnnotation.mockReturnValue({
      currentLocation: null,
      initialRegion: null,
    });
  });

  it('renders the loading state until location is available', () => {
    render(<AnnotationMap />);

    expect(screen.getByText(/Obtendo localiza/)).toBeOnTheScreen();
  });

  it('renders the annotation map when location is available', () => {
    mockUseAnnotation.mockReturnValue({
      currentLocation: annotationLocation,
      initialRegion: annotationLocation.coords,
    });

    render(<AnnotationMap />);

    expect(screen.getByTestId('annotation-map')).toBeOnTheScreen();
    expect(screen.queryByLabelText(/localização DEV/)).not.toBeOnTheScreen();
    expect(screen.queryByTestId('annotation-simulation-marker')).not.toBeOnTheScreen();
  });
});
