# 📝 Skill: Gerador de Release Notes (Release Notes Generator)

Esta skill define o padrão de excelência para a criação de notas de lançamento do projeto **Pomar na Mão**. Ela deve ser utilizada sempre que uma nova versão for consolidada ou quando o usuário solicitar um resumo das alterações recentes.

## 🎯 Objetivo
Transformar commits, diffs e descrições técnicas em notas de lançamento profissionais, claras e categorizadas, focadas no valor entregue tanto para o usuário final quanto para a integridade técnica do sistema.

## 🏗 Estrutura das Notas
Toda release note deve seguir esta estrutura:

1.  **Título e Versão**: `vX.Y.Z - [Nome da Release (opcional)]`
2.  **Resumo Executivo**: Uma frase curta destacando o principal impacto da versão.
3.  **Categorias de Alterações**:
    *   🚀 **Novas Funcionalidades (Features)**: O que há de novo para o usuário.
    *   🐛 **Correções de Bugs (Bug Fixes)**: O que foi consertado.
    *   ⚡ **Melhorias de Performance**: Otimizações e ganhos de velocidade.
    *   🛠 **Refatoração e Manutenção**: Mudanças na estrutura do código sem alteração funcional.
    *   🔒 **Segurança e Infraestrutura**: Alterações em RLS, permissões, banco de dados ou dependências.
4.  **Impacto Técnico (Opcional)**: Detalhes para desenvolvedores (ex: novos hooks, mudanças em schemas).

## ✍️ Tom e Estilo
- **Conciso**: Use bullet points.
- **Impactante**: Comece com verbos de ação (Implementado, Corrigido, Otimizado).
- **Bilíngue (se solicitado)**: Por padrão, use o idioma do projeto (Português), mas esteja pronto para traduzir para Inglês.

## 🔍 Como extrair informações
Ao ser acionado para gerar uma release note:
1.  Verifique o `package.json` para confirmar a versão atual.
2.  Analise o histórico de commits recentes ou o `diff` da última branch.
3.  Agrupe as mudanças logicamente conforme as categorias acima.

## 📖 Exemplo de Uso
> "Antigravity, gere os release notes para a versão 1.4.1 baseado nos meus últimos commits de hoje."

---
*Documento criado para padronização de entregas do projeto Pomar na Mão.*
