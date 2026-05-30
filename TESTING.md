# Testes unitarios

Este projeto usa Jest com `jest-expo`, React Native Testing Library e MSW para testes unitarios.

## Comandos

```bash
npm test
npm run test:watch
npm run test:coverage
```

Os testes rodam em Node/Jest. Eles nao exigem simulador, device, Expo dev server ou conexao real com Supabase.

## Onde colocar testes

- Use `*.test.ts` ou `*.spec.ts` para helpers, modelos e servicos sem UI.
- Use `*.test.tsx` ou `*.spec.tsx` para componentes React Native.
- Testes podem ficar ao lado do arquivo testado ou em uma pasta `__tests__`.
- Utilitarios compartilhados de teste ficam em `src/test`.

## React Native Testing Library

Use `renderWithProviders` de `@/test/test-utils` para renderizar componentes. Esse helper e o ponto central para adicionar providers compartilhados quando um teste precisar de tema, query client, SQLite mock ou outro contexto.

## MSW

Handlers compartilhados ficam em `src/test/msw/handlers.ts`. Testes especificos podem sobrescrever handlers com:

```ts
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';

server.use(
  http.get('https://example.test/resource', () => HttpResponse.json({ ok: true })),
);
```

Requests sem handler geram erro no teste para evitar uso silencioso de rede real.

## Inspecao

- Fixtures compartilhadas da feature ficam em `src/test/inspection/fixtures.ts`.
- Mocks reutilizaveis de SQLite ficam em `src/test/inspection/sqlite-mock.ts`.
- O inventario de arquivos cobertos pela feature fica em `src/test/inspection/feature-inventory.md`.
- Services que usam Supabase devem mockar o client ou o repository; nao use projeto Supabase real em teste unitario.
- O service SQLite deve ser testado por mock de `useSQLiteContext`, sem criar arquivo de banco real.
- `src/domain/models/inspection/index.ts` e `inspection.model.ts` sao arquivos sem runtime relevante; a cobertura deles e smoke/type coverage.
