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

    public static String getNonFilterFolderName() {
        return FILTER_FOLDER_PREFIX + " ilter " + getRunTimeLocalUniqueValue();
    }

    //---------------

    static FileProfile filterOneFile = new FileProfile(
            getFilterOneFileName(),
            "",
            ""
    );

    static FileProfile filterTwoFile = new FileProfile(
            getFilterTwoFileName(),
            "",
            ""
    );

    static FileProfile filterCommonFile = new FileProfile(
            getFilterCommonFileName(),
            "",
            ""
    );

    static FolderProfile filterMainFolder = new FolderProfile(
            getFilterMainFolderName()
    );

    static FolderProfile filterOneFolder = new FolderProfile(
            getFilterOneFolderName()
    );

    static FolderProfile filterTwoFolder = new FolderProfile(
            getFilterTwoFolderName()
    );

    static FolderProfile filterCommonFolder = new FolderProfile(
            getFilterCommonFolderName()
    );

    static FolderProfile nonFilterFolder = new FolderProfile(
            getNonFilterFolderName()
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

    public static FolderProfile getNonFilterFolder() {
        return nonFilterFolder;
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

    static FileProfile mainFileProfile = new FileProfile(
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

    static FolderProfile mainFolderProfile = new FolderProfile(
            getMainFolderName()
    );

    //-----------------

    public static FolderProfile getMainFolderProfile() {
        return mainFolderProfile;
    }

    //===== file uploaded to the main folder ====


    static FileProfile fileInMainFolderProfile = new FileProfile(
            getGeneratedTestFileName(getDictPng()),
            "",
            ""
    );

    public static FileProfile getFileInMainFolderProfile() {
        return fileInMainFolderProfile;
    }

    //====== file to delete ========

    static FileProfile fileToDeleteProfile = new FileProfile(
            getGeneratedTestFileName(getDictPng()),
            "",
            ""
    );

    public static FileProfile getFileToDeleteProfile() {
        return fileToDeleteProfile;
    }

    //====== file to publish ========

    static FileProfile fileToPublishProfile = new FileProfile(
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

    static FileProfile downloadFirstFile = new FileProfile(
            getDownloadFirstFileName(),
            "",
            ""
    );

    static FileProfile downloadSecondFile = new FileProfile(
            getDownloadSecondFileName(),
            "",
            ""
    );

    static FileProfile downloadInsideFile = new FileProfile(
            getDownloadInsideFileName(),
            "",
            ""
    );

    static FolderProfile downloadMainFolder = new FolderProfile(
            getDownloadMainFolderName()
    );

    static FolderProfile downloadFirstFolder = new FolderProfile(
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

    //=== moving test ===

    public static String getMoveInRootFolderFileName() {
        return getGeneratedTestFileName(getDictPng());
    }

    public static String getMoveFirstFileName() {
        return getGeneratedTestFileName(getDictTxt());
    }

    public static String getMoveSecondFileName() {
        return getGeneratedTestFileName(getDictPng());
    }

    public static String getMoveThirdFileName() {
        return getGeneratedTestFileName(getDictTxt());
    }

    public static String getMoveFourthFileName() {
        return getGeneratedTestFileName(getDictPng());
    }

    //---------------

    static FileProfile moveInRootFolderFile = new FileProfile(
            getMoveInRootFolderFileName(),
            "",
            ""
    );

    static FileProfile moveFirstFile = new FileProfile(
            getMoveFirstFileName(),
            "",
            ""
    );

    static FileProfile moveSecondFile = new FileProfile(
            getMoveSecondFileName(),
            "",
            ""
    );

    static FileProfile moveThirdFile = new FileProfile(
            getMoveThirdFileName(),
            "",
            ""
    );

    static FileProfile moveFourthFile = new FileProfile(
            getMoveFourthFileName(),
            "",
            ""
    );

    //---------------

    public static FileProfile getMoveInRootFolderFile() {
        return moveInRootFolderFile;
    }

    public static FileProfile getMoveFirstFile() {
        return moveFirstFile;
    }

    public static FileProfile getMoveSecondFile() {
        return moveSecondFile;
    }

    public static FileProfile getMoveThirdFile() {
        return moveThirdFile;
    }

    public static FileProfile getMoveFourthFile() {
        return moveFourthFile;
    }

    //---------------

    static FolderProfile moveRootFolder = new FolderProfile(
            "at Move test In Root " + getRunTimeLocalUniqueValue()
    );

    static FolderProfile moveFirstFolder = new FolderProfile(
            "at Move test First " + getRunTimeLocalUniqueValue()
    );

    static FolderProfile moveSecondFolder = new FolderProfile(
            "at Move test Second " + getRunTimeLocalUniqueValue()
    );

    static FolderProfile moveThirdFolder = new FolderProfile(
            "at Move test Third " + getRunTimeLocalUniqueValue()
    );

    static FolderProfile moveFourthFolder = new FolderProfile(
            "at Move test Fourth " + getRunTimeLocalUniqueValue()
    );

    static FolderProfile moveFifthFolder = new FolderProfile(
            "at Move test Fifth " + getRunTimeLocalUniqueValue()
    );

    //---------------

    public static FolderProfile getMoveRootFolder() {
        return moveRootFolder;
    }

    public static FolderProfile getMoveFirstFolder() {
        return moveFirstFolder;
    }

    public static FolderProfile getMoveSecondFolder() {
        return moveSecondFolder;
    }

    public static FolderProfile getMoveThirdFolder() {
        return moveThirdFolder;
    }

    public static FolderProfile getMoveFourthFolder() {
        return moveFourthFolder;
    }

    public static FolderProfile getMoveFifthFolder() {
        return moveFifthFolder;
    }

    //=== publish on grid test ===

    public static String getPublishGridFileInRootOneName() {
        return getGeneratedTestFileName(getDictPng());
    }

    public static String getPublishGridFileInRootTwoName() {
        return getGeneratedTestFileName(getDictTxt());
    }

    public static String getPublishGridFirstFileName() {
        return getGeneratedTestFileName(getDictTxt());
    }

    public static String getPublishGridSecondFileName() {
        return getGeneratedTestFileName(getDictPng());
    }

    public static String getPublishGridThirdFileName() {
        return getGeneratedTestFileName(getDictTxt());
    }

    static FileProfile publishGridFileInRootOne = new FileProfile(
            getPublishGridFileInRootOneName(),
            "",
            ""
    );

    static FileProfile publishGridFileInRootTwo = new FileProfile(
            getPublishGridFileInRootTwoName(),
            "",
            ""
    );

    static FileProfile publishGridFirstFileName = new FileProfile(
            getPublishGridFirstFileName(),
            "",
            ""
    );

    static FileProfile publishGridSecondFileName = new FileProfile(
            getPublishGridSecondFileName(),
            "",
            ""
    );

    static FileProfile publishGridThirdFileName = new FileProfile(
            getPublishGridThirdFileName(),
            "",
            ""
    );

    public static FileProfile getPublishGridFileInRootOne() {
        return publishGridFileInRootOne;
    }

    public static FileProfile getPublishGridFileInRootTwo() {
        return publishGridFileInRootTwo;
    }

    public static FileProfile getPublishGridFirstFile() {
        return publishGridFirstFileName;
    }

    public static FileProfile getPublishGridSecondFile() {
        return publishGridSecondFileName;
    }

    public static FileProfile getPublishGridThirdFile() {
        return publishGridThirdFileName;
    }

    static FolderProfile publishGridFolder = new FolderProfile(
            "at Publish in grid " + getRunTimeLocalUniqueValue()
    );

    public static FolderProfile getPublishGridFolder() {
        return publishGridFolder;
    }

    //=== main space test ===

    static FolderProfile mainSpaceFolder = new FolderProfile(
            "at space folder " + getRunTimeLocalUniqueValue()
    );

    public static FolderProfile getMainSpaceFolder() {
        return mainSpaceFolder;
    }

    static FileProfile mainSpaceFile = new FileProfile(
            getGeneratedTestFileName(getDictTxt()),
            "",
            ""
    );

    public static FileProfile getMainSpaceFile() {
        return mainSpaceFile;
    }

    //=== move public test ===

    static FolderProfile movePublicFolder = new FolderProfile(
            "at move public folder " + getRunTimeLocalUniqueValue()
    );

    public static FolderProfile getMovePublicFolder() {
        return movePublicFolder;
    }

    static FileProfile movePublicFile = new FileProfile(
            getGeneratedTestFileName(getDictTxt()),
            "",
            ""
    );

    static FileProfile movePrivateFile = new FileProfile(
            getGeneratedTestFileName(getDictTxt()),
            "",
            ""
    );

    public static FileProfile getMovePublicFile() {
        return movePublicFile;
    }

    public static FileProfile getMovePrivateFile() {
        return movePrivateFile;
    }

    //=== to edit space test ===

    static FolderProfile toEditSpaceFolder = new FolderProfile(
            "at space folder to edit " + getRunTimeLocalUniqueValue()
    );

    public static FolderProfile getToEditSpaceFolder() {
        return toEditSpaceFolder;
    }

    static FileProfile toEditSpaceFile = new FileProfile(
            getGeneratedTestFileName(getDictPng()),
            "",
            ""
    );

    public static FileProfile getToEditSpaceFile() {
        return toEditSpaceFile;
    }

    //=== to delete space test ===

    static FolderProfile toDeleteSpaceFolder = new FolderProfile(
            "at space folder to delete " + getRunTimeLocalUniqueValue()
    );

    public static FolderProfile getToDeleteSpaceFolder() {
        return toDeleteSpaceFolder;
    }

    static FileProfile toDeleteSpaceFile = new FileProfile(
            getGeneratedTestFileName(getDictPng()),
            "",
            ""
    );

    static FileProfile toDeleteSpaceFileSecond = new FileProfile(
            getGeneratedTestFileName(getDictPng()),
            "",
            ""
    );

    public static FileProfile getToDeleteSpaceFile() {
        return toDeleteSpaceFile;
    }

    public static FileProfile getToDeleteSpaceFileSecond() {
        return toDeleteSpaceFileSecond;
    }

    //=== to move space test ===

    static FolderProfile toMoveSpaceFolder = new FolderProfile(
            "at space folder move test " + getRunTimeLocalUniqueValue()
    );

    public static FolderProfile getToMoveSpaceFolder() {
        return toMoveSpaceFolder;
    }

    static FileProfile toMoveSpaceFile = new FileProfile(
            getGeneratedTestFileName(getDictTxt()),
            "",
            ""
    );

    public static FileProfile getToMoveSpaceFile() {
        return toMoveSpaceFile;
    }

    //=== to publish space test ===

    static FolderProfile toPublishSpaceFolder = new FolderProfile(
            "at space folder to publish " + getRunTimeLocalUniqueValue()
    );

    public static FolderProfile getToPublishSpaceFolder() {
        return toPublishSpaceFolder;
    }

    static FileProfile toPublishSpaceFile = new FileProfile(
            getGeneratedTestFileName(getDictPng()),
            "",
            ""
    );

    static FileProfile toPublishSpaceFileSecond = new FileProfile(
            getGeneratedTestFileName(getDictPng()),
            "",
            ""
    );

    public static FileProfile getToPublishSpaceFile() {
        return toPublishSpaceFile;
    }

    public static FileProfile getToPublishSpaceFileSecond() {
        return toPublishSpaceFileSecond;
    }

    //=== publish a file to a space from Files page ===

    public static FileProfile getPublishToSpaceFile() {
        return publishToSpaceFile;
    }

    static FileProfile publishToSpaceFile = new FileProfile(
            getGeneratedTestFileName(getDictPng()),
            "",
            ""
    );

    //=== main new challenge entry file  ===

    public static FileProfile getMainNewChallEntryFile() {
        return mainNewChallEntryFile;
    }

    static FileProfile mainNewChallEntryFile = new FileProfile(
            getGeneratedTestFileName(getDictTxt()),
            "",
            ""
    );

    //=== main second challenge entry file  ===

    public static FileProfile getSecondNewChallEntryFile() {
        return secondChallEntryFile;
    }

    static FileProfile secondChallEntryFile = new FileProfile(
            getGeneratedTestFileName(getDictTxt()),
            "",
            ""
    );

    //=== main WF input file  ===

    public static FileProfile getMainWFInputFile() {
        return mainWFInputFile;
    }

    static FileProfile mainWFInputFile = new FileProfile(
            getGeneratedTestFileName(getDictTxt()),
            "",
            ""
    );

    //=== move file in public space by admin  ===

    public static FileProfile getMoveInPublicSpaceFileProfile() {
        return moveInPublicSpaceFileProfile;
    }

    static FileProfile moveInPublicSpaceFileProfile = new FileProfile(
            getGeneratedTestFileName(getDictPng()),
            "",
            ""
    );

    static FolderProfile moveInPublicSpaceFolder = new FolderProfile(
            "at move in publish space " + getRunTimeLocalUniqueValue()
    );

    public static FolderProfile getMoveInPublicSpaceFolder() {
        return moveInPublicSpaceFolder;
    }

    //=== attach to discussion file  ===

    static FileProfile discAttachFile = new FileProfile(
            getGeneratedTestFileName(getDictTxt()),
            "",
            ""
    );

    public static FileProfile getDiscAttachFile() {
        return discAttachFile;
    }

}
