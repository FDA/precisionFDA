package precisionFDA.data;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import precisionFDA.model.UserProfile;

public class TestUserData {

    // test user

    protected static final Config config = ConfigFactory.load();

    public static String getPreTestUsername() {
            return config.getString("pfda_test.username");
        }

    public static String getPreTestPassword() {
            return config.getString("pfda_test.password");
        }

    public static String getPreTestDNXusername() {
            return config.getString("pfda_test.dnx_stage_username");
        }

    public static String getPreTestDNXpassword() {
            return config.getString("pfda_test.dnx_stage_password");
        }

    public static String getPresTestUserFullName() {
            return config.getString("pfda_test.userFullName");
        }

    public static String getPreTestUserOrg() {
            return config.getString("pfda_test.userOrg");
        }

    public static String basicPreTestAuthUsername() {
        return getPreTestDNXusername();
    }

    public static String basicPreTestAuthPassword() {
        return getPreTestDNXpassword();
    }

    public static String preTestUsername() {
        return getPreTestUsername();
    }

    public static String preTestPassword() {
        return getPreTestPassword();
    }

    public static String preTestFullName() {
        return getPresTestUserFullName();
    }

    public static String preTestOrg() {
        return getPreTestUserOrg();
    }

    // admin user

    public static String getPreAdminUsername() {
        return config.getString("pfda_admin.username");
    }

    public static String getPreAdminPassword() {
        return config.getString("pfda_admin.password");
    }

    public static String getPreAdminDNXusername() {
        return config.getString("pfda_admin.dnx_stage_username");
    }

    public static String getPreAdminDNXpassword() {
        return config.getString("pfda_admin.dnx_stage_password");
    }

    public static String getPreAdminUserFullName() {
        return config.getString("pfda_admin.userFullName");
    }

    public static String getPreAdminUserOrg() {
        return config.getString("pfda_admin.userOrg");
    }

    public static String basicPreAdminAuthUsername() {
        return getPreAdminDNXusername();
    }

    public static String basicPreAdminAuthPassword() {
        return getPreAdminDNXpassword();
    }

    public static String preAdminUsername() {
        return getPreAdminUsername();
    }

    public static String preAdminPassword() {
        return getPreAdminPassword();
    }

    public static String preAdminFullName() {
        return getPreAdminUserFullName();
    }

    public static String preAdminOrg() {
        return getPreAdminUserOrg();
    }

    // another test user

    public static String getPreAnotherUsername() {
        return config.getString("pfda_othertest.username");
    }

    public static String getPreAnotherPassword() {
        return config.getString("pfda_othertest.password");
    }

    public static String getPreAnotherDNXusername() {
        return config.getString("pfda_othertest.dnx_stage_username");
    }

    public static String getPreAnotherDNXpassword() {
        return config.getString("pfda_othertest.dnx_stage_password");
    }

    public static String getPreAnotherUserFullName() {
        return config.getString("pfda_othertest.userFullName");
    }

    public static String getPreAnotherUserOrg() {
        return config.getString("pfda_othertest.userOrg");
    }

    public static String basicPreAnotherAuthUsername() {
        return getPreAnotherDNXusername();
    }

    public static String basicPreAnotherAuthPassword() {
        return getPreAnotherDNXpassword();
    }

    public static String preAnotherUsername() {
        return getPreAnotherUsername();
    }

    public static String preAnotherPassword() {
        return getPreAnotherPassword();
    }

    public static String preAnotherFullName() {
        return getPreAnotherUserFullName();
    }

    public static String preAnotherOrg() {
        return getPreAnotherUserOrg();
    }

    //====================

    public static UserProfile getTestUser() {
        return new UserProfile(TestUserData.basicPreTestAuthUsername(), TestUserData.basicPreTestAuthPassword(),
                TestUserData.preTestUsername(), TestUserData.preTestPassword(),
                TestUserData.preTestFullName(), TestUserData.preTestOrg());
    }

    public static UserProfile getAnotherTestUser() {
        return new UserProfile(TestUserData.basicPreAnotherAuthUsername(), TestUserData.basicPreAnotherAuthPassword(),
                TestUserData.preAnotherUsername(), TestUserData.preAnotherPassword(),
                TestUserData.preAnotherFullName(), TestUserData.preAnotherOrg());
    }

    public static UserProfile getWrongUser() {
        return new UserProfile(TestUserData.basicPreTestAuthUsername(), TestUserData.basicPreTestAuthPassword(),
                TestUserData.preTestUsername(), "wrongPassword",
                TestUserData.preTestFullName(), TestUserData.preTestOrg());
    }

    public static UserProfile getAdminUser() {
        return new UserProfile(TestUserData.basicPreAdminAuthUsername(), TestUserData.basicPreAdminAuthPassword(),
                TestUserData.preAdminUsername(), TestUserData.preAdminPassword(),
                TestUserData.preAdminFullName(), TestUserData.preAdminOrg());
    }

}