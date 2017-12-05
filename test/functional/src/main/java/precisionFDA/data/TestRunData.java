package precisionFDA.data;

import precisionFDA.utils.SettingsProperties;

import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;
import static precisionFDA.utils.Utils.getTextFromFile;

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
        return SettingsProperties.getProperty("screenshotOnTestSuccess").equalsIgnoreCase("true");
    }

    public static boolean isGetScreenshotOnFail() {
        return SettingsProperties.getProperty("screenshotOnTestFailure").equalsIgnoreCase("true");
    }

    public static boolean isGetPageSourceOnPass() {
        return SettingsProperties.getProperty("htmlSourceOnTestSuccess").equalsIgnoreCase("true");
    }

    public static boolean isGetPageSourceOnFail() {
        return SettingsProperties.getProperty("htmlSourceOnTestFailure").equalsIgnoreCase("true");
    }

    public static boolean isScreenshotFeatureOn() {
        return SettingsProperties.getProperty("screenshotFeatureOn").equalsIgnoreCase("true");
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
        return System.getProperty("user.dir") + SettingsProperties.getProperty("pathToTestFiles");
    }

    public static String getPathToTempFilesFolder() {
        return System.getProperty("user.dir") + SettingsProperties.getProperty("pathToTempFiles");
    }

    public static String getTestImageHttpsUrl() {
        return SettingsProperties.getProperty("testImageHttpsUrl");
    }

    public static String getText1000Symbols() {
        String sFilePath = getPathToTestFilesFolder() + "text_1000_symbols.txt";
        return getTextFromFile(sFilePath);
    }

}
