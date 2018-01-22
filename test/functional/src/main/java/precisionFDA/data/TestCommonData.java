package precisionFDA.data;

import static precisionFDA.utils.TestRunConfig.getPathToTempFilesFolder;
import static precisionFDA.utils.TestRunConfig.getPathToTestFilesFolder;
import static precisionFDA.utils.Utils.getCurrentDate_YYYY_MM_dd;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;
import static precisionFDA.utils.Utils.getTextFromFile;

public class TestCommonData {

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

    public static final String getDebugLogCommonFolderName() {
        return "debug-log/";
    }

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

    public static String getDebugLogCommonFolderPath() {
        return System.getProperty("user.dir") + "/target/" + getDebugLogCommonFolderName();
    }

    public static final String getCurrentRunLogFolderPath() {
        return getDebugLogCommonFolderPath() + getCurrentRunLogFolderName();
    }

    public static final String getCurrentRunLogFolderName() {
        return "run_" + getFilePathUniqueValue() + "/";
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

    public static String getText1000Symbols() {
        String sFilePath = getPathToTestFilesFolder() + "text_1000_symbols.txt";
        return getTextFromFile(sFilePath);
    }
}
