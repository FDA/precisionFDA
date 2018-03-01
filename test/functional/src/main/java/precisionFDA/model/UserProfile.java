package precisionFDA.model;

public class UserProfile {

    private final String basicAuthUsername;

    private final String basicAuthPassword;

    private final String applUsername;

    private final String applPassword;

    private final String applUserFullName;

    private final String applUserOrg;

    public UserProfile(final String basicAuthUsername, final String basicAuthPassword,
                       final String applUsername, final String applPassword,
                       final String applUserFullName, final String applUserOrg) {
        this.basicAuthUsername = basicAuthUsername;
        this.basicAuthPassword = basicAuthPassword;
        this.applUsername = applUsername;
        this.applPassword = applPassword;
        this.applUserFullName = applUserFullName;
        this.applUserOrg = applUserOrg;
    }

    public String getBasicAuthUsername() {
        return basicAuthUsername;
    }

    public String getBasicAuthPassword() {
        return basicAuthPassword;
    }

    public String getApplUsername() {
        return applUsername;
    }

    public String getApplPassword() {
        return applPassword;
    }

    public String getApplUserFullName() {
        return applUserFullName;
    }

    public String getApplUserOrg() {
        return applUserOrg;
    }
    
}
