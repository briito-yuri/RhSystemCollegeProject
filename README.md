# 📐 HR & Payroll Management System — Esquadro Engenharia Ltda.

![Java](https://img.shields.io/badge/Java-JDK_11%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Architecture](https://img.shields.io/badge/Dependencies-Zero-F2D27A?style=for-the-badge)

A full-stack **Human Resources and Payroll Management System** developed for the fictional engineering firm **Esquadro Engenharia Ltda.** as an academic project for the **Information Systems** undergraduate program (1st semester · CESMAC).

The application features a custom **Engineering Blueprint (*Planta Técnica*)** interface built with HTML5, CSS3, and Vanilla JavaScript, powered by a **100% pure Java backend** using the JDK's native HTTP server and in-memory data structures—with zero external frameworks or libraries.

---

## ✨ Features & Blueprint Sheets (Folhas 01–09)

Every screen is structured as an authentic engineering blueprint sheet with a top directory path, numbered sidebar navigation, `DET. A` (main workspace) and `DET. B` (supporting context) panels, and a technical title block (*carimbo*) in the footer:

### 🔐 Access & Security
* **Sheet 01 — Login (`SistemaRhLogin.java`):** Restricted access authentication featuring a real-time login attempt counter (`0 / 3`) that locks after three failed attempts, plus session persistence across page reloads (`localStorage`).

### 👥 Personnel Management (`GestaoPessoal.java`)
* **Sheet 02 — Main Menu (`02 | Listar funcionários`):** Executive overview displaying active headcount, total gross payroll, combined tax withholdings (`INSS + IRPF`), and total net pay, paired with an interactive employee table and a quick payslip summary in `DET. B`.
* **Sheet 03 — Register Employee (`01 | Cadastrar funcionário`):** Employee onboarding form (ID, Full Name, Role, Base Salary) with duplicate ID prevention on the `TreeMap` and a live payroll preview (`DET. B`) calculated dynamically as the salary is typed.
* **Sheet 04 — Update Role (`03 | Atualizar cargo`):** Side-by-side role transition (`Current Role → New Role`) with an interactive employee selector.
* **Sheet 05 — Update Salary (`04 | Atualizar salário`):** Salary adjustment workflow featuring a real-time 4-column comparison strip (`Difference in R$`, `Adjustment %`, `Current Net Pay`, and `Projected Net Pay`).
* **Sheet 06 — Remove Employee (`05 | Remover funcionário`):** Permanent employee removal with a coral warning banner confirming that the record will be deleted from both the system and the payroll.

### 💰 Payroll Processing (`FolhaPagamento.java`)
* **Sheet 07 — Issue Payslip (`06 | Emitir contracheque`):** Detailed monthly payslip (`10/2026`) displaying base earnings, reference tax brackets (`aliquotaInss` and `aliquotaIrpf`), INSS and IRPF deductions, employer FGTS (`8%`), and highlighted net pay.
* **Sheet 08 — Vacation Simulator (`07 | Simular férias`):** Calculates constitutional vacation pay (`Base Salary + 1/3 bonus`) with visual proportion bars and recalculates INSS, IRPF, and FGTS over the combined vacation total.
* **Sheet 09 — Company Payroll Report (`08 | Relatório da folha`):** Company-wide monthly closing table with per-employee breakdowns, total employer FGTS, and a stacked horizontal bar chart illustrating payroll composition (`Net Pay %`, `INSS %`, and `IRPF %`).

---

## 🛠️ Tech Stack & Architecture

Built from first principles with **zero external dependencies**:

* **Back-end (Pure Java — JDK 11+):**
  * **HTTP Server:** Uses `com.sun.net.httpserver.HttpServer` on port `8080` to serve static web assets and handle RESTful JSON endpoints.
  * **In-Memory Persistence:** Uses `TreeMap<String, Funcionario>` and `ArrayList<Funcionario>` to keep employee records sorted by ID in memory.
  * **Real-Time Terminal Audit Logs:** Prints timestamped (`[HH:mm:ss]`) audit logs to the console for every login attempt, registration, role change, salary adjustment, and removal.
* **Front-end (HTML5, CSS3, Vanilla JS):**
  * **Blueprint Design System:** Dual-grid blueprint background (`#1F3566`), technical borders, and semantic color rules (`#F2D27A` yellow for primary focus/net values; `#F0A08C` coral for destructive/exit actions).
  * **Typography:** *IBM Plex Sans Condensed* (headers), *IBM Plex Mono* (monetary values, IDs, and technical labels), and *IBM Plex Sans* (body copy).

---

## 📂 Project Structure

```text
├── executar_mac_linux.sh          # Build & run script for macOS / Linux
├── executar_windows.bat           # Build & run script for Windows
├── src/
│   ├── MainWeb.java               # Entry point that starts the HTTP server
│   ├── Objetos/
│   │   ├── Funcionario.java       # Employee domain entity
│   │   └── RelatorioFolha.java    # Company payroll summary DTO
│   ├── Resources/
│   │   ├── GestaoPessoal.java     # In-memory CRUD using TreeMap
│   │   ├── FolhaPagamento.java    # INSS, IRPF, FGTS, Vacation & Report logic
│   │   └── SistemaRhLogin.java    # Authentication validation
│   └── Servidor/
│       └── ServidorRH.java        # Native HTTP server, JSON routes & console logger
└── web/
    ├── index.html                 # Single-page structure for all 9 blueprint sheets
    ├── estilo.css                 # Blueprint grid, color palette & layout styles
    └── app.js                     # State management, session persistence & Fetch API calls
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Java JDK (11 or higher)** installed:
```bash
java -version
javac -version
```

### Running the Application

#### macOS / Linux:
```bash
sh executar_mac_linux.sh
```

#### Windows:
```cmd
executar_windows.bat
```

### Accessing the System
1. Open your browser at **[http://localhost:8080](http://localhost:8080)**.
2. Log in on **Sheet 01** using the default credentials configured in `SistemaRhLogin.java`:
   * **User:** `1`
   * **Password:** `1`
3. Check your terminal window as you interact with the app to see the live audit logs for every operation.

---

## 🔌 API Endpoints (`ServidorRH.java`)

| Method | Endpoint | Description | Java Method Invoked |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/login` | Authenticates user and tracks 3-attempt limit | `SistemaRhLogin.login()` |
| `GET` | `/api/funcionarios` | Lists all active employees with payroll data | `GestaoPessoal.listarFuncionarios()` |
| `POST` | `/api/funcionarios` | Registers a new employee if ID is unique | `GestaoPessoal.cadastrarFuncionario()` |
| `POST` | `/api/cargo` | Updates an employee's role | `GestaoPessoal.atualizarCargo()` |
| `POST` | `/api/salario` | Updates an employee's base salary | `GestaoPessoal.atualizarSalario()` |
| `POST` | `/api/remover` | Removes an employee from the `TreeMap` | `GestaoPessoal.removerFuncionario()` |
| `GET` | `/api/contracheque?id=X` | Calculates detailed payslip for an employee | `FolhaPagamento` (`calcularInss`, `calcularIrpf`, `calcularFgts`, `calcularLiquido`) |
| `GET` | `/api/ferias?id=X` | Simulates vacation pay (`salary + 1/3`) and taxes | `FolhaPagamento.calcularFerias()` |
| `GET` | `/api/previa?salario=X` | Real-time tax & net salary preview | `FolhaPagamento` |
| `GET` | `/api/relatorio` | Generates company-wide payroll totals | `FolhaPagamento.gerarDadosRelatorioEmpresa()` |
