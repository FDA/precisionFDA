package precisionFDA.data;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import precisionFDA.model.BasicAuthProfile;
import precisionFDA.model.UserProfile;

import static precisionFDA.utils.TestRunConfig.isEnvDev;
import static precisionFDA.utils.TestRunConfig.isEnvLoc;

public class TestUserData {

    protected static final Config config = ConfigFactory.load("credentials");

    static final String atUser1 = "user_1";

    static final String atUser2 = "user_2";

    static final String atUserAdmin = "user_admin";

    static final String atUsersType = getUsersType();

    static String getPfdaUsername(String atUser) {
        return config.getString(atUsersType + "." + atUser + ".username");
    }

    static String getPfdaPassword(String atUser) {
        return config.getString(atUsersType + "." + atUser + ".password");
    }

    static String getPfdaDNXusername() {
        return config.getString(atUsersType + ".basic_auth.dnx_stage_username");
    }

    static String getPfdaDNXpassword() {
        return config.getString(atUsersType + ".basic_auth.dnx_stage_password");
    }

    static String getPfdaFullName(String atUser) {
        return config.getString(atUsersType + "." + atUser + ".userFullName");
    }

    static String getPfdaOrgHandle(String atUser) {
        return config.getString(atUsersType + "." + atUser + ".userOrgHandle");
    }

    //====================

    public static BasicAuthProfile getBasicAuth() {
        return new BasicAuthProfile(
                getPfdaDNXusername(),
                getPfdaDNXpassword()
        );
    }

    public static UserProfile getTestUserOne() {
        return new UserProfile(
                TestUserData.getPfdaUsername(atUser1),
                TestUserData.getPfdaPassword(atUser1),
                TestUserData.getPfdaFullName(atUser1),
                TestUserData.getPfdaOrgHandle(atUser1));
    }

    public static UserProfile getTestUserTwo() {
        return new UserProfile(
                TestUserData.getPfdaUsername(atUser2),
                TestUserData.getPfdaPassword(atUser2),
                TestUserData.getPfdaFullName(atUser2),
                TestUserData.getPfdaOrgHandle(atUser2));
    }

    public static UserProfile getWrongUser() {
        return new UserProfile(
                TestUserData.getPfdaUsername(atUser1),
                TestUserData.getPfdaPassword(atUser1) + "wrong",
                TestUserData.getPfdaFullName(atUser1),
                TestUserData.getPfdaOrgHandle(atUser1));
    }

    public static UserProfile getAdminUser() {
        return new UserProfile(
                TestUserData.getPfdaUsername(atUserAdmin),
                TestUserData.getPfdaPassword(atUserAdmin),
                TestUserData.getPfdaFullName(atUserAdmin),
                TestUserData.getPfdaOrgHandle(atUserAdmin));
    }

    //====================

    public static String getUsersType() {
        String usersType = "not_defined";
        if (isEnvDev()) {
            usersType = "pfda_users_dev";
        }
        else if (isEnvLoc()) {
            usersType = "pfda_users_loc";
        }
        return usersType;
    }
}