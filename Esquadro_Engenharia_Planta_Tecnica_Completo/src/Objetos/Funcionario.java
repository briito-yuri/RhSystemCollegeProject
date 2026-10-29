package Objetos;

public class Funcionario {
    // final: o id é a chave do mapa, então nunca pode mudar depois de criado
    private final String id;
    private final String nome;
    private double salario;
    private String cargo;

    public Funcionario(String id, String nome, double salario, String cargo) {
        this.id = id;
        this.nome = nome;
        this.salario = salario;
        this.cargo = cargo;
    }

    public String getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public double getSalario() {
        return salario;
    }

    public String getCargo() {
        return cargo;
    }

    public void setSalario(double salario) {
        this.salario = salario;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }
}
