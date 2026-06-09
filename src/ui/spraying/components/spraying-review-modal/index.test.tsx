import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { SprayingReviewModal } from '.';

const mockCloseReview = jest.fn();
const mockConfirmReview = jest.fn();
const mockTogglePlant = jest.fn();

jest.mock('@/ui/spraying/view-models/use-spraying', () => ({
  useSpraying: () => ({
    aggregate: {
      plants: [
        {
          plantId: 'plant-1',
          latitude: -23,
          longitude: -49,
          varietyName: 'Variedade A',
          reviewStatus: 'confirmed',
          distanceMeters: 3.8,
        },
      ],
    },
    closeReview: mockCloseReview,
    confirmReview: mockConfirmReview,
    isReviewVisible: true,
    togglePlant: mockTogglePlant,
  }),
}));

describe('SprayingReviewModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows reviewed state and persists plant toggles', () => {
    render(<SprayingReviewModal />);

    expect(screen.getByText('Incluida')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('checkbox'));
    expect(mockTogglePlant).toHaveBeenCalledWith(
      expect.objectContaining({ plantId: 'plant-1', reviewStatus: 'confirmed' }),
    );
  });

  it('confirms the reviewed selection', () => {
    render(<SprayingReviewModal />);

    fireEvent.press(screen.getByText('Confirmar revisão'));
    expect(mockConfirmReview).toHaveBeenCalled();
  });
});
