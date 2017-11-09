package staging.data;

import staging.utils.SettingsProperties;

import static staging.utils.Utils.getRunTimeLocalUniqueValue;

public class TestRunData {

    public static String finishedCaseStatus;

    public static String finishedCaseName;

    public static String runSuiteName;

    public static String currentTimezone = "GMT";

    public static final String filePathUniqueValue = generateFilePathUniqueValue();

    public static final String testRunUniqueFinalValue = generateTestRunUniqueValue();

    public static final String INPUT_NAME_FIELD_NAME = "input_name_";

    public static final String INPUT_LABEL_FIELD_NAME = "input_label_";

    public static final String INPUT_HELP_FIELD_NAME = "input_help_";

    public static final String INPUT_DEFAULT_FIELD_NAME = "input_default_";

    public static final String OUTPUT_NAME_FIELD_NAME = "output_name_";

    public static final String OUTPUT_LABEL_FIELD_NAME = "output_label_";

    public static final String OUTPUT_HELP_FIELD_NAME = "output_help_";

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
        return SettingsProperties.getProperty("screenshotOnPass").equalsIgnoreCase("true");
    }

    public static boolean isGetScreenshotOnFail() {
        return SettingsProperties.getProperty("screenshotOnFail").equalsIgnoreCase("true");
    }

    public static boolean isGetPageSourceOnPass() {
        return SettingsProperties.getProperty("htmlSourceOnPass").equalsIgnoreCase("true");
    }

    public static boolean isGetPageSourceOnFail() {
        return SettingsProperties.getProperty("htmlSourceOnFail").equalsIgnoreCase("true");
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

}
