package staging.model;

import staging.data.TestUserData;

public class User {

    private final String basicAuthUsername;

    private final String basicAuthPassword;

    private final String applUsername;

    private final String applPassword;

    private final String applUserFullName;

    private final String applUserOrg;

    public User(final String basicAuthUsername, final String basicAuthPassword,
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

    public static User getTestUser() {
        return new User(TestUserData.basicPreTestAuthUsername(), TestUserData.basicPreTestAuthPassword(),
                TestUserData.preTestUsername(), TestUserData.preTestPassword(),
                TestUserData.preTestFullName(), TestUserData.preTestOrg());
    }

    public static User getWrongUser() {
        return new User(TestUserData.basicPreTestAuthUsername(), TestUserData.basicPreTestAuthPassword(),
                TestUserData.preTestUsername(), "wrongPassword",
                TestUserData.preTestFullName(), TestUserData.preTestOrg());
    }

    public static User getAdminUser() {
        return new User(TestUserData.basicPreAdminAuthUsername(), TestUserData.basicPreAdminAuthPassword(),
                TestUserData.preAdminUsername(), TestUserData.preAdminPassword(),
                TestUserData.preAdminFullName(), TestUserData.preAdminOrg());
    }
    
}
