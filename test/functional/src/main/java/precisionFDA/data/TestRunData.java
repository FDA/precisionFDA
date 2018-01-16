package precisionFDA.data;

import static precisionFDA.utils.Utils.getCurrentDate_YYYY_MM_dd;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;
import static precisionFDA.utils.Utils.getTextFromFile;
import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;

public class TestRunData {

    static String finishedCaseStatus;

    static String finishedCaseName;

    static String runSuiteName;

    static String currentTimezone = "GMT";

    static final String filePathUniqueValue = generateFilePathUniqueValue();

    static final String testRunUniqueFinalValue = generateTestRunUniqueValue();

    static final String INPUT_NAME_FIELD_NAME = "input_name_";

    static final String INPUT_LABEL_FIELD_NAME = "input_label_";

    static final String INPUT_HELP_FIELD_NAME = "input_help_";

    static final String INPUT_DEFAULT_FIELD_NAME = "input_default_";

    static final String OUTPUT_NAME_FIELD_NAME = "output_name_";

    static final String OUTPUT_LABEL_FIELD_NAME = "output_label_";

    static final String OUTPUT_HELP_FIELD_NAME = "output_help_";

    static final String DOCKER_FILE_NAME = "Dockerfile";

    static final String ACTIVE_USERS_FILE_NAME_PREFIX = "active_users_";

    static final String USERS_AND_USAGE_FILE_NAME_PREFIX = "users_usage_";

    static final String DOCKER_VALIDATION_TEXT = "RUN DEBIAN_FRONTEND";

    protected static final Config config = ConfigFactory.load("settings");

    final static String profile = "test_settings_profile_1";

    public static String getDockerValidationText() {
        return DOCKER_VALIDATION_TEXT;
    }

    public static String getDockerFileName() {
        return DOCKER_FILE_NAME;
    }

    public static String getActiveUsersFileName() {
        return ACTIVE_USERS_FILE_NAME_PREFIX + getCurrentDate_YYYY_MM_dd() + ".csv";
    }

    public static String getUsersAndUsageFileName() {
        return USERS_AND_USAGE_FILE_NAME_PREFIX + getCurrentDate_YYYY_MM_dd() + ".csv";
    }

    public static String getCurrentTimezone() {
        return currentTimezone;
    }

    public static void setCurrentTimezone(String timezone) {
        currentTimezone = timezone;
    }

    public static String getDebugLogFolder() {
        return System.getProperty("user.dir") + "/target/debug-log/";
    }

    public static String getDebugLogFolderPath() {
        return getDebugLogFolder() + "run_" + getFilePathUniqueValue() + "/";
    }

    public static void setFinishedCaseData(String caseStatus, String caseName, String suiteName) {
        finishedCaseStatus = caseStatus;
        finishedCaseName = caseName;
        setRunSuiteName(suiteName);
    }

    public static void setRunSuiteName(String suiteName) {
        runSuiteName = suiteName;
    }

    public static String getRunSuiteName() {
        return runSuiteName;
    }

    public static String getFinishedCaseStatus() {
        return finishedCaseStatus;
    }

    public static String getFinishedCaseName() {
        return finishedCaseName;
    }

    public static String getFilePathUniqueValue() {
        return filePathUniqueValue;
    }

    public static String generateFilePathUniqueValue() {
        return getRunTimeLocalUniqueValue();
    }

    public static String generateTestRunUniqueValue() {
        return getRunTimeLocalUniqueValue();
    }

    public static String getTestRunUniqueFinalValue() {
        return testRunUniqueFinalValue;
    }

    public static boolean isGetScreenshotOnPass() {
        return getScreenshotOnTestSuccess().equalsIgnoreCase("true");
    }

    public static boolean isGetScreenshotOnFail() {
        return getScreenshotOnTestFailure().equalsIgnoreCase("true");
    }

    public static boolean isGetPageSourceOnPass() {
        return getHtmlSourceOnTestSuccess().equalsIgnoreCase("true");
    }

    public static boolean isGetPageSourceOnFail() {
        return getHtmlSourceOnTestFailure().equalsIgnoreCase("true");
    }

    public static boolean isScreenshotFeatureOn() {
        return getScreenshotFeatureOn().equalsIgnoreCase("true");
    }

    public static String getInputNameFieldName() {
        return INPUT_NAME_FIELD_NAME;
    }

    public static String getInputLabelFieldName() {
        return INPUT_LABEL_FIELD_NAME;
    }

    public static String getInputHelpFieldName() {
        return INPUT_HELP_FIELD_NAME;
    }

    public static String getInputDefaultFieldName() {
        return INPUT_DEFAULT_FIELD_NAME;
    }

    public static String getOutputNameFieldName() {
        return OUTPUT_NAME_FIELD_NAME;
    }

    public static String getOutputLabelFieldName() {
        return OUTPUT_LABEL_FIELD_NAME;
    }

    public static String getOutputHelpFieldName() {
        return OUTPUT_HELP_FIELD_NAME;
    }

    public static String getPathToDownloadsFolder() {
        return getPathToTempFilesFolder();
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

    public static String getText1000Symbols() {
        String sFilePath = getPathToTestFilesFolder() + "text_1000_symbols.txt";
        return getTextFromFile(sFilePath);
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

    public static String getScreenshotFeatureOn() {
        return config.getString(profile + ".screenshotFeatureOn");
    }

    public static String getScreenshotOnTestSuccess() {
        return config.getString(profile + ".screenshotOnTestSuccess");
    }

    public static String getScreenshotOnTestFailure() {
        return config.getString(profile + ".screenshotOnTestFailure");
    }

    public static String getHtmlSourceOnTestSuccess() {
        return config.getString(profile + ".htmlSourceOnTestSuccess");
    }

    public static String getHtmlSourceOnTestFailure() {
        return config.getString(profile + ".htmlSourceOnTestFailure");
    }

    public static String getHeadlessMode() {
        return config.getString(profile + ".headlessMode");
    }

    public static String getPathToFirefoxDriver() {
        return config.getString(profile + ".pathToFirefoxDriver");
    }

}
