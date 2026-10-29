package Resources;

public class SistemaRhLogin {
    public boolean login(String login, String senha) {
        String loginDB = "1";
        String senhDb = "1";
        return login.equals(loginDB) && senha.equals(senhDb);

    }
}
