import { renderWithProviders, screen } from '@/test/test-utils';
import { Text } from 'react-native';

describe('React Native Testing Library setup', () => {
  it('renders a React Native component', () => {
    renderWithProviders(<Text>Teste configurado</Text>);

    expect(screen.getByText('Teste configurado')).toBeOnTheScreen();
  });
});
