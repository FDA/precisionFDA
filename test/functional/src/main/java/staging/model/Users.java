package staging.model;

import staging.data.TestUser;

public class Users {

    private final String basicAuthUsername;

    private final String basicAuthPassword;

    private final String applUsername;

    private final String applPassword;

    private final String applUserFullName;

    private final String applUserOrg;


    public Users(final String basicAuthUsername, final String basicAuthPassword,
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

    public static Users getTestUser() {
        return new Users(TestUser.basicAuthUsername(), TestUser.basicAuthPassword(),
                TestUser.applUsername(), TestUser.applPassword(),
                TestUser.applUserFullName(), TestUser.applUserOrg());
    }

    public static Users getWrongUser() {
        return new Users(TestUser.basicAuthUsername(), TestUser.basicAuthPassword(),
                TestUser.applUsername(), "wrongPassword",
                TestUser.applUserFullName(), TestUser.applUserOrg());
    }
    
}
