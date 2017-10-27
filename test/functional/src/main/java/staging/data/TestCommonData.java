package staging.data;

import staging.utils.SettingsProperties;

import static staging.utils.Utils.getRunTimeLocalUniqueValue;

public class TestCommonData {

    public static final String CASE_STATUS_PASSED = "passed";

    public static final String CASE_STATUS_FAILED = "failed";

    public static final String TRUE_RESULT = "true";

    public static String finishedCaseStatus;

    public static String finishedCaseName;

    public static String runSuiteName;


    public static final String filePathUniqueValue = generateFilePathUniqueValue();

    public static final String testRunUniqueFinalValue = generateTestRunUniqueValue();


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

    public static String getTrueResult() {
        return TRUE_RESULT;
    }
}
