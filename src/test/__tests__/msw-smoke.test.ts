import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';

describe('MSW setup', () => {
  it('mocks fetch requests', async () => {
    server.use(
      http.get('https://example.test/greeting', () =>
        HttpResponse.json({
          message: 'ok',
        }),
      ),
    );

    const response = await fetch('https://example.test/greeting');

    await expect(response.json()).resolves.toEqual({ message: 'ok' });
  });
});
