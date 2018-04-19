package precisionFDA.model;

public class BasicAuthProfile {

    private final String basicAuthUsername;

    private final String basicAuthPassword;

    public BasicAuthProfile(final String basicAuthUsername, final String basicAuthPassword) {
        this.basicAuthUsername = basicAuthUsername;
        this.basicAuthPassword = basicAuthPassword;
    }

    public String getBasicAuthUsername() {
        return basicAuthUsername;
    }

    public String getBasicAuthPassword() {
        return basicAuthPassword;
    }
    
}
