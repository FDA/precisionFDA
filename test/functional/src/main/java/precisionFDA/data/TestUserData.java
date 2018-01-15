package precisionFDA.data;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import precisionFDA.model.UserProfile;

import static precisionFDA.utils.SettingsProperties.getTestRunEnv;

public class TestUserData {

    // test user 1

    protected static final Config config = ConfigFactory.load(getConfFile());

    public static String atUser1 = "pfda_at_user_1";

    public static String atUser2 = "pfda_at_user_2";

    public static String atUserAdmin = "pfda_at_user_admin";

    public static String getPfdaUser1Username() {
            return config.getString(atUser1 + ".username");
        }

    public static String getPfdaUser1Password() {
            return config.getString(atUser1 + ".password");
        }

    public static String getPfdaUser1DNXusername() {
            return config.getString(atUser1 + ".dnx_stage_username");
        }

    public static String getPfdaUser1DNXpassword() {
            return config.getString(atUser1 + ".dnx_stage_password");
        }

    public static String getPfdaUser1FullName() {
            return config.getString(atUser1 + ".userFullName");
        }

    public static String getPfdaUser1Org() {
            return config.getString(atUser1 + ".userOrg");
        }

    public static String basicAuthUser1Username() {
        return getPfdaUser1DNXusername();
    }

    public static String basicAuthUser1Password() {
        return getPfdaUser1DNXpassword();
    }

    public static String pfdaUser1Username() {
        return getPfdaUser1Username();
    }

    public static String pfdaUser1Password() {
        return getPfdaUser1Password();
    }

    public static String pfdaUser1FullName() {
        return getPfdaUser1FullName();
    }

    public static String pfdaUser1Org() {
        return getPfdaUser1Org();
    }

    // admin user

    public static String getPfdaUserAdminUsername() {
        return config.getString(atUserAdmin + ".username");
    }

    public static String getPfdaUserAdminPassword() {
        return config.getString(atUserAdmin + ".password");
    }

    public static String getPfdaUserAdminDNXusername() {
        return config.getString(atUserAdmin + ".dnx_stage_username");
    }

    public static String getPfdaUserAdminDNXpassword() {
        return config.getString(atUserAdmin + ".dnx_stage_password");
    }

    public static String getPfdaUserAdminFullName() {
        return config.getString(atUserAdmin + ".userFullName");
    }

    public static String getPfdaUserAdminOrg() {
        return config.getString(atUserAdmin + ".userOrg");
    }

    public static String basicAuthUserAdminUsername() {
        return getPfdaUserAdminDNXusername();
    }

    public static String basicAuthUserAdminPassword() {
        return getPfdaUserAdminDNXpassword();
    }

    public static String pfdaUserAdminUsername() {
        return getPfdaUserAdminUsername();
    }

    public static String pfdaUserAdminPassword() {
        return getPfdaUserAdminPassword();
    }

    public static String pfdaUserAdminFullName() {
        return getPfdaUserAdminFullName();
    }

    public static String pfdaUserAdminOrg() {
        return getPfdaUserAdminOrg();
    }

    // test user 2

    public static String getPfdaUser2Username() {
        return config.getString(atUser2 + ".username");
    }

    public static String getPfdaUser2Password() {
        return config.getString(atUser2 + ".password");
    }

    public static String getPfdaUser2DNXusername() {
        return config.getString(atUser2 + ".dnx_stage_username");
    }

    public static String getPfdaUser2DNXpassword() {
        return config.getString(atUser2 + ".dnx_stage_password");
    }

    public static String getPfdaUser2FullName() {
        return config.getString(atUser2 + ".userFullName");
    }

    public static String getPfdaUser2Org() {
        return config.getString(atUser2 + ".userOrg");
    }

    public static String basicAuthUser2Username() {
        return getPfdaUser2DNXusername();
    }

    public static String basicAuthUser2Password() {
        return getPfdaUser2DNXpassword();
    }

    public static String pfdaUser2Username() {
        return getPfdaUser2Username();
    }

    public static String pfdaUser2Password() {
        return getPfdaUser2Password();
    }

    public static String pfdaUser2FullName() {
        return getPfdaUser2FullName();
    }

    public static String pfdaUser2Org() {
        return getPfdaUser2Org();
    }

    //====================

    public static UserProfile getTestUserOne() {
        return new UserProfile(TestUserData.basicAuthUser1Username(), TestUserData.basicAuthUser1Password(),
                TestUserData.pfdaUser1Username(), TestUserData.pfdaUser1Password(),
                TestUserData.pfdaUser1FullName(), TestUserData.pfdaUser1Org());
    }

    public static UserProfile getTestUserTwo() {
        return new UserProfile(TestUserData.basicAuthUser2Username(), TestUserData.basicAuthUser2Password(),
                TestUserData.pfdaUser2Username(), TestUserData.pfdaUser2Password(),
                TestUserData.pfdaUser2FullName(), TestUserData.pfdaUser2Org());
    }

    public static UserProfile getWrongUser() {
        return new UserProfile(TestUserData.basicAuthUser1Username(), TestUserData.basicAuthUser1Password(),
                TestUserData.pfdaUser1Username(), "wrongPassword",
                TestUserData.pfdaUser1FullName(), TestUserData.pfdaUser1Org());
    }

    public static UserProfile getAdminUser() {
        return new UserProfile(TestUserData.basicAuthUserAdminUsername(), TestUserData.basicAuthUserAdminPassword(),
                TestUserData.pfdaUserAdminUsername(), TestUserData.pfdaUserAdminPassword(),
                TestUserData.pfdaUserAdminFullName(), TestUserData.pfdaUserAdminOrg());
    }

    private static String getConfFile() {
        String env = getTestRunEnv();
        String confFile ="";
        if (env.equalsIgnoreCase("dev")) {
            confFile = "dev_user_creds";
        }
        if (env.equalsIgnoreCase("loc")) {
            confFile = "loc_user_creds";
        }
        return confFile;
    }

}