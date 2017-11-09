package staging.data;

import staging.model.FilesProfile;

import static staging.utils.Utils.generateTestPngFileName;
import static staging.utils.Utils.generateTestTextFileName;
import static staging.utils.Utils.getRunTimeLocalUniqueValue;

public class TestFilesData {

    public static final String TEST_TEXT_FILE_NAME = "textFile.txt";

    public static final String TEST_PNG_FILE_NAME = "pngFile.png";

    public static final String TEST_1ST_LEVEL_FOLDER_NAME_PREFIX = "at_1ST_LEVEL_folder_";

    public static final String TEST_2ND_LEVEL_FOLDER_NAME_PREFIX = "at_2ND_LEVEL_folder_";

    public static String getTestTextTemplateFileName() {
        return TEST_TEXT_FILE_NAME;
    }

    public static String getTestPngTemplateFileName() {
        return TEST_PNG_FILE_NAME;
    }

    public static String getFirstLevelFolderNamePrefix() {
        return TEST_1ST_LEVEL_FOLDER_NAME_PREFIX;
    }

    public static String getSecondLevelFolderNamePrefix() {
        return TEST_2ND_LEVEL_FOLDER_NAME_PREFIX;
    }

    public static String getMainFileInRoot() {
        return generateTestTextFileName();
    }

    public static String getMainFirstLevelFolder() {
        return getFirstLevelFolderNamePrefix() + getRunTimeLocalUniqueValue();
    }

    public static String getMainFileInFirstLevelFolder() {
        return generateTestPngFileName();
    }

    public static String getMainFileInSecondLevelFolder() {
        return generateTestTextFileName();
    }

    public static String getMainSecondLevelFolder() {
        return getSecondLevelFolderNamePrefix() + getRunTimeLocalUniqueValue();
    }

    public static FilesProfile mainProfile = new FilesProfile(
        getMainFileInRoot(),
        getMainFileInFirstLevelFolder(),
        getMainFileInSecondLevelFolder(),
        getMainFirstLevelFolder(),
        getMainSecondLevelFolder()
    );

    public static FilesProfile getMainProfile() {
        return mainProfile;
    }


}
