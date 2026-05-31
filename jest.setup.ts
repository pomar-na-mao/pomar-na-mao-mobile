import { server } from '@/test/msw/server';
import { expect, afterAll, afterEach, beforeAll, jest } from '@jest/globals';
import * as matchers from '@testing-library/react-native/matchers';
import 'react-native-gesture-handler/jestSetup';

expect.extend(matchers as unknown as Parameters<typeof expect.extend>[0]);

jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Reanimated = require('react-native-reanimated/mock');

  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock('react-native-maps', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  const MockMapView = React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
    React.useImperativeHandle(ref, () => ({
      animateCamera: jest.fn(),
    }));

    return React.createElement(View, props);
  });

  MockMapView.displayName = 'MockMapView';

  return {
    __esModule: true,
    default: MockMapView,
    Marker: View,
    Polyline: View,
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: () => null,
}));

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
