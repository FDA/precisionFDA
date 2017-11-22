package precisionFDA.data;

import precisionFDA.model.FileProfile;
import precisionFDA.model.FolderProfile;

import static precisionFDA.data.TestDict.getDictFilter;
import static precisionFDA.data.TestDict.getDictPng;
import static precisionFDA.data.TestDict.getDictTxt;
import static precisionFDA.utils.Utils.*;
import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

public class TestFilesData {

    //=== scope delete test ===

    final static String SCOPE_DELETE_MAIN_FOLDER_PREFIX = "at main folder scope delete test";

    final static String SCOPE_DELETE_TO_DELETE_FOLDER_PREFIX = "at folder to delete";

    final static String SCOPE_DELETE_TO_LEAVE_FOLDER_PREFIX = "at folder to leave";

    //---------------

    public static String getScopeDeleteFirstFileName() {
        return getGeneratedTestFileName(getDictTxt());
    }

    public static String getScopeDeleteSecondFileName() {
        return getGeneratedTestFileName(getDictPng());
    }

    public static String getScopeDeleteThirdFileName() {
        return getGeneratedTestFileName(getDictTxt());
    }

    public static String getScopeDeleteFourthFileName() {
        return getGeneratedTestFileName(getDictTxt());
    }

    //---------------

    public static String getScopeDeleteMainFolderName() {
        return SCOPE_DELETE_MAIN_FOLDER_PREFIX + getRunTimeLocalUniqueValue();
    }

    public static String getScopeDeleteFirstFolderToDeleteName() {
        return SCOPE_DELETE_TO_DELETE_FOLDER_PREFIX + " #1 " + getRunTimeLocalUniqueValue();
    }

    public static String getScopeDeleteSecondFolderToLeaveName() {
        return SCOPE_DELETE_TO_LEAVE_FOLDER_PREFIX + " #2 " + getRunTimeLocalUniqueValue();
    }

    public static String getScopeDeleteThirdFolderToDeleteName() {
        return SCOPE_DELETE_TO_DELETE_FOLDER_PREFIX + " #3 " + getRunTimeLocalUniqueValue();
    }

    //---------------

    public static FileProfile scopeDeleteFirstFile = new FileProfile(
            getScopeDeleteFirstFileName(),
            "",
            ""
    );

    public static FileProfile scopeDeleteSecondFile = new FileProfile(
            getScopeDeleteSecondFileName(),
            "",
            ""
    );

    public static FileProfile scopeDeleteThirdFile = new FileProfile(
            getScopeDeleteThirdFileName(),
            "",
            ""
    );

    public static FileProfile scopeDeleteFourthFile = new FileProfile(
            getScopeDeleteFourthFileName(),
            "",
            ""
    );

    public static FolderProfile scopeDeleteMainFolder = new FolderProfile(
            getScopeDeleteMainFolderName()
    );

    public static FolderProfile scopeDeleteFirstFolderToDelete = new FolderProfile(
            getScopeDeleteFirstFolderToDeleteName()
    );

    public static FolderProfile scopeDeleteSecondFolderToLeave = new FolderProfile(
            getScopeDeleteSecondFolderToLeaveName()
    );

    public static FolderProfile scopeDeleteThirdFolderToDelete = new FolderProfile(
            getScopeDeleteThirdFolderToDeleteName()
    );

    //---------------

    public static FileProfile getScopeDeleteFirstFile() {
        return scopeDeleteFirstFile;
    }

    public static FileProfile getScopeDeleteSecondFile() {
        return scopeDeleteSecondFile;
    }

    public static FileProfile getScopeDeleteThirdFile() {
        return scopeDeleteThirdFile;
    }

    public static FileProfile getScopeDeleteFourthFile() {
        return scopeDeleteFourthFile;
    }

    public static FolderProfile getScopeDeleteMainFolder() {
        return scopeDeleteMainFolder;
    }

    public static FolderProfile getScopeDeleteFirstFolderToDelete() {
        return scopeDeleteFirstFolderToDelete;
    }

    public static FolderProfile getScopeDeleteSecondFolderToLeave() {
        return scopeDeleteSecondFolderToLeave;
    }

    public static FolderProfile getScopeDeleteThirdFolderToDelete() {
        return scopeDeleteThirdFolderToDelete;
    }

    //=== filter test ===

    public static String getFirstFilterPhrase() {
        return getCommonFilterPhrase() + "#1";
    }

    public static String getSecondFilterPhrase() {
        return getCommonFilterPhrase() + "#2";
    }

    public static String getCommonFilterPhrase() {
        return getDictFilter();
    }

    final static String FILTER_MAIN_FOLDER_PREFIX = "at main folder filter test";

    final static String FILTER_FOLDER_PREFIX = "at folder test";

    //---------------

    public static String getFilterOneFileName() {
        return getGeneratedTestFileName(getFirstFilterPhrase());
    }

    public static String getFilterTwoFileName() {
        return getGeneratedTestFileName(getSecondFilterPhrase());
    }

    public static String getFilterCommonFileName() {
        return getGeneratedTestFileName(getCommonFilterPhrase());
    }

    //---------------

    public static String getFilterMainFolderName() {
        return FILTER_MAIN_FOLDER_PREFIX + getRunTimeLocalUniqueValue();
    }

    public static String getFilterOneFolderName() {
        return FILTER_FOLDER_PREFIX + getFirstFilterPhrase() + " " + getRunTimeLocalUniqueValue();
    }

    public static String getFilterTwoFolderName() {
        return FILTER_FOLDER_PREFIX + getSecondFilterPhrase() + " " + getRunTimeLocalUniqueValue();
    }

    public static String getFilterCommonFolderName() {
        return FILTER_FOLDER_PREFIX + getCommonFilterPhrase() + " " + getRunTimeLocalUniqueValue();
    }

    //---------------

    public static FileProfile filterOneFile = new FileProfile(
            getFilterOneFileName(),
            "",
            ""
    );

    public static FileProfile filterTwoFile = new FileProfile(
            getFilterTwoFileName(),
            "",
            ""
    );

    public static FileProfile filterCommonFile = new FileProfile(
            getFilterCommonFileName(),
            "",
            ""
    );

    public static FolderProfile filterMainFolder = new FolderProfile(
            getFilterMainFolderName()
    );

    public static FolderProfile filterOneFolder = new FolderProfile(
            getFilterOneFolderName()
    );

    public static FolderProfile filterTwoFolder = new FolderProfile(
            getFilterTwoFolderName()
    );

    public static FolderProfile filterCommonFolder = new FolderProfile(
            getFilterCommonFolderName()
    );

    //---------------

    public static FileProfile getFilterOneFile() {
        return filterOneFile;
    }

    public static FileProfile getFilterTwoFile() {
        return filterTwoFile;
    }

    public static FileProfile getFilterCommonFile() {
        return filterCommonFile;
    }

    public static FolderProfile getFilterMainFolder() {
        return filterMainFolder;
    }

    public static FolderProfile getFilterOneFolder() {
        return filterOneFolder;
    }

    public static FolderProfile getFilterTwoFolder() {
        return filterTwoFolder;
    }

    public static FolderProfile getFilterCommonFolder() {
        return filterCommonFolder;
    }

    //=== main file profile ===

    static final String TEST_FILE_DESCRIPTION_PREFIX = "at_description";

    static final String TEST_FILE_COMMENT_PREFIX = "at_comment";

    //-----------------

    public static String getMainFileInRoot() {
        return getGeneratedTestFileName(getDictTxt());
    }

    public static String getMainFileInRootDescr() {
        return TEST_FILE_DESCRIPTION_PREFIX + " " + getRunTimeLocalUniqueValue();
    }

    public static String getMainFileInRootComment() {
        return TEST_FILE_COMMENT_PREFIX + " " + getRunTimeLocalUniqueValue();
    }

    //-----------------

    public static FileProfile mainFileProfile = new FileProfile(
            getMainFileInRoot(),
            getMainFileInRootDescr(),
            getMainFileInRootComment()
    );

    //-----------------

    public static FileProfile getMainFileProfile() {
        return mainFileProfile;
    }

    //=== next level folder profile ===

    public static String getNextFolderName() {
        return TEST_FOLDER_NAME_PREFIX + " " + getRunTimeLocalUniqueValue();
    }

    //-----------------

    public static FolderProfile nextFolderProfile = new FolderProfile(
            getNextFolderName()
    );

    //-----------------

    public static FolderProfile getNextFolderProfile() {
        return nextFolderProfile;
    }

    //=== main folder profile ===

    static final String TEST_FOLDER_NAME_PREFIX = "at_folder";

    //-----------------

    public static String getMainFolderName() {
        return TEST_FOLDER_NAME_PREFIX + " " + getRunTimeLocalUniqueValue();
    }

    //-----------------

    public static FolderProfile mainFolderProfile = new FolderProfile(
            getMainFolderName()
    );

    //-----------------

    public static FolderProfile getMainFolderProfile() {
        return mainFolderProfile;
    }

    //===== file uploaded to the main folder ====


    public static FileProfile fileInMainFolderProfile = new FileProfile(
            getGeneratedTestFileName(getDictPng()),
            "",
            ""
    );

    public static FileProfile getFileInMainFolderProfile() {
        return fileInMainFolderProfile;
    }

    //====== file to delete ========

    public static FileProfile fileToDeleteProfile = new FileProfile(
            getGeneratedTestFileName(getDictPng()),
            "",
            ""
    );

    public static FileProfile getFileToDeleteProfile() {
        return fileToDeleteProfile;
    }

    //====== file to publish ========

    public static FileProfile fileToPublishProfile = new FileProfile(
            getGeneratedTestFileName(getDictTxt()),
            "",
            ""
    );

    public static FileProfile getPublishFileProfile() {
        return fileToPublishProfile;
    }

    //=== download folder test ===

    final static String SCOPE_DOWNLOAD_MAIN_FOLDER_PREFIX = "at main folder download test";

    //---------------

    public static String getDownloadFirstFileName() {
        return getGeneratedTestFileName(getDictTxt());
    }

    public static String getDownloadSecondFileName() {
        return getGeneratedTestFileName(getDictPng());
    }

    public static String getDownloadInsideFileName() {
        return getGeneratedTestFileName(getDictTxt());
    }

    //---------------

    public static String getDownloadMainFolderName() {
        return SCOPE_DOWNLOAD_MAIN_FOLDER_PREFIX + getRunTimeLocalUniqueValue();
    }

    public static String getDownloadFirstFolderName() {
        return TEST_FOLDER_NAME_PREFIX + getRunTimeLocalUniqueValue();
    }

    //---------------

    public static FileProfile downloadFirstFile = new FileProfile(
            getDownloadFirstFileName(),
            "",
            ""
    );

    public static FileProfile downloadSecondFile = new FileProfile(
            getDownloadSecondFileName(),
            "",
            ""
    );

    public static FileProfile downloadInsideFile = new FileProfile(
            getDownloadInsideFileName(),
            "",
            ""
    );

    public static FolderProfile downloadMainFolder = new FolderProfile(
            getDownloadMainFolderName()
    );

    public static FolderProfile downloadFirstFolder = new FolderProfile(
            getDownloadFirstFolderName()
    );

    //---------------

    public static FileProfile getDownloadFirstFile() {
        return downloadFirstFile;
    }

    public static FileProfile getDownloadSecondFile() {
        return downloadSecondFile;
    }

    public static FileProfile getDownloadInsideFile() {
        return downloadInsideFile;
    }

    public static FolderProfile getDownloadMainFolder() {
        return downloadMainFolder;
    }

    public static FolderProfile getDownloadFirstFolder() {
        return downloadFirstFolder;
    }

}
