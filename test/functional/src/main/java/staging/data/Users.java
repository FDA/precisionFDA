package staging.data;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import org.apache.log4j.Logger;
import staging.utils.SettingsProperties;

public class Users {

    private final Logger log = Logger.getLogger(this.getClass());

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


}
