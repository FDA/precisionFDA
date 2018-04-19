package precisionFDA.utils;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

import static precisionFDA.data.TestDict.*;
import static precisionFDA.data.TestUserData.getBasicAuth;

public class TestRunConfig {

    protected static final Config config = ConfigFactory.load("settings");

    final static String profile = "test_settings_profile_1";

    static String env;

    public static boolean isGetScreenshotOnPass() {
        return Boolean.valueOf(config.getString(profile + ".screenshotOnTestSuccess"));
    }

    public static boolean isGetScreenshotOnFail() {
        return Boolean.valueOf(config.getString(profile + ".screenshotOnTestFailure"));
    }

    public static boolean isGetPageSourceOnPass() {
        return Boolean.valueOf(config.getString(profile + ".htmlSourceOnTestSuccess"));
    }

    public static boolean isGetPageSourceOnFail() {
        return Boolean.valueOf(config.getString(profile + ".htmlSourceOnTestFailure"));
    }

    public static boolean isScreenshotFeatureOn() {
        return Boolean.valueOf(config.getString(profile + ".screenshotFeatureOn"));
    }

    public static String getPathToTestFilesFolder() {
        return System.getProperty("user.dir") + config.getString(profile + ".pathToTestFiles");
    }

    public static String getPathToTempFilesFolder() {
        return System.getProperty("user.dir") + config.getString(profile + ".pathToTempFiles");
    }

    // =================

    public static String getPfdaServerUrl_dev() {
        return config.getString(profile + ".pfdaServerUrl_dev");
    }

    public static String getPfdaServerUrl_loc() {
        return config.getString(profile + ".pfdaServerUrl_loc");
    }

    public static String getPlatformServerUrl_dev() {
        return config.getString(profile + ".platformServerUrl_dev");
    }

    public static String getPlatformServerUrl_loc() {
        return config.getString(profile + ".platformServerUrl_loc");
    }

    public static String getPfdaLoginPageUrl() {
        return config.getString(profile + ".pfdaLoginPageUrl")
                .replace("{basicAuthUser}", getBasicAuth().getBasicAuthUsername())
                .replace("{basicAuthPassword}", getBasicAuth().getBasicAuthPassword())
                .replace("{pfdaServerUrl}", getPfdaServerUrl())
                .replace("{platformServerUrl}", getPlatformServerUrl().replace("https://", "").replace("http://", ""));
    }

    public static String getPlatformLoginPageUrl() {
        return config.getString(profile + ".platformLoginPageUrl")
                .replace("{basicAuthUser}", getBasicAuth().getBasicAuthUsername())
                .replace("{basicAuthPassword}", getBasicAuth().getBasicAuthPassword())
                .replace("{platformServerUrl}", getPlatformServerUrl().replace("https://", "").replace("http://", ""));
    }

    public static final String getPfdaStartUrl() {
        return config.getString(profile + ".pfdaStartUrl")
                .replace("{pfdaServerUrl}", getPfdaServerUrl());
    }

    public static String getPlatformServerUrl() {
        String url = "not defined";
        if (isEnvDev()) {
            url = getPlatformServerUrl_loc();
        }
        else if (isEnvLoc()) {
            url = getPlatformServerUrl_dev();
        }
        return url;
    }

    public static String getPfdaServerUrl() {
        String url = "not defined";
        if (isEnvDev()) {
            url = getPfdaServerUrl_dev();
        }
        else if (isEnvLoc()) {
            url = getPfdaServerUrl_loc();
        }
        return url;
    }

    // =================

    public static String getDefaultEnv() {
        return config.getString(profile + ".default_env");
    }

    public static Boolean getHeadlessModeConfig() {
        return Boolean.valueOf(config.getString(profile + ".headless"));
    }

    public static String getPathToFirefoxDriver() {
        return config.getString(profile + ".pathToFirefoxDriver");
    }

    public static boolean isEnvDev() {
        return getEnv().equalsIgnoreCase(getDictDev());
    }

    public static boolean isEnvLoc() {
        return getEnv().equalsIgnoreCase(getDictLoc());
    }

    public static boolean isEnvProd() {
        return getEnv().equalsIgnoreCase(getDictProd());
    }

    public static boolean isEnvStaging() {
        return getEnv().equalsIgnoreCase(getDictStaging());
    }

    public static void setEnv() {
        String providedEnv = "" + System.getProperty("env");
        if ( providedEnv.equalsIgnoreCase(getDictLoc())
                || providedEnv.equalsIgnoreCase(getDictProd())
                || providedEnv.equalsIgnoreCase(getDictStaging())
                || providedEnv.equalsIgnoreCase(getDictDev()) ) {
            env = providedEnv;
        }
        else {
            env = getDefaultEnv();
        }
    }

    public static final String getEnv() {
        return env;
    }

}
