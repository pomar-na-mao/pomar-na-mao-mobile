# Development Build

Use uma development build para testar recursos nativos que nao funcionam corretamente no Expo Go, como localizacao em background com o celular bloqueado.

## Android

Instale o dev client:

```bash
npm exec expo install expo-dev-client
```

Gere a build de desenvolvimento:

```bash
npx eas-cli build -p android --profile development
```

Quando o EAS terminar, instale o APK pelo link ou QR Code exibido no terminal.

Depois, inicie o Metro para dev client:

```bash
npm exec expo start -- --dev-client
```

Abra o app instalado no celular e escaneie o QR Code do Metro.

## iOS

No Windows, gere a build iOS pela nuvem:

```bash
npx eas-cli build -p ios --profile development
```

Depois instale a build no dispositivo pelo fluxo indicado pelo EAS.

## Observacoes

- Expo Go nao serve para testar `background location`.
- Use aparelho fisico para validar bloqueio de tela/background.
- Sempre gere uma nova development build quando mudar permissoes nativas, plugins no `app.config.ts` ou dependencias nativas.
- O projeto ja possui o profile `development` configurado em `eas.json`.
