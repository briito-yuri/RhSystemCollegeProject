package Resources;


import Objetos.RelatorioFolha;

public class FolhaPagamento {
    private final GestaoPessoal gp;

    public FolhaPagamento(GestaoPessoal sistemaGestaoPessoal) {
        this.gp = sistemaGestaoPessoal;
    }


    public Double calcularInss(double salario) {
        double salarioBase = salario;
        double inss;
        if (salarioBase <= 1412.00) {
            inss = salarioBase * 0.075;
        } else if (salarioBase <= 2666.68) {
            inss = salarioBase * 0.09;
        } else if (salarioBase <= 4000.03) {
            inss = salarioBase * 0.12;
        } else {
            inss = salarioBase * 0.14;
        }
        return inss;
    }

    public Double calcularIrpf(double salario) {
        double salarioBase = salario;
        double inss = calcularInss(salario);
        double baseCalculoIRPF = salarioBase - inss;
        double irpf;
        if (baseCalculoIRPF <= 2112.00) {
            irpf = 0;
        } else if (baseCalculoIRPF <= 2826.65) {
            irpf = (baseCalculoIRPF * 0.075) - 158.40;
        } else if (baseCalculoIRPF <= 3751.05) {
            irpf = (baseCalculoIRPF * 0.15) - 370.40;
        } else if (baseCalculoIRPF <= 4664.68) {
            irpf = (baseCalculoIRPF * 0.225) - 651.73;
        } else {
            irpf = (baseCalculoIRPF * 0.275) - 884.96;
        }
        if (irpf < 0) {
            irpf = 0;
        }
        return irpf;
    }

    public Double calcularFgts(double salario) {
        double salarioBase = salario;
        return salarioBase * 0.08;
    }

    public Double calcularLiquido(double salario) {
        double salarioBase = salario;
        double inss = calcularInss(salario);
        double irpf = calcularIrpf(salario);
        return salarioBase - inss - irpf;
    }

    public Double calcularFerias(double salario) {
        return salario + (salario / 3);
    }

    public Double aliquotaInss(double salario) {
        double salarioBase = salario;
        if (salarioBase <= 1412.00) {
            return 7.5;
        } else if (salarioBase <= 2666.68) {
            return 9.0;
        } else if (salarioBase <= 4000.03) {
            return 12.0;
        }
        return 14.0;
    }

    public Double aliquotaIrpf(double salario) {
        // o IRPF usa o salário já sem o INSS, igual ao calcularIrpf
        double baseCalculoIRPF = salario - calcularInss(salario);
        if (baseCalculoIRPF <= 2112.00) {
            return 0.0;
        } else if (baseCalculoIRPF <= 2826.65) {
            return 7.5;
        } else if (baseCalculoIRPF <= 3751.05) {
            return 15.0;
        } else if (baseCalculoIRPF <= 4664.68) {
            return 22.5;
        }
        return 27.5;
    }

    public RelatorioFolha gerarDadosRelatorioEmpresa() {
        double totalBruto = 0, totalInss = 0, totalIrpf = 0, totalFgts = 0, totalLiquido = 0;
        int qtd = gp.listarFuncionarios().size();

        if (qtd == 0) {
            return null;
        }

        for (int i = 0; i < qtd; i++) {
            double salario = gp.listarFuncionarios().get(i).getSalario();
            totalInss += calcularInss(salario);
            totalIrpf += calcularIrpf(salario);
            totalFgts += calcularFgts(salario);
            totalBruto += salario;
            totalLiquido += (salario - calcularInss(salario) - calcularIrpf(salario));
        }

        return new RelatorioFolha(qtd, totalBruto, totalInss, totalIrpf, totalFgts, totalLiquido);
    }


}
