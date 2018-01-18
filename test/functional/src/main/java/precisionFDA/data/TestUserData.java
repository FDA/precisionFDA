package precisionFDA.data;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import precisionFDA.model.UserProfile;

public class TestUserData {

    // test user 1

    protected static final Config config = ConfigFactory.load("credentials");

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

    public static String getPfdaUser1OrgHandle() {
            return config.getString(atUser1 + ".userOrgHandle");
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

    public static String getPfdaUserAdminOrgHandle() {
        return config.getString(atUserAdmin + ".userOrgHandle");
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

    public static String getPfdaUser2OrgHandle() {
        return config.getString(atUser2 + ".userOrgHandle");
    }

    //====================

    public static UserProfile getTestUserOne() {
        return new UserProfile(
                TestUserData.getPfdaUser1DNXusername(),
                TestUserData.getPfdaUser1DNXpassword(),
                TestUserData.getPfdaUser1Username(),
                TestUserData.getPfdaUser1Password(),
                TestUserData.getPfdaUser1FullName(),
                TestUserData.getPfdaUser1OrgHandle());
    }

    public static UserProfile getTestUserTwo() {
        return new UserProfile(
                TestUserData.getPfdaUser2DNXusername(),
                TestUserData.getPfdaUser2DNXpassword(),
                TestUserData.getPfdaUser2Username(),
                TestUserData.getPfdaUser2Password(),
                TestUserData.getPfdaUser2FullName(),
                TestUserData.getPfdaUser2OrgHandle());
    }

    public static UserProfile getWrongUser() {
        return new UserProfile(
                TestUserData.getPfdaUser1DNXusername(),
                TestUserData.getPfdaUser1DNXpassword(),
                TestUserData.getPfdaUser1Username(),
                TestUserData.getPfdaUser1Password() + "wrong",
                TestUserData.getPfdaUser1FullName(),
                TestUserData.getPfdaUser1OrgHandle());
    }

    public static UserProfile getAdminUser() {
        return new UserProfile(
                TestUserData.getPfdaUserAdminDNXusername(),
                TestUserData.getPfdaUserAdminDNXpassword(),
                TestUserData.getPfdaUserAdminUsername(),
                TestUserData.getPfdaUserAdminPassword(),
                TestUserData.getPfdaUserAdminFullName(),
                TestUserData.getPfdaUserAdminOrgHandle());
    }

}