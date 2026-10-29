package Objetos;

public class RelatorioFolha {
    public int qtdFuncionarios;
    public double totalBruto;
    public double totalInss;
    public double totalIrpf;
    public double totalFgts;
    public double totalLiquido;

    public RelatorioFolha(int qtd, double bruto, double inss, double irpf, double fgts, double liquido) {
        this.qtdFuncionarios = qtd;
        this.totalBruto = bruto;
        this.totalInss = inss;
        this.totalIrpf = irpf;
        this.totalFgts = fgts;
        this.totalLiquido = liquido;
    }
}
