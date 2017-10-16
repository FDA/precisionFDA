package staging.data;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

public class TestUser {

    protected static final Config config = ConfigFactory.load();

    public static String getPFDAusername() {
            return config.getString("pfda_test.username");
        }

    public static String getPFDApassword() {
            return config.getString("pfda_test.password");
        }

    public static String getDNXusername() {
            return config.getString("pfda_test.dnx_stage_username");
        }

    public static String getDNXpassword() {
            return config.getString("pfda_test.dnx_stage_password");
        }

    public static String getTestUserFullName() {
            return config.getString("pfda_test.userFullName");
        }

    public static String getTestUserOrg() {
            return config.getString("pfda_test.userOrg");
        }

    public static String basicAuthUsername() {
        return getDNXusername();
    }

    public static String basicAuthPassword() {
        return getDNXpassword();
    }

    public static String applUsername() {
        return getPFDAusername();
    }

    public static String applPassword() {
        return getPFDApassword();
    }

    public static String applUserFullName() {
        return getTestUserFullName();
    }

    public static String applUserOrg() {
        return getTestUserOrg();
    }

}