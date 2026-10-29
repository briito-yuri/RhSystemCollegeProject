# 📐 Sistema de RH — Esquadro Engenharia Ltda.

![Java](https://img.shields.io/badge/Java-JDK_11%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Status](https://img.shields.io/badge/Status-Concluído-F2D27A?style=for-the-badge)

Sistema web de **Gestão de Pessoal e Folha de Pagamento** desenvolvido para a empresa fictícia **Esquadro Engenharia Ltda.** como projeto acadêmico do curso de **Sistemas de Informação (1º período · CESMAC)**.

A interface foi projetada com a identidade visual de uma **Planta Técnica de Engenharia (*Blueprint*)**, integrando um front-end em HTML, CSS e JavaScript a um back-end 100% em Java puro.

---

## 🎯 O que o Programa Faz

O sistema gerencia todo o ciclo de vida dos funcionários e o processamento mensal da folha de pagamento, dividido em dois módulos principais e **9 folhas de planta técnica**:

### 1. Acesso e Segurança
* **Folha 01 — Login:** Autenticação de acesso restrito com controle real de tentativas (`0 / 3`) integrado à classe `SistemaRhLogin`.

### 2. Módulo: Gestão de Pessoal (`GestaoPessoal.java`)
* **Folha 02 — Menu Principal (`02 | Listar funcionários`):** Painel geral com indicadores consolidados (total de funcionários, folha bruta, soma de INSS + IRPF e líquido a pagar), tabela interativa de colaboradores ativos e visualização rápida do contracheque no bloco lateral (`DET. B`).
* **Folha 03 — Cadastrar Funcionário (`01 | Cadastrar funcionário`):** Registro de novos colaboradores (ID, nome completo, cargo e salário) com validação contra IDs duplicados e **prévia da folha em tempo real** conforme o salário é digitado.
* **Folha 04 — Atualizar Cargo (`03 | Atualizar cargo`):** Alteração de função do colaborador selecionado sem modificar a base salarial.
* **Folha 05 — Atualizar Salário (`04 | Atualizar salário`):** Reajuste salarial com painel comparativo automático que exibe a diferença em R$, o percentual de reajuste (`%`), o salário líquido atual e a projeção do novo salário líquido.
* **Folha 06 — Remover Funcionário (`05 | Remover funcionário`):** Exclusão definitiva do colaborador do cadastro e da folha de pagamento com tela de confirmação de segurança.

### 3. Módulo: Folha de Pagamento (`FolhaPagamento.java`)
* **Folha 07 — Emitir Contracheque (`06 | Emitir contracheque`):** Emissão do holerite detalhado (competência `10/2026`) contendo salário base, alíquotas de referência (`aliquotaInss` e `aliquotaIrpf`), descontos de INSS e IRPF, depósito de FGTS (`8%`) e valor líquido.
* **Folha 08 — Simular Férias (`07 | Simular férias`):** Cálculo de férias remuneradas (`Salário + 1/3 constitucional`) com apuração de INSS, IRPF e FGTS sobre o montante total de férias.
* **Folha 09 — Relatório da Folha (`08 | Relatório da folha`):** Fechamento mensal da empresa com os totais brutos, retenções de impostos, tabela analítica por funcionário, FGTS total a recolher e gráfico em barra empilhada com a composição percentual da folha (`Líquido`, `INSS` e `IRPF`).

---

## 🛠️ Tecnologias e Dependências

O projeto foi construído sob a premissa de **zero dependências externas** (sem frameworks pesados ou bancos de dados externos):

* **Java (JDK 11 ou superior — recomendado JDK 17+):**
  * **Regra de Negócio e Persistência em Memória:** Utiliza `TreeMap<String, Funcionario>` e `ArrayList<Funcionario>` (`java.util`) para manter os registros ordenados em memória durante a execução.
  * **Servidor Web Nativo:** Utiliza a API nativa `com.sun.net.httpserver.HttpServer` do próprio JDK para servir os arquivos estáticos (`web/`) e responder às requisições da API REST em formato JSON na porta `8080`.
* **HTML5, CSS3 & JavaScript (Vanilla ES6+):**
  * **Estilização Blueprint:** Variáveis CSS, CSS Grid/Flexbox e dupla malha quadriculada de fundo (`#1F3566`).
  * **Tipografia Técnica:** Família *IBM Plex Sans Condensed*, *IBM Plex Mono* e *IBM Plex Sans* carregadas via Google Fonts.
  * **Comunicação Assíncrona:** Uso da `Fetch API` nativa do navegador para consumir as rotas do servidor Java sem recarregar a página.

---

## 📂 Estrutura do Projeto

```text
├── executar_mac_linux.sh          # Script de compilação e execução (macOS / Linux)
├── executar_windows.bat           # Script de compilação e execução (Windows)
├── src/
│   ├── MainWeb.java               # Ponto de entrada que inicializa o servidor HTTP
│   ├── Objetos/
│   │   ├── Funcionario.java       # Entidade de domínio do funcionário
│   │   └── RelatorioFolha.java    # Objeto de transferência dos totais da folha
│   ├── Resources/
│   │   ├── GestaoPessoal.java     # CRUD em memória utilizando TreeMap
│   │   ├── FolhaPagamento.java    # Cálculos de INSS, IRPF, FGTS, Férias e Relatório
│   │   └── SistemaRhLogin.java    # Validação de credenciais de acesso
│   └── Servidor/
│       └── ServidorRH.java        # Servidor HTTP nativo (porta 8080) e rotas da API JSON
└── web/
    ├── index.html                 # Estrutura das 9 folhas da Planta Técnica
    ├── estilo.css                 # Design System Blueprint (cores, grades e tipografia)
    └── app.js                     # Lógica de navegação e integração via Fetch API
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
Certifique-se de ter o **Java JDK** instalado e configurado no seu terminal. Para verificar, execute:
```bash
java -version
javac -version
```

### Opção 1: Usando o Script Automático (Recomendado)

#### No macOS ou Linux:
1. Abra o terminal na pasta raiz do projeto.
2. Execute o script de inicialização:
   ```bash
   sh executar_mac_linux.sh
   ```
   *(Ou dê permissão de execução com `chmod +x executar_mac_linux.sh` e rode `./executar_mac_linux.sh`).*

#### No Windows:
1. Dê um duplo clique no arquivo **`executar_windows.bat`** ou execute-o pelo Prompt de Comando / PowerShell:
   ```cmd
   executar_windows.bat
   ```

#### O que o script faz passo a passo?
1. Posiciona o terminal no diretório raiz do projeto.
2. Compila todas as classes Java (`Objetos`, `Resources`, `Servidor` e `MainWeb`) com codificação `UTF-8`:
   ```bash
   javac -encoding UTF-8 src/Objetos/*.java src/Resources/*.java src/Servidor/*.java src/MainWeb.java
   ```
3. Verifica se a compilação ocorreu sem erros.
4. Inicia a máquina virtual Java executando a classe `MainWeb` com suporte a caracteres `UTF-8`:
   ```bash
   java -Dfile.encoding=UTF-8 -cp src MainWeb
   ```

### Opção 2: Acessando no Navegador
Assim que o terminal exibir a mensagem de que o servidor está ativo, abra o seu navegador em:
👉 **[http://localhost:8080](http://localhost:8080)**

* **Credenciais de Acesso Padrão (`SistemaRhLogin.java`):**
  * **Usuário:** `1`
  * **Senha:** `1`

> 💡 **Dados Pré-carregados:** Ao iniciar, o servidor carrega automaticamente 6 funcionários de exemplo na memória (`Ana Souza`, `Carlos Lima`, `Beatriz Melo`, `Diego Rocha`, `Fernanda Alves` e `Gustavo Pires`) para facilitar os testes imediatos de todas as telas.

---

## 🔌 Rotas da API (Back-end Java)

O `ServidorRH.java` expõe os seguintes endpoints consumidos pelo front-end:

| Método | Rota | Descrição | Classe/Método Java Acionado |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/login` | Autentica o usuário e controla o limite de 3 tentativas | `SistemaRhLogin.login()` |
| `GET` | `/api/funcionarios` | Lista todos os funcionários ativos com cálculos de folha | `GestaoPessoal.listarFuncionarios()` |
| `POST` | `/api/funcionarios` | Cadastra um novo funcionário se o ID for único | `GestaoPessoal.cadastrarFuncionario()` |
| `POST` | `/api/cargo` | Atualiza o cargo de um funcionário existente | `GestaoPessoal.atualizarCargo()` |
| `POST` | `/api/salario` | Atualiza o salário base de um funcionário | `GestaoPessoal.atualizarSalario()` |
| `POST` | `/api/remover` | Remove permanentemente um funcionário pelo ID | `GestaoPessoal.removerFuncionario()` |
| `GET` | `/api/contracheque?id=X` | Retorna os dados detalhados do holerite do funcionário | `FolhaPagamento` (`calcularInss`, `calcularIrpf`, `calcularFgts`, `calcularLiquido`) |
| `GET` | `/api/ferias?id=X` | Calcula férias (`salário + 1/3`) e impostos incidentes | `FolhaPagamento.calcularFerias()` |
| `GET` | `/api/previa?salario=X` | Simula descontos e salário líquido em tempo real | `FolhaPagamento` (cálculos e alíquotas) |
| `GET` | `/api/relatorio` | Retorna o consolidado geral da folha da empresa | `FolhaPagamento.gerarDadosRelatorioEmpresa()` |

---

## 🎨 Paleta de Cores — Design "Planta Técnica"

| Uso | Hexadecimal | Aplicação na Interface |
| :--- | :--- | :--- |
| **Azul de Planta (Fundo)** | `#1F3566` | Fundo quadriculado principal de todas as folhas |
| **Fundo dos Blocos** | `#1A2D57` | Painéis `DET. A`, `DET. B`, tabelas e cartões |
| **Fundo dos Campos** | `#15254A` | Caixas de entrada de texto (`input`) |
| **Linhas e Texto Principal** | `#EEF2FF` | Molduras técnicas, títulos e valores principais |
| **Texto Secundário** | `#B9C6E8` | Rótulos técnicos em maiúsculas, legendas e carimbo |
| **Amarelo (Destaque)** | `#F2D27A` | Item ativo do menu, linha selecionada, botão principal e valor líquido |
| **Coral (Perigo / Saída)** | `#F0A08C` | Botão de sair do sistema, alertas de atenção e remoção de funcionário |
