# Marketplace Resilience Monitor 🛡️

> Um dashboard de monitoramento de produtos focado em UX Defensiva, Tratamento de Erros e Engenharia de Caos.

## 🎯 O Objetivo
Este projeto foi desenvolvido para demonstrar competências de **Frontend Resilience**. Diferente de e-commerces tradicionais que focam apenas no "Caminho Feliz", esta aplicação prioriza o comportamento do sistema em cenários de falha (API Down, Latência, Erros 500).

## 🛠️ Stack & Decisões Técnicas
- **React (Vite):** Para performance e componentização.
- **Tailwind CSS:** Para estilização utilitária e responsiva.
- **Chaos Engineering (Simulado):** Implementação de um "Chaos Monkey" no frontend para testar a robustez da interface.
- **DummyJSON API:** Utilizada como mock de dados para garantir estabilidade nos testes de integração.

## 🚀 Funcionalidades Chave
1.  **Chaos Mode Switch:** Um toggle que simula instabilidade de rede/API para validar o tratamento de erros.
2.  **UX Defensiva:** Uso de *Skeleton Screens* para gerenciar a ansiedade do usuário durante o carregamento.
3.  **Recuperação de Falha:** Fluxos de "Retry" claros que permitem ao usuário tentar novamente sem recarregar a página.

## 🔗 Links
- **Deploy:** [Projeto](https://marketplace-resilience-monitor.vercel.app/)
- **LinkedIn:** [LinkedIn](https://www.linkedin.com/in/joaovcmontenegro/)

---
*Projeto desenvolvido como estudo de caso sobre Confiabilidade de Frontend.*