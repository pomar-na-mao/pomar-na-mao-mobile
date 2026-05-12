# Pomar na Mão 🍎🌳

<p align="center">
  <strong>Uma solução móvel avançada para gestão de pomares, rotinas agrícolas e melhor uso de recursos.</strong>
</p>

<p align="center">
  <a href="https://expo.dev">
    <img src="https://img.shields.io/badge/Desenvolvido%20com-Expo-4630EB.svg?style=flat-square&logo=expo" alt="Desenvolvido com Expo" />
  </a>
  <img src="https://img.shields.io/badge/TypeScript-5.9+-3178C6.svg?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React%20Native-0.81-61DAFB.svg?style=flat-square&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Vers%C3%A3o-1.4.1-brightgreen.svg?style=flat-square" alt="Versão" />
</p>

---

## 📱 Visão Geral

O **Pomar na Mão** é um aplicativo móvel completo projetado para gerenciamento de pomares com eficiência. O app permite que trabalhadores de campo executem rotinas sistemáticas utilizando geolocalização por GPS, monitorem o estado de saúde das plantas e sincronizem dados de forma robusta, tanto online quanto offline.

### 🚀 Funcionalidades

- 🚜 **Modo de Revisão de Pulverização** - Novo sistema para revisar sessões de pulverização, permitindo ajustes manuais em plantas tratadas e acompanhamento via cronômetro de precisão.
- 🔄 **Sincronização Inteligente** - Fluxo de dados offline-first aprimorado com políticas de segurança (RLS) otimizadas no Supabase para garantir a integridade dos dados.
- 🌙 **Suporte a Modo Escuro** - Interface moderna e premium com suporte nativo a temas Claro e Escuro, utilizando efeitos de _glassmorphism_.
- 📊 **Dashboard de Métricas** - Visualização em tempo real de estatísticas críticas, como total de sessões de pulverização e novas plantas cadastradas.
- 🗺️ **Mapas Avançados** - Georeferenciamento com visualização de regiões via polígonos (Convex Hull) e modais interativos para inspeção detalhada.
- 👤 **Gestão de Perfil** - Integração total com Supabase Auth para exibição dinâmica de dados do usuário, avatares e níveis de acesso.
- 🌱 **Monitoramento de Plantas** - Gestão completa de dados incluindo variedade, massa, ciclo de vida e histórico de ocorrências.
- ✨ **UI/UX Premium** - Componentes de interface reutilizáveis e altamente performáticos, com validação rigorosa via Zod e React Hook Form.

---

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura modular com clara separação de responsabilidades:

```
src/
├── app/                    # Telas e layouts (Expo Router)
├── data/                   # Camada de dados (Repositórios, serviços, stores)
│   ├── repositories/       # Objetos de acesso a dados (Supabase/SQLite)
│   ├── services/           # Lógica de negócio e integrações
│   └── store/              # Gerenciamento de estado com Zustand
├── domain/                 # Camada de domínio (Modelos e esquemas)
│   └── models/             # Entidades de negócio
├── shared/                 # Utilitários e constantes compartilhadas
│   ├── themes/             # Definições de temas (Light/Dark)
│   ├── constants/          # Mensagens, valores e chaves fixas
│   └── styles/             # Estilização global
├── ui/                     # Camada de apresentação (Componentes)
│   ├── add-plant/          # Componentes para adição de plantas
│   ├── annotation/         # Componentes de anotação e inspeção
│   ├── routines/           # Componentes de rotinas de campo
│   └── shared/             # Componentes de UI reutilizáveis
└── utils/                  # Funções utilitárias
    ├── date/               # Formatação de datas
    ├── geolocation/        # Cálculos de GPS e geometria
    └── plant-data/         # Processamento de dados agrícolas
```

### Stack Tecnológica

| Categoria       | Tecnologia                        |
| --------------- | --------------------------------- |
| **Framework**   | Expo SDK 54 + React Native 0.81   |
| **Linguagem**   | TypeScript 5.9                    |
| **Navegação**   | Expo Router 6                     |
| **Estado**      | Zustand 5                         |
| **Backend**     | Supabase (Auth + PostgreSQL)      |
| **Banco Local** | Expo SQLite                       |
| **Mapas**       | React Native Maps                 |
| **Formulários** | React Hook Form + Zod             |
| **Cache/HTTP**  | TanStack Query (React Query)      |
| **Estilização** | StyleSheet + Expo Linear Gradient |
| **Validação**   | Zod Schema Validation             |

---

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm
- Expo CLI instalado globalmente

### Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/lucasspeixoto/pomar-na-mao-mobile.git
cd pomar-na-mao-mobile
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_do_google_maps
```

4. **Inicie o servidor de desenvolvimento**

```bash
npm start
```

---

## 📄 Licença

Este projeto é privado e proprietário. Todos os direitos reservados.

---

## 👨‍💻 Autor

**Lucas Peixoto** - [GitHub](https://github.com/lucasspeixoto)

---

<div align="center">
  <sub>Desenvolvido com ❤️ para a agricultura moderna</sub>
</div>
