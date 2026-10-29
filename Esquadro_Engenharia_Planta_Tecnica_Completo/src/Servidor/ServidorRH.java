package Servidor;

import Objetos.Funcionario;
import Objetos.RelatorioFolha;
import Resources.FolhaPagamento;
import Resources.GestaoPessoal;
import Resources.SistemaRhLogin;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class ServidorRH {
    private final GestaoPessoal gestaoPessoal = new GestaoPessoal();
    private final FolhaPagamento folhaPagamento = new FolhaPagamento(gestaoPessoal);
    private final SistemaRhLogin sistemaLogin = new SistemaRhLogin();
    private int tentativasLogin = 0;
    private static final DateTimeFormatter FMT_HORA = DateTimeFormatter.ofPattern("HH:mm:ss");

    public ServidorRH() {
        // Valores de exemplo iniciais idênticos ao DESIGN_PLANTA_TECNICA.md
        gestaoPessoal.cadastrarFuncionario("001", "Ana Souza", 3200.00, "Analista de RH");
        gestaoPessoal.cadastrarFuncionario("002", "Carlos Lima", 2500.45, "Auxiliar administrativo");
        gestaoPessoal.cadastrarFuncionario("003", "Beatriz Melo", 5800.00, "Gerente de projetos");
        gestaoPessoal.cadastrarFuncionario("004", "Diego Rocha", 2900.00, "Desenhista técnico");
        gestaoPessoal.cadastrarFuncionario("005", "Fernanda Alves", 7400.00, "Engenheira civil");
        gestaoPessoal.cadastrarFuncionario("006", "Gustavo Pires", 1400.00, "Estagiário");
    }

    private void registrarLog(String categoria, String mensagem) {
        String horario = LocalDateTime.now().format(FMT_HORA);
        System.out.printf("[%s] [%s] %s%n", horario, categoria, mensagem);
    }

    public void iniciar() throws IOException {
        HttpServer servidor = HttpServer.create(new InetSocketAddress(8080), 0);

        servidor.createContext("/", new ArquivosEstaticosHandler());
        servidor.createContext("/api/", new ApiHandler());

        servidor.setExecutor(null);
        servidor.start();
        System.out.println("==============================================================");
        System.out.println("  ESQUADRO ENGENHARIA LTDA. — SISTEMA DE RH (PLANTA TECNICA)  ");
        System.out.println("  Servidor ativo em: http://localhost:8080                    ");
        System.out.println("  Login padrao (SistemaRhLogin.java): Usuario = 1 | Senha = 1 ");
        System.out.println("  Logs de auditoria ativados neste terminal:                  ");
        System.out.println("==============================================================");
        registrarLog("SISTEMA", "Base inicial carregada com 6 funcionarios no TreeMap.");
    }

    private class ArquivosEstaticosHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange troca) throws IOException {
            String caminho = troca.getRequestURI().getPath();
            if (caminho.equals("/") || caminho.isEmpty()) {
                caminho = "/index.html";
            }

            Path arquivo = Path.of("web" + caminho).normalize();
            if (!arquivo.startsWith(Path.of("web").normalize()) || !Files.exists(arquivo) || Files.isDirectory(arquivo)) {
                byte[] msg = "404 - Arquivo nao encontrado".getBytes(StandardCharsets.UTF_8);
                troca.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
                troca.sendResponseHeaders(404, msg.length);
                try (OutputStream os = troca.getResponseBody()) {
                    os.write(msg);
                }
                return;
            }

            String contentType = "text/plain; charset=utf-8";
            if (caminho.endsWith(".html")) contentType = "text/html; charset=utf-8";
            else if (caminho.endsWith(".css")) contentType = "text/css; charset=utf-8";
            else if (caminho.endsWith(".js")) contentType = "application/javascript; charset=utf-8";
            else if (caminho.endsWith(".svg")) contentType = "image/svg+xml";

            byte[] conteudo = Files.readAllBytes(arquivo);
            troca.getResponseHeaders().set("Content-Type", contentType);
            troca.sendResponseHeaders(200, conteudo.length);
            try (OutputStream os = troca.getResponseBody()) {
                os.write(conteudo);
            }
        }
    }

    private class ApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange troca) throws IOException {
            String rota = troca.getRequestURI().getPath();
            String metodo = troca.getRequestMethod();
            Map<String, String> query = parseQuery(troca.getRequestURI().getRawQuery());

            try {
                if (rota.equals("/api/login") && metodo.equals("POST")) {
                    String body = lerBody(troca);
                    String usuario = extrairCampoJson(body, "usuario");
                    String senha = extrairCampoJson(body, "senha");

                    if (tentativasLogin >= 3) {
                        registrarLog("LOGIN", "Tentativa bloqueada (limite 3/3 excedido) para usuario '" + usuario + "'.");
                        enviarJson(troca, 200, String.format(Locale.US,
                                "{\"sucesso\":false,\"bloqueado\":true,\"tentativas\":%d,\"mensagem\":\"Limite de 3 tentativas excedido.\"}",
                                tentativasLogin));
                        return;
                    }

                    boolean autenticado = sistemaLogin.login(usuario, senha);
                    if (autenticado) {
                        tentativasLogin = 0;
                        registrarLog("LOGIN", "Acesso autorizado para o usuario '" + usuario + "'.");
                        enviarJson(troca, 200, "{\"sucesso\":true,\"tentativas\":0,\"usuario\":\"Admin\"}");
                    } else {
                        tentativasLogin++;
                        registrarLog("LOGIN", "Falha de autenticacao para usuario '" + usuario + "' (Tentativa " + tentativasLogin + "/3).");
                        enviarJson(troca, 200, String.format(Locale.US,
                                "{\"sucesso\":false,\"bloqueado\":%b,\"tentativas\":%d,\"mensagem\":\"Usuário ou senha inválidos.\"}",
                                tentativasLogin >= 3, tentativasLogin));
                    }
                    return;
                }

                if (rota.equals("/api/login/reset") && metodo.equals("POST")) {
                    tentativasLogin = 0;
                    registrarLog("LOGIN", "Contador de tentativas de login reiniciado.");
                    enviarJson(troca, 200, "{\"sucesso\":true,\"tentativas\":0}");
                    return;
                }

                if (rota.equals("/api/funcionarios") && metodo.equals("GET")) {
                    ArrayList<Funcionario> lista = gestaoPessoal.listarFuncionarios();
                    StringBuilder sb = new StringBuilder("[");
                    for (int i = 0; i < lista.size(); i++) {
                        if (i > 0) sb.append(",");
                        sb.append(funcionarioParaJson(lista.get(i)));
                    }
                    sb.append("]");
                    enviarJson(troca, 200, sb.toString());
                    return;
                }

                if ((rota.equals("/api/funcionarios") || rota.equals("/api/cadastrar")) && metodo.equals("POST")) {
                    String body = lerBody(troca);
                    String id = extrairCampoJson(body, "id").trim();
                    String nome = extrairCampoJson(body, "nome").trim();
                    String cargo = extrairCampoJson(body, "cargo").trim();
                    String salarioStr = extrairCampoJson(body, "salario").replace(",", ".").trim();

                    if (id.isEmpty() || nome.isEmpty() || cargo.isEmpty() || salarioStr.isEmpty()) {
                        registrarLog("CADASTRO", "Tentativa invalida: campos obrigatorios em branco.");
                        enviarJson(troca, 400, "{\"sucesso\":false,\"mensagem\":\"Preencha todos os campos.\"}");
                        return;
                    }

                    double salario = Double.parseDouble(salarioStr);
                    if (salario <= 0) {
                        registrarLog("CADASTRO", "Tentativa invalida para ID " + id + ": salario <= 0.");
                        enviarJson(troca, 400, "{\"sucesso\":false,\"mensagem\":\"O salário deve ser maior que zero.\"}");
                        return;
                    }

                    boolean ok = gestaoPessoal.cadastrarFuncionario(id, nome, salario, cargo);
                    if (ok) {
                        registrarLog("CADASTRO", String.format("Novo funcionario cadastrado -> ID: %s | Nome: %s | Cargo: %s | Salario: R$ %.2f", id, nome, cargo, salario));
                        enviarJson(troca, 200, "{\"sucesso\":true,\"mensagem\":\"Funcionário cadastrado com sucesso.\"}");
                    } else {
                        registrarLog("CADASTRO", "Recusado -> O ID '" + id + "' ja existe no TreeMap.");
                        enviarJson(troca, 200, "{\"sucesso\":false,\"mensagem\":\"O ID não pode se repetir. Se ele já existir, o cadastro é recusado.\"}");
                    }
                    return;
                }

                if (rota.equals("/api/cargo") && metodo.equals("POST")) {
                    String body = lerBody(troca);
                    String id = extrairCampoJson(body, "id").trim();
                    String novoCargo = extrairCampoJson(body, "cargo").trim();
                    if (novoCargo.isEmpty()) {
                        enviarJson(troca, 400, "{\"sucesso\":false,\"mensagem\":\"Informe o novo cargo.\"}");
                        return;
                    }
                    Funcionario fAntes = gestaoPessoal.retornarFuncionario(id);
                    String cargoAntigo = fAntes != null ? fAntes.getCargo() : "N/A";
                    String nomeFunc = fAntes != null ? fAntes.getNome() : id;

                    boolean ok = gestaoPessoal.atualizarCargo(id, novoCargo);
                    if (ok) {
                        registrarLog("CARGO", String.format("ID %s (%s): '%s' -> '%s'", id, nomeFunc, cargoAntigo, novoCargo));
                    } else {
                        registrarLog("CARGO", "Falha ao atualizar cargo: ID " + id + " nao encontrado.");
                    }
                    enviarJson(troca, 200, "{\"sucesso\":" + ok + "}");
                    return;
                }

                if (rota.equals("/api/salario") && metodo.equals("POST")) {
                    String body = lerBody(troca);
                    String id = extrairCampoJson(body, "id").trim();
                    String salarioStr = extrairCampoJson(body, "salario").replace(",", ".").trim();
                    double novoSalario = Double.parseDouble(salarioStr);
                    if (novoSalario <= 0) {
                        enviarJson(troca, 400, "{\"sucesso\":false,\"mensagem\":\"O novo salário deve ser maior que zero.\"}");
                        return;
                    }
                    Funcionario fAntes = gestaoPessoal.retornarFuncionario(id);
                    double salarioAntigo = fAntes != null ? fAntes.getSalario() : 0.0;
                    String nomeFunc = fAntes != null ? fAntes.getNome() : id;

                    boolean ok = gestaoPessoal.atualizarSalario(id, novoSalario);
                    if (ok) {
                        registrarLog("SALARIO", String.format("ID %s (%s): R$ %.2f -> R$ %.2f", id, nomeFunc, salarioAntigo, novoSalario));
                    } else {
                        registrarLog("SALARIO", "Falha ao atualizar salario: ID " + id + " nao encontrado.");
                    }
                    enviarJson(troca, 200, "{\"sucesso\":" + ok + "}");
                    return;
                }

                if (rota.equals("/api/remover") && metodo.equals("POST")) {
                    String body = lerBody(troca);
                    String id = extrairCampoJson(body, "id").trim();
                    Funcionario fAntes = gestaoPessoal.retornarFuncionario(id);
                    String nomeFunc = fAntes != null ? fAntes.getNome() : "Desconhecido";

                    boolean ok = gestaoPessoal.removerFuncionario(id);
                    if (ok) {
                        registrarLog("REMOCAO", String.format("Funcionario removido -> ID: %s | Nome: %s", id, nomeFunc));
                    } else {
                        registrarLog("REMOCAO", "Falha ao remover: ID " + id + " nao encontrado.");
                    }
                    enviarJson(troca, 200, "{\"sucesso\":" + ok + "}");
                    return;
                }

                if (rota.equals("/api/contracheque") && metodo.equals("GET")) {
                    String id = query.getOrDefault("id", "");
                    Funcionario f = gestaoPessoal.retornarFuncionario(id);
                    if (f == null) {
                        enviarJson(troca, 404, "{\"erro\":\"Funcionário não encontrado\"}");
                        return;
                    }
                    enviarJson(troca, 200, funcionarioParaJson(f));
                    return;
                }

                if (rota.equals("/api/ferias") && metodo.equals("GET")) {
                    String id = query.getOrDefault("id", "");
                    Funcionario f = gestaoPessoal.retornarFuncionario(id);
                    if (f == null) {
                        enviarJson(troca, 404, "{\"erro\":\"Funcionário não encontrado\"}");
                        return;
                    }
                    double salario = f.getSalario();
                    double totalFerias = folhaPagamento.calcularFerias(salario);
                    double umTerco = totalFerias - salario;
                    double inss = folhaPagamento.calcularInss(totalFerias);
                    double irpf = folhaPagamento.calcularIrpf(totalFerias);
                    double fgts = folhaPagamento.calcularFgts(totalFerias);
                    double liquido = folhaPagamento.calcularLiquido(totalFerias);
                    double aliqInss = folhaPagamento.aliquotaInss(totalFerias);
                    double aliqIrpf = folhaPagamento.aliquotaIrpf(totalFerias);

                    String json = String.format(Locale.US,
                            "{\"id\":\"%s\",\"nome\":\"%s\",\"cargo\":\"%s\",\"salario\":%.2f,\"umTerco\":%.2f,\"totalFerias\":%.2f,\"inss\":%.2f,\"irpf\":%.2f,\"fgts\":%.2f,\"liquido\":%.2f,\"aliquotaInss\":%.1f,\"aliquotaIrpf\":%.1f}",
                            escaparJson(f.getId()), escaparJson(f.getNome()), escaparJson(f.getCargo()),
                            salario, umTerco, totalFerias, inss, irpf, fgts, liquido, aliqInss, aliqIrpf);
                    enviarJson(troca, 200, json);
                    return;
                }

                if (rota.equals("/api/previa") && metodo.equals("GET")) {
                    String salStr = query.getOrDefault("salario", "0").replace(",", ".");
                    double salario = 0;
                    try {
                        salario = Double.parseDouble(salStr);
                    } catch (NumberFormatException ignored) {}
                    if (salario < 0) salario = 0;

                    double inss = salario > 0 ? folhaPagamento.calcularInss(salario) : 0;
                    double irpf = salario > 0 ? folhaPagamento.calcularIrpf(salario) : 0;
                    double fgts = salario > 0 ? folhaPagamento.calcularFgts(salario) : 0;
                    double liquido = salario > 0 ? folhaPagamento.calcularLiquido(salario) : 0;
                    double aliqInss = salario > 0 ? folhaPagamento.aliquotaInss(salario) : 7.5;
                    double aliqIrpf = salario > 0 ? folhaPagamento.aliquotaIrpf(salario) : 0.0;

                    String json = String.format(Locale.US,
                            "{\"salario\":%.2f,\"inss\":%.2f,\"irpf\":%.2f,\"fgts\":%.2f,\"liquido\":%.2f,\"aliquotaInss\":%.1f,\"aliquotaIrpf\":%.1f}",
                            salario, inss, irpf, fgts, liquido, aliqInss, aliqIrpf);
                    enviarJson(troca, 200, json);
                    return;
                }

                if (rota.equals("/api/relatorio") && metodo.equals("GET")) {
                    RelatorioFolha r = folhaPagamento.gerarDadosRelatorioEmpresa();
                    ArrayList<Funcionario> lista = gestaoPessoal.listarFuncionarios();
                    StringBuilder funcsJson = new StringBuilder("[");
                    for (int i = 0; i < lista.size(); i++) {
                        if (i > 0) funcsJson.append(",");
                        funcsJson.append(funcionarioParaJson(lista.get(i)));
                    }
                    funcsJson.append("]");

                    if (r == null) {
                        enviarJson(troca, 200, "{\"qtd\":0,\"bruto\":0,\"inss\":0,\"irpf\":0,\"fgts\":0,\"liquido\":0,\"funcionarios\":[]}");
                        return;
                    }

                    String json = String.format(Locale.US,
                            "{\"qtd\":%d,\"bruto\":%.2f,\"inss\":%.2f,\"irpf\":%.2f,\"fgts\":%.2f,\"liquido\":%.2f,\"funcionarios\":%s}",
                            r.qtdFuncionarios, r.totalBruto, r.totalInss, r.totalIrpf, r.totalFgts, r.totalLiquido, funcsJson);
                    enviarJson(troca, 200, json);
                    return;
                }

                enviarJson(troca, 404, "{\"erro\":\"Rota não encontrada\"}");
            } catch (Exception e) {
                e.printStackTrace();
                enviarJson(troca, 500, "{\"sucesso\":false,\"mensagem\":\"Erro interno ao processar requisição.\"}");
            }
        }
    }

    private String funcionarioParaJson(Funcionario f) {
        double s = f.getSalario();
        double inss = folhaPagamento.calcularInss(s);
        double irpf = folhaPagamento.calcularIrpf(s);
        double fgts = folhaPagamento.calcularFgts(s);
        double liquido = folhaPagamento.calcularLiquido(s);
        double aliqInss = folhaPagamento.aliquotaInss(s);
        double aliqIrpf = folhaPagamento.aliquotaIrpf(s);
        double descontos = inss + irpf;

        return String.format(Locale.US,
                "{\"id\":\"%s\",\"nome\":\"%s\",\"cargo\":\"%s\",\"salario\":%.2f,\"inss\":%.2f,\"irpf\":%.2f,\"fgts\":%.2f,\"liquido\":%.2f,\"descontos\":%.2f,\"aliquotaInss\":%.1f,\"aliquotaIrpf\":%.1f}",
                escaparJson(f.getId()), escaparJson(f.getNome()), escaparJson(f.getCargo()),
                s, inss, irpf, fgts, liquido, descontos, aliqInss, aliqIrpf);
    }

    private static String lerBody(HttpExchange troca) throws IOException {
        try (InputStream is = troca.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private static void enviarJson(HttpExchange troca, int status, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        troca.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        troca.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = troca.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static Map<String, String> parseQuery(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null || query.isEmpty()) return map;
        for (String param : query.split("&")) {
            String[] par = param.split("=", 2);
            String k = URLDecoder.decode(par[0], StandardCharsets.UTF_8);
            String v = par.length > 1 ? URLDecoder.decode(par[1], StandardCharsets.UTF_8) : "";
            map.put(k, v);
        }
        return map;
    }

    private static String extrairCampoJson(String json, String chave) {
        String padrao = "\"" + chave + "\"";
        int idx = json.indexOf(padrao);
        if (idx == -1) return "";
        int doisPontos = json.indexOf(":", idx + padrao.length());
        if (doisPontos == -1) return "";
        String resto = json.substring(doisPontos + 1).trim();
        if (resto.startsWith("\"")) {
            StringBuilder valor = new StringBuilder();
            boolean escapando = false;
            for (int i = 1; i < resto.length(); i++) {
                char c = resto.charAt(i);
                if (escapando) {
                    valor.append(c);
                    escapando = false;
                } else if (c == '\\') {
                    escapando = true;
                } else if (c == '"') {
                    break;
                } else {
                    valor.append(c);
                }
            }
            return valor.toString();
        } else {
            int fim = 0;
            while (fim < resto.length() && resto.charAt(fim) != ',' && resto.charAt(fim) != '}') {
                fim++;
            }
            return resto.substring(0, fim).trim();
        }
    }

    private static String escaparJson(String texto) {
        if (texto == null) return "";
        return texto.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
