package precisionFDA.utils;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

public class TestRunConfig {

    protected static final Config config = ConfigFactory.load("settings");

    final static String profile = "test_settings_profile_1";

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

    public static String getTestImageHttpsUrl() {
        return config.getString(profile + ".testImageHttpsUrl");
    }

    public static String getPfdaOverviewURL() {
        return config.getString(profile + ".precisionFdaOverviewURL");
    }

    public static String getPfdaFilesURL() {
        return config.getString(profile + ".precisionFdaFilesURL");
    }

    public static String getLoginPfdaPageURL() {
        return config.getString(profile + ".loginPrecisionPageURL");
    }

    public static String getStagingURL() {
        return config.getString(profile + ".stagingURL");
    }

    public static Boolean getHeadlessModeConfig() {
        return Boolean.valueOf(config.getString(profile + ".headlessMode"));
    }

    public static String getPathToFirefoxDriver() {
        return config.getString(profile + ".pathToFirefoxDriver");
    }
}
