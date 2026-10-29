package Resources;

import Objetos.Funcionario;

import java.util.ArrayList;
import java.util.TreeMap;

public class GestaoPessoal {
    private final TreeMap<String, Funcionario> baseDados = new TreeMap<>();

    public Boolean cadastrarFuncionario(String id, String nome, double salario, String cargo) {
        if (baseDados.containsKey(id)) {
            return false;
        }
        Funcionario novoFuncionario = new Funcionario(id, nome, salario, cargo);
        baseDados.put(id, novoFuncionario);
        return true;
    }

    public Funcionario retornarFuncionario(String id) {
        return baseDados.get(id);
    }

    public ArrayList<Funcionario> listarFuncionarios() {
        ArrayList<Funcionario> listaFuncionarios = new ArrayList<>();
        listaFuncionarios.addAll(baseDados.values());
        return listaFuncionarios;
    }

    public boolean atualizarCargo(String id, String novoCargo) {
        if (baseDados.containsKey(id)) {
            baseDados.get(id).setCargo(novoCargo);

            return true;
        }
        return false;
    }

    public boolean atualizarSalario(String id, Double novoSalario) {
        if (baseDados.containsKey(id)) {
            baseDados.get(id).setSalario(novoSalario);
            return true;
        }
        return false;
    }

    public boolean removerFuncionario(String id) {
        if (baseDados.containsKey(id)) {
            baseDados.remove(id);
            return true;
        }
        return false;

    }

}
