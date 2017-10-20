package staging.data;

import staging.utils.SettingsProperties;

import java.util.Random;

import static org.junit.Assert.fail;
import static staging.data.TestConstants.*;
import static staging.utils.Utils.getCurrentDateTimeUTCValue;
import static staging.utils.Utils.getRunTimeUniqueValue;

public class TestVariables {

    public static String finishedCaseStatus;

    public static String finishedCaseName;

    public static String runSuiteName;

    public static String jobRunTimeUTC;

    public static String appCreateTimeUTC;

    public static String noteCreateTimeUTC;

    public static final String filePathUniqueValue = generateFilePathUniqueValue();

    public static final String testRunUniqueFinalValue = generateTestRunUniqueValue();

    public static final String getAppJobScriptOutput() {
        return CREATE_APP_SCRIPT_BODY_PREFIX_2 + getTestRunUniqueFinalValue();
    }

    public static final String getAppJobScriptBody() {
        return CREATE_APP_SCRIPT_BODY_PREFIX_1 + getAppJobScriptOutput();
    }

    public static final String getAppJobName() {
        return CREATE_APP_JOB_NAME_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getAppName() {
        return CREATE_APP_NAME_PREFIX + getTestRunUniqueFinalValue();
    }

    public static final String getAppTitle() {
        return CREATE_APP_TITLE_PREFIX + getTestRunUniqueFinalValue();
    }

    public static String getDebugLogFolder() {
        return System.getProperty("user.dir") + "/target/debug-log/";
    }

    public static String getDebugLogFolderPath() {
        return getDebugLogFolder() + "run_" + getFilePathUniqueValue() + "/";
    }

    public static void setFinishedCaseData(String caseStatus, String caseName) {
        finishedCaseStatus = caseStatus;
        finishedCaseName = caseName;
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
        Random randomGenerator = new Random();
        try {
            int frame = randomGenerator.nextInt(1000);
            Thread.sleep(frame);
        } catch (final InterruptedException e) {
            //
        }
        return getRunTimeUniqueValue();
    }

    public static String generateTestRunUniqueValue() {
        return getCurrentDateTimeUTCValue();
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

    public static void setJobRunTimeUTC() {
        jobRunTimeUTC = getCurrentDateTimeUTCValue();
    }

    public static String getJobRunTimeUTC() {
        return jobRunTimeUTC;
    }

    public static void setAppCreateTimeUTC() {
        appCreateTimeUTC = getCurrentDateTimeUTCValue();
    }

    public static String getAppCreateTimeUTC() {
        return appCreateTimeUTC;
    }

    public static void setNoteCreateTimeUTC() {
        noteCreateTimeUTC = getCurrentDateTimeUTCValue();
    }

    public static String getNoteCreateTimeUTC() {
        return noteCreateTimeUTC;
    }
}
