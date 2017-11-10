package staging.data;

import staging.model.FilesProfile;

import static staging.data.TestDict.getDictFirstFilterPhrase;
import static staging.data.TestDict.getDictSecondFilterPhrase;
import static staging.utils.Utils.*;
import static staging.utils.Utils.getRunTimeLocalUniqueValue;

public class TestFilesData {

    public static final String TEST_TEXT_FILE_NAME = "textFile.txt";

    public static final String TEST_PNG_FILE_NAME = "pngFile.png";

    public static final String TEST_1ST_LEVEL_FOLDER_NAME_PREFIX = "at_1ST_LEVEL_folder_";

    public static final String TEST_2ND_LEVEL_FOLDER_NAME_PREFIX = "at_2ND_LEVEL_folder_";

    public static final String TEST_DELETE_1ST_LEVEL_FOLDER_NAME_PREFIX = "at_1ST_LEVEL_test_delete_";

    public static final String TEST_DELETE_2ND_LEVEL_FOLDER_NAME_PREFIX = "at_2ND_LEVEL_test_delete_";

    public static final String TEST_FIRSTFILTER_1ST_LEVEL_FOLDER_NAME_PREFIX = "at_1ST_LEVEL_" + getDictFirstFilterPhrase() + "_";

    public static final String TEST_SECONDFILTER_1ST_LEVEL_FOLDER_NAME_PREFIX = "at_1ST_LEVEL_" + getDictSecondFilterPhrase() + "_";

    public static final String TEST_FILE_DESCRIPTION_PREFIX = "at_description ";

    public static final String TEST_UPDATE_PART_PREFIX = "upd ";

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

    public static String getDeleteFirstLevelFolderNamePrefix() {
        return TEST_DELETE_1ST_LEVEL_FOLDER_NAME_PREFIX;
    }

    public static String getDeleteSecondLevelFolderNamePrefix() {
        return TEST_DELETE_2ND_LEVEL_FOLDER_NAME_PREFIX;
    }

    public static String getFirstFilterFirstLevelFolderNamePrefix() {
        return TEST_FIRSTFILTER_1ST_LEVEL_FOLDER_NAME_PREFIX;
    }

    public static String getSecondFilterFirstLevelFolderNamePrefix() {
        return TEST_SECONDFILTER_1ST_LEVEL_FOLDER_NAME_PREFIX;
    }

    public static String getFileDescrPrefix() {
        return TEST_FILE_DESCRIPTION_PREFIX;
    }

    public static String getTestUpdatePartPrefix() {
        return TEST_UPDATE_PART_PREFIX;
    }

    //=================

    public static String getDescrUpdatePart() {
        return getTestUpdatePartPrefix() + getRunTimeLocalUniqueValue();
    }

    //=================

    public static String getMainFileInRoot() {
        return generateTestTextFileName();
    }

    public static String getMainFileInRootDescr() {
        return getFileDescrPrefix() + getRunTimeLocalUniqueValue();
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

    //=================

    public static String getDeleteFileInRoot() {
        return generateTestTextFileName();
    }

    public static String getDeleteFirstLevelFolder() {
        return getDeleteFirstLevelFolderNamePrefix() + getRunTimeLocalUniqueValue();
    }

    public static String getDeleteFileInFirstLevelFolder() {
        return generateTestPngFileName();
    }

    public static String getDeleteFileInSecondLevelFolder() {
        return generateTestTextFileName();
    }

    public static String getDeleteSecondLevelFolder() {
        return getDeleteSecondLevelFolderNamePrefix() + getRunTimeLocalUniqueValue();
    }

    //=================

    public static String getFirstFilterFileInRoot() {
        return generateFirstFilterFileName();
    }

    public static String getFirstFilterFirstLevelFolder() {
        return getFirstFilterFirstLevelFolderNamePrefix() + getRunTimeLocalUniqueValue();
    }

    public static String getSecondFilterFileInRoot() {
        return generateSecondFilterFileName();
    }

    public static String getSecondFilterFirstLevelFolder() {
        return getSecondFilterFirstLevelFolderNamePrefix() + getRunTimeLocalUniqueValue();
    }

    //=================

    public static FilesProfile mainProfile = new FilesProfile(
        getMainFileInRoot(),
        getMainFileInRootDescr(),
        getMainFileInFirstLevelFolder(),
        getMainFileInSecondLevelFolder(),
        getMainFirstLevelFolder(),
        getMainSecondLevelFolder()
    );

    public static FilesProfile filesToDeleteProfile = new FilesProfile(
            getDeleteFileInRoot(),
            "",
            getDeleteFileInFirstLevelFolder(),
            getDeleteFileInSecondLevelFolder(),
            getDeleteFirstLevelFolder(),
            getDeleteSecondLevelFolder()
    );

    public static FilesProfile filesFirstFilterProfile = new FilesProfile(
            getFirstFilterFileInRoot(),
            "",
            "",
            "",
            getFirstFilterFirstLevelFolder(),
            ""
    );

    public static FilesProfile filesSecondFilterProfile = new FilesProfile(
            getSecondFilterFileInRoot(),
            "",
            "",
            "",
            getSecondFilterFirstLevelFolder(),
            ""
    );

    //=================

    public static FilesProfile getMainProfile() {
        return mainProfile;
    }

    public static FilesProfile getFileToDeleteProfile() {
        return filesToDeleteProfile;
    }

    public static FilesProfile getFirstFilterProfile() {
        return filesFirstFilterProfile;
    }

    public static FilesProfile getSecondFilterProfile() {
        return filesSecondFilterProfile;
    }


}
