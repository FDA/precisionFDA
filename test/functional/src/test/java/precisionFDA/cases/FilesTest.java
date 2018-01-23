package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.model.FileProfile;
import precisionFDA.model.FolderProfile;
import precisionFDA.pages.files.*;
import ru.yandex.qatools.htmlelements.annotations.Name;
import precisionFDA.data.TestUserData;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.overview.OverviewPage;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestFilesData.*;
import static precisionFDA.utils.Utils.*;

@Name("Files test suite")
public class FilesTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader("Precondition: Successful Login");

        UserProfile user = TestUserData.getTestUserOne();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();

        SoftAssert.assertThat(
                overviewPage.isNavigationPanelDisplayed())
                .as("navigation panel is displayed")
                .isTrue();

        SoftAssert.assertThat(
                overviewPage.getUsernameLinkText())
                .as("logged username")
                .isEqualTo(user.getApplUserFullName());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = "successfulLogin")
    public void uploadFileToRootDirectory() {
        printTestHeader("Test Case: check it is possible to upload text file to the root directory");

        FileProfile fileProfile = getMainFileProfile();

        FilesPage filesPage = openOverviewPage().openFilesPage();

        assertThat(
                filesPage.isAddFilesButtonDisplayed())
                .as("Add Files button is displayed")
                .isTrue();

        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(fileProfile.getFileName());

        assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("text file name")
                .isEqualTo(fileProfile.getFileName());

        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();

        assertThat(
                filesAddFilesPage.isUploadsCompleteDisplayed())
                .as("Uploads complete is displayed")
                .isTrue();

        assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("text file name")
                .isEqualTo(fileProfile.getFileName());

        filesPage = openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());
        uploadedFilePage = uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();

        SoftAssert.assertThat(
                uploadedFilePage.isPageTitleCorrect(fileProfile.getFileName()))
                .as("Page title is correct")
                .isTrue();

        SoftAssert.assertThat(
                uploadedFilePage.isAddedByCorrect())
                .as("Added by is correct")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = "successfulLogin")
    public void createFolderInRoot() {
        printTestHeader("Test Case: check it is possible to create a folder in the root directory");

        FolderProfile folderProfile = getMainFolderProfile();

        FilesPage filesPage = openFilesPage();

        assertThat(
                filesPage.isCreateFolderButtonDisplayed())
                .as("Create Folder button is displayed")
                .isTrue();

        filesPage = filesPage.createFolder(folderProfile.getFolderName());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(folderProfile.getFolderName()))
                .as("Link to created folder is displayed")
                .isTrue();

        assertThat(
                filesPage.isSuccessMessageDisplayed())
                .as("success alert is displayed")
                .isTrue();

        assertThat(
                filesPage.getSuccessMessageText())
                .as("success alert message")
                .contains(folderProfile.getFolderName());

        filesPage = filesPage.openFolder(folderProfile.getFolderName());

        assertThat(
                filesPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateBreadcrumbsMyFiles(folderProfile.getFolderName(), "", ""));
    }

    @Test(dependsOnMethods = { "createFolderInRoot", "successfulLogin" })
    public void uploadFileToCreatedFolder() {
        printTestHeader("Test Case: check it is possible to upload png file to the created folder");

        FolderProfile folderProfile = getMainFolderProfile();
        FileProfile fileProfile = getFileInMainFolderProfile();

        FilesPage filesPage = openFilesPage();
        filesPage = filesPage.openFolder(folderProfile.getFolderName());
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();

        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(fileProfile.getFileName());

        assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("png file name")
                .isEqualTo(fileProfile.getFileName());

        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();

        assertThat(
                filesAddFilesPage.isUploadsCompleteDisplayed())
                .as("Uploads complete is displayed")
                .isTrue();

        assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("png file name")
                .isEqualTo(fileProfile.getFileName());

        filesPage = openFilesPage().openFolder(folderProfile.getFolderName());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed inside the created folder")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());
        uploadedFilePage = uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();

        SoftAssert.assertThat(
                uploadedFilePage.isPageTitleCorrect(fileProfile.getFileName()))
                .as("Page title is correct")
                .isTrue();

        SoftAssert.assertThat(
                uploadedFilePage.isAddedByCorrect())
                .as("Added by is correct")
                .isTrue();

        SoftAssert.assertThat(
                uploadedFilePage.isAccessPrivate())
                .as("Access is private")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "createFolderInRoot", "successfulLogin" } )
    public void createSecondLevelFolder() {
        printTestHeader("Test Case: check it is possible to create a folder in the first level folder");

        FolderProfile mainFolderProfile = getMainFolderProfile();
        FolderProfile nextFolderProfile = getNextFolderProfile();

        FilesPage filesPage = openFilesPage();
        filesPage = filesPage.openFolder(mainFolderProfile.getFolderName());
        filesPage = filesPage.createFolder(nextFolderProfile.getFolderName());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(nextFolderProfile.getFolderName()))
                .as("Link to created folder is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.isSuccessMessageDisplayed())
                .as("success alert is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.getSuccessMessageText())
                .as("success alert message")
                .contains(nextFolderProfile.getFolderName());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = "successfulLogin")
    public void deleteFileInRootFromProfile() {
        printTestHeader("Test Case: check it is possible to delete an uploaded to root file from its profile");

        FileProfile fileProfile = getFileToDeleteProfile();

        FilesPage filesPage = openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();

        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(fileProfile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());
        uploadedFilePage = uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();
        filesPage = uploadedFilePage.deleteFile();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is NOT displayed inside root directory")
                .isFalse();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void filterByName() {
        printTestHeader("Test Case: check it is possible to filter folders and files by name");

        FileProfile filterOneFile = getFilterOneFile();
        FileProfile filterTwoFile = getFilterTwoFile();
        FileProfile filterCommonFile = getFilterCommonFile();

        FolderProfile filterMainFolder = getFilterMainFolder();
        FolderProfile filterOneFolder = getFilterOneFolder();
        FolderProfile filterTwoFolder = getFilterTwoFolder();
        FolderProfile filterCommonFolder = getFilterCommonFolder();
        FolderProfile nonFilterFolder = getNonFilterFolder();

        // create a folder in root directory and open it
        FilesPage filesPage = openFilesPage();
        filesPage = filesPage.createFolder(filterMainFolder.getFolderName());
        filesPage = filesPage.openFolder(filterMainFolder.getFolderName());

        // upload test files

        // with phrase 'filter#1'
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(filterOneFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();
        filesPage = filesPage.openFolder(filterMainFolder.getFolderName());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filterOneFile.getFileName()))
                .as("Link to uploaded file #1 is displayed inside the folder")
                .isTrue();

        // with phrase 'filter#2'
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(filterTwoFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();
        filesPage = filesPage.openFolder(filterMainFolder.getFolderName());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filterTwoFile.getFileName()))
                .as("Link to uploaded file #2 is displayed inside the folder")
                .isTrue();

        // with phrase 'filter'
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(filterCommonFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();
        filesPage = filesPage.openFolder(filterMainFolder.getFolderName());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filterCommonFile.getFileName()))
                .as("Link to uploaded common filter file is displayed inside the folder")
                .isTrue();

        // create test folders

        // with phrase 'filter#1'
        filesPage = filesPage.createFolder(filterOneFolder.getFolderName());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(filterOneFolder.getFolderName()))
                .as("Link to created folder #1 is displayed inside the folder")
                .isTrue();

        // with phrase 'filter#2'
        filesPage = filesPage.createFolder(filterTwoFolder.getFolderName());

        // without phrase 'filter'
        filesPage = filesPage.createFolder(nonFilterFolder.getFolderName());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(filterTwoFolder.getFolderName()))
                .as("Link to created folder #2 is displayed inside the folder")
                .isTrue();

        // with phrase 'filter'
        filesPage = filesPage.createFolder(filterCommonFolder.getFolderName());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(filterCommonFolder.getFolderName()))
                .as("Link to created common filter folder is displayed inside the folder")
                .isTrue();

        // filter by 'filter#1'
        filesPage = filesPage.filterByName(getFirstFilterPhrase());

        assertThat(
                filesPage.isCorrectSelectionByNameDisplayed(getFirstFilterPhrase()))
                .as("Correct selection is displayed: " + getFirstFilterPhrase())
                .isTrue();

        assertThat(
                (filesPage.getNumberOfDisplayedItems() == 2))
                .as("Number of displayed files and folders == 2")
                .isTrue();

        // filter by 'filter#2'
        filesPage = filesPage.filterByName(getSecondFilterPhrase());

        assertThat(
                filesPage.isCorrectSelectionByNameDisplayed(getSecondFilterPhrase()))
                .as("Correct selection is displayed: " + getSecondFilterPhrase())
                .isTrue();

        assertThat(
                (filesPage.getNumberOfDisplayedItems() == 2))
                .as("Number of displayed files and folders == 2")
                .isTrue();

        // filter by 'filter'
        filesPage = filesPage.filterByName(getCommonFilterPhrase());

        SoftAssert.assertThat(
                filesPage.isCorrectSelectionByNameDisplayed(getCommonFilterPhrase()))
                .as("Correct selection is displayed: " + getCommonFilterPhrase())
                .isTrue();

        SoftAssert.assertThat(
                (filesPage.getNumberOfDisplayedItems() == 6))
                .as("Number of displayed files and folders == 6")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "createSecondLevelFolder", "createFolderInRoot"})
    public void breadcrumbsNavigation() {
        printTestHeader("Test Case: validate navigation via breadcrumbs");

        FolderProfile mainFolderProfile = getMainFolderProfile();
        FolderProfile nextFolderProfile = getNextFolderProfile();

        // open second level folder
        FilesPage filesPage = openFilesPage();
        filesPage = filesPage.openFolder(mainFolderProfile.getFolderName());
        filesPage = filesPage.openFolder(nextFolderProfile.getFolderName());

        assertThat(
                filesPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateBreadcrumbsMyFiles(mainFolderProfile.getFolderName(), nextFolderProfile.getFolderName(), ""));

        // go to root directory
        filesPage = filesPage.clickBreadcrumbMyFiles();

        assertThat(
                filesPage.isBreadcrumbDisplayed())
                .as("Breadcrumbs are displayed")
                .isFalse();

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(mainFolderProfile.getFolderName()))
                .as("Link to first level folder is displayed")
                .isTrue();

        // open second level folder again
        filesPage = filesPage.openFolder(mainFolderProfile.getFolderName());
        filesPage = filesPage.openFolder(nextFolderProfile.getFolderName());

        // go to first level folder
        filesPage = filesPage.clickBreadcrumbFirstLevel();

        assertThat(
                filesPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateBreadcrumbsMyFiles(mainFolderProfile.getFolderName(), "", ""));

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(nextFolderProfile.getFolderName()))
                .as("Link to second level folder is displayed")
                .isTrue();

        // go to root directory
        filesPage = filesPage.clickBreadcrumbMyFiles();

        SoftAssert.assertThat(
                filesPage.isBreadcrumbDisplayed())
                .as("Breadcrumbs are displayed")
                .isFalse();

        SoftAssert.assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(mainFolderProfile.getFolderName()))
                .as("Link to first level folder is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "uploadFileToRootDirectory"})
    public void downloadFile() {
        printTestHeader("Test Case: check it is possible to download a file");

        FileProfile fileProfile = getMainFileProfile();

        FilesPage filesPage = openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());
        removeSameFileFromDownloads(fileProfile.getFileName());
        uploadedFilePage = uploadedFilePage.downloadFile();

        SoftAssert.assertThat(
                uploadedFilePage.getFilePageTitleText())
                .as("Title of the page")
                .isEqualTo(fileProfile.getFileName());

        SoftAssert.assertThat(
                isFileDownloaded(fileProfile.getFileName()))
                .as("The file is downloaded")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "uploadFileToRootDirectory"})
    public void renameFileFromProfile() {
        printTestHeader("Test Case: check it is possible to rename a file from its profile");

        FileProfile fileProfile = getMainFileProfile();

        FilesPage filesPage = openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());
        uploadedFilePage = uploadedFilePage.renameFileOnFilePage(fileProfile);

        assertThat(
                uploadedFilePage.getFilePageTitleText())
                .as("New Title of the page")
                .isEqualTo(fileProfile.getFileName());

        filesPage = openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to renamed file is displayed inside root directory")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin", "uploadFileToRootDirectory"})
    public void addFileDescription() {
        printTestHeader("Test Case: check it is possible to add a file description");

        FileProfile fileProfile = getMainFileProfile();

        FilesPage filesPage = openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());
        uploadedFilePage = uploadedFilePage.addFileDescription(fileProfile);

        assertThat(
                uploadedFilePage.getUploadedFileDescriptionText())
                .as("New Description of the file")
                .isEqualTo(fileProfile.getFileDescription());
    }

    @Test(dependsOnMethods = {"successfulLogin", "uploadFileToRootDirectory"})
    public void leaveComment() {
        printTestHeader("Test Case: check it is possible to write a comment");

        FileProfile fileProfile = getMainFileProfile();

        FilesPage filesPage = openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());
        uploadedFilePage = uploadedFilePage.leaveComment(fileProfile.getFileComment());

        SoftAssert.assertThat(
                uploadedFilePage.getFilePageTitleText())
                .as("Title of the page")
                .isEqualTo(fileProfile.getFileName());

        SoftAssert.assertThat(
                uploadedFilePage.getUploadedFileSavedCommentText())
                .as("Submitted comment text")
                .isEqualTo(fileProfile.getFileComment());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "uploadFileToRootDirectory"})
    public void validateAuthorizedURL() {
        printTestHeader("Test Case: check it is possible to use an authorized URL");

        FileProfile fileProfile = getMainFileProfile();

        FilesPage filesPage = openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());
        FilesAuthURLPage authorizedURLPage = uploadedFilePage.clickAuthorizedURL();

        assertThat(
                authorizedURLPage.isAuthorizedUrlDisplayed())
                .as("Authorized generated URL is displayed")
                .isTrue();

        String authUrl = authorizedURLPage.getAuthUrlText();
        removeSameFileFromDownloads(fileProfile.getFileName());
        wgetFile(authUrl);

        assertThat(
                isFileDownloaded(fileProfile.getFileName()))
                .as("The file [" + fileProfile.getFileName() + "] is downloaded by url [" + authUrl + "]")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void deleteSeveralItemsInFolder() {
        printTestHeader("Test Case: check it is possible to delete several files and folders in a folder");

        FileProfile firstFile = getScopeDeleteFirstFile();
        FileProfile secondFile = getScopeDeleteSecondFile();
        FileProfile thirdFile = getScopeDeleteThirdFile();
        FileProfile insideFile = getScopeDeleteFourthFile();

        FolderProfile mainFolder = getScopeDeleteMainFolder();
        FolderProfile firstFolder = getScopeDeleteFirstFolderToDelete();
        FolderProfile secondFolder = getScopeDeleteSecondFolderToLeave();
        FolderProfile thirdFolder = getScopeDeleteThirdFolderToDelete();

        // create a folder in root directory and open it
        FilesPage filesPage = openFilesPage();
        filesPage = filesPage.createFolder(mainFolder.getFolderName());
        filesPage = filesPage.openFolder(mainFolder.getFolderName());

        // upload test files

        // #1
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(firstFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();
        filesPage = filesPage.openFolder(mainFolder.getFolderName());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(firstFile.getFileName()))
                .as("Link to uploaded file #1 is displayed inside the folder")
                .isTrue();

        // #2
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(secondFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();
        filesPage = filesPage.openFolder(mainFolder.getFolderName());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(secondFile.getFileName()))
                .as("Link to uploaded file #2 is displayed inside the folder")
                .isTrue();

        // #3
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(thirdFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();
        filesPage = filesPage.openFolder(mainFolder.getFolderName());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(thirdFile.getFileName()))
                .as("Link to uploaded file #3 is displayed inside the folder")
                .isTrue();

        // create test folders

        // #1
        filesPage = filesPage.createFolder(firstFolder.getFolderName());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(firstFolder.getFolderName()))
                .as("Link to created folder #1 is displayed inside the folder")
                .isTrue();

        // upload file to the folder #1
        filesPage = filesPage.openFolder(firstFolder.getFolderName());
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(insideFile.getFileName());
        FilesAddFilesPage addFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = addFilesPage.openRootFilesPage();
        filesPage = filesPage.openFolder(mainFolder.getFolderName()).openFolder(firstFolder.getFolderName());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(insideFile.getFileName()))
                .as("Link to uploaded file #4 is displayed inside the folder")
                .isTrue();

        filesPage = filesPage.openRootFilesPage();
        filesPage = filesPage.openFolder(mainFolder.getFolderName());

        // #2
        filesPage = filesPage.createFolder(secondFolder.getFolderName());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(secondFolder.getFolderName()))
                .as("Link to created folder #2 is displayed inside the folder")
                .isTrue();

        // #3
        filesPage = filesPage.createFolder(thirdFolder.getFolderName());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(thirdFolder.getFolderName()))
                .as("Link to created folder #3 is displayed inside the folder")
                .isTrue();

        // select items to delete
        filesPage.selectItem(firstFile.getFileName());
        filesPage.selectItem(secondFile.getFileName());
        filesPage.selectItem(firstFolder.getFolderName());
        filesPage.selectItem(secondFolder.getFolderName());

        filesPage.clickDeleteSelected();

        assertThat(
                filesPage.isItemInDeleteDialogDisplayed(firstFile.getFileName()))
                .as("Selected to delete item is displayed in the confirmation dialog: " + firstFile.getFileName())
                .isTrue();

        assertThat(
                filesPage.isItemInDeleteDialogDisplayed(secondFile.getFileName()))
                .as("Selected to delete item is displayed in the confirmation dialog: " + secondFile.getFileName())
                .isTrue();

        assertThat(
                filesPage.isItemInDeleteDialogDisplayed(firstFolder.getFolderName()))
                .as("Selected to delete item is displayed in the confirmation dialog: " + firstFolder.getFolderName())
                .isTrue();

        assertThat(
                filesPage.isItemInDeleteDialogDisplayed(secondFolder.getFolderName()))
                .as("Selected to delete item is displayed in the confirmation dialog: " + secondFolder.getFolderName())
                .isTrue();

        assertThat(
                filesPage.isItemInDeleteDialogDisplayed(insideFile.getFileName()))
                .as("Selected to delete item is displayed in the confirmation dialog: " + insideFile.getFileName())
                .isTrue();

        assertThat(
                filesPage.getNumberOfItemsToDelete() == 5)
                .as("number of displayed items at the confirmation dialog == 5")
                .isTrue();

        filesPage.clickDeleteOnDialog();

        assertThat(
                filesPage.isDangerNotificationDisplayed())
                .as("Danger notification is displayed")
                .isFalse();

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(mainFolder.getFolderName()))
                .as("Root is open; Link to main folder is displayed in root directory")
                .isTrue();

        filesPage = filesPage.openFolder(mainFolder.getFolderName());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(thirdFile.getFileName()))
                .as("File is still displayed: " + thirdFile.getFileName())
                .isTrue();

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(thirdFolder.getFolderName()))
                .as("Folder is still displayed: " + thirdFolder.getFolderName())
                .isTrue();

        assertThat(
                 filesPage.getNumberOfDisplayedItems() == 2)
                .as("Number of displayed files and folders == 2")
                .isTrue();
    }

    @Test(dependsOnMethods = { "successfulLogin", "createFolderInRoot" } )
    public void renameFolder() {
        printTestHeader("Test Case: check it is possible to rename a folder");

        FolderProfile folderProfile = getMainFolderProfile();

        FilesPage filesPage = openFilesPage();

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(folderProfile.getFolderName()))
                .as("Link to created folder is displayed inside root directory")
                .isTrue();

        filesPage.selectItem(folderProfile.getFolderName());
        filesPage.clickRenameSelected();
        filesPage = filesPage.renameAndSaveFolder(folderProfile);

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(folderProfile.getFolderName()))
                .as("Link to folder with new name is displayed inside root directory")
                .isTrue();

        assertThat(
                filesPage.isDangerNotificationDisplayed())
                .as("Danger notification is displayed")
                .isFalse();
    }

    @Test(dependsOnMethods = { "successfulLogin", "uploadFileToRootDirectory" } )
    public void downloadItemsFromFilesList() {
        printTestHeader("Test Case: check it is possible to download selected items from files list");

        FileProfile mainFile = getMainFileProfile();

        FileProfile firstFile = getDownloadFirstFile();
        FileProfile secondFile = getDownloadSecondFile();
        FileProfile insideFile = getDownloadInsideFile();

        FolderProfile mainFolder = getDownloadMainFolder();
        FolderProfile firstFolder = getDownloadFirstFolder();

        // create main folder
        FilesPage filesPage = openFilesPage();
        filesPage = filesPage.createFolder(mainFolder.getFolderName());
        filesPage = filesPage.openFolder(mainFolder.getFolderName());

        // upload file #1
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(firstFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();

        // upload file #2
        filesPage = filesPage.openFolder(mainFolder.getFolderName());
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(secondFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();

        // create folder #1
        filesPage = filesPage.openFolder(mainFolder.getFolderName());
        filesPage = filesPage.createFolder(firstFolder.getFolderName());
        filesPage.openFolder(firstFolder.getFolderName());

        // upload file inside
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(insideFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        UploadedFilePage uploadedFilePage = filesAddFilesPage.openUploadedFile(insideFile.getFileName());
        uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();

        filesPage = openFilesPage();
        filesPage.selectItem(mainFolder.getFolderName());
        filesPage.selectItem(mainFile.getFileName());
        filesPage.clickDownloadSelected();

        assertThat(
                filesPage.isItemInDownloadDialogDisplayed(mainFile.getFileName()))
                .as("Selected to download item is displayed in the confirmation dialog: " + mainFile.getFileName())
                .isTrue();

        assertThat(
                filesPage.isItemInDownloadDialogDisplayed(firstFile.getFileName()))
                .as("Selected to download item is displayed in the confirmation dialog: " + firstFile.getFileName())
                .isTrue();

        assertThat(
                filesPage.isItemInDownloadDialogDisplayed(secondFile.getFileName()))
                .as("Selected to download item is displayed in the confirmation dialog: " + secondFile.getFileName())
                .isTrue();

        assertThat(
                filesPage.getNumberOfItemsToDownload() == 4)
                .as("number of displayed items at the confirmation dialog == 4")
                .isTrue();

        removeSameFileFromDownloads(mainFile.getFileName());
        removeSameFileFromDownloads(firstFile.getFileName());
        removeSameFileFromDownloads(secondFile.getFileName());
        removeSameFileFromDownloads(insideFile.getFileName());

        filesPage.scrollRight();

        filesPage.downloadItemFromDownloadDialog(mainFile.getFileName());

        assertThat(
                isFileDownloaded(mainFile.getFileName()))
                .as("The file is downloaded: " + mainFile.getFileName())
                .isTrue();

        filesPage.downloadItemFromDownloadDialog(firstFile.getFileName());

        assertThat(
                isFileDownloaded(firstFile.getFileName()))
                .as("The file is downloaded: " + firstFile.getFileName())
                .isTrue();

        filesPage.downloadItemFromDownloadDialog(secondFile.getFileName());

        assertThat(
                isFileDownloaded(secondFile.getFileName()))
                .as("The file is downloaded: " + secondFile.getFileName())
                .isTrue();

        filesPage.downloadItemFromDownloadDialog(insideFile.getFileName());

        assertThat(
                isFileDownloaded(insideFile.getFileName()))
                .as("The file is downloaded: " + insideFile.getFileName())
                .isTrue();

        openOverviewPage();
    }

    @Test(dependsOnMethods = { "successfulLogin" } )
    public void moveItems() {
        printTestHeader("Test Case: check it is possible to move folder and file to another folder");


//        == initially ==
//        Root Directory
//            ---- In Root Folder -
//                ---- in Root File -
//                ---- First Folder -
//                    ---- Third Folder -
//                        ---- third File -
//                    ---- Fifth Folder -
//                    ---- first File -
//                    ---- second File -
//                ---- Second Folder -
//                    ---- Fourth Folder
//                    ---- fourth File

        FolderProfile rootFolder = getMoveRootFolder();
        FolderProfile firstFolder = getMoveFirstFolder();
        FolderProfile secondFolder = getMoveSecondFolder();
        FolderProfile thirdFolder = getMoveThirdFolder();
        FolderProfile fourthFolder = getMoveFourthFolder();
        FolderProfile fifthFolder = getMoveFifthFolder();

        FileProfile inRootFolderFile = getMoveInRootFolderFile();
        FileProfile firstFile = getMoveFirstFile();
        FileProfile secondFile = getMoveSecondFile();
        FileProfile thirdFile = getMoveThirdFile();
        FileProfile fourthFile = getMoveFourthFile();

        // create in Root folder
        FilesPage filesPage = openFilesPage();
        filesPage = filesPage.createFolder(rootFolder.getFolderName());
        filesPage = filesPage.openFolder(rootFolder.getFolderName());

        // upload in root folder file
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(inRootFolderFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage().openFolder(rootFolder.getFolderName());

        // create folder #1
        filesPage = filesPage.createFolder(firstFolder.getFolderName());

        // create folder #2
        filesPage = filesPage.createFolder(secondFolder.getFolderName());

        // create folder #3
        filesPage = filesPage.openFolder(firstFolder.getFolderName());
        filesPage = filesPage.createFolder(thirdFolder.getFolderName());

        // create folder #5
        filesPage = filesPage.createFolder(fifthFolder.getFolderName());

        // upload file #1
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(firstFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();

        // upload file #2
        filesPage = filesPage.openFolder(rootFolder.getFolderName()).openFolder(firstFolder.getFolderName());
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(secondFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();

        // upload file #3
        filesPage = filesPage.openFolder(rootFolder.getFolderName()).
                openFolder(firstFolder.getFolderName()).
                openFolder(thirdFolder.getFolderName());
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(thirdFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();

        // create folder #4
        filesPage = filesPage.openFolder(rootFolder.getFolderName()).openFolder(secondFolder.getFolderName());
        filesPage = filesPage.createFolder(fourthFolder.getFolderName());

        // upload file #4
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(fourthFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();

        filesPage = filesPage.openFolder(rootFolder.getFolderName());
        filesPage.selectItem(firstFolder.getFolderName());
        filesPage.selectItem(inRootFolderFile.getFileName());
        filesPage.clickMoveSelected();

        filesPage.clickTreeItemOnMoveDialog(rootFolder.getFolderName());
        filesPage.clickTreeItemOnMoveDialog(secondFolder.getFolderName());
        filesPage = filesPage.clickMoveHere();

        assertThat(
                filesPage.isDangerNotificationDisplayed())
                .as("Danger notification is displayed")
                .isFalse();

        assertThat(
                filesPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateBreadcrumbsMyFiles(rootFolder.getFolderName(), secondFolder.getFolderName(), ""));

//        == should be ==
//        Root Directory
//            ---- In Root Folder -
//                ---- Second Folder -
//                    ---- Fourth Folder
//                    ---- fourth File
//                    ---- in Root File -
//                    ---- First Folder -
//                        ---- Third Folder -
//                            ---- third File -
//                        ---- Fifth Folder -
//                        ---- first File -
//                        ---- second File -

        //---------------

        filesPage = filesPage.openRootFilesPage().openFolder(rootFolder.getFolderName());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(secondFolder.getFolderName()))
                .as("Second folder is displayed")
                .isTrue();

        assertThat(
                filesPage.getNumberOfDisplayedItems() == 1)
                .as("Number of displayed files and folders == 1")
                .isTrue();

        //---------------

        filesPage = filesPage.openFolder(secondFolder.getFolderName());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(firstFolder.getFolderName()))
                .as("First folder is displayed")
                .isTrue();

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(fourthFolder.getFolderName()))
                .as("Fourth folder is displayed")
                .isTrue();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(inRootFolderFile.getFileName()))
                .as("In Root file is displayed")
                .isTrue();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fourthFile.getFileName()))
                .as("Fourth file is displayed")
                .isTrue();

        assertThat(
                filesPage.getNumberOfDisplayedItems() == 4)
                .as("Number of displayed files and folders == 4")
                .isTrue();

        //---------------

        filesPage = filesPage.openFolder(firstFolder.getFolderName());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(thirdFolder.getFolderName()))
                .as("Third folder is displayed")
                .isTrue();

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(fifthFolder.getFolderName()))
                .as("Fifth folder is displayed")
                .isTrue();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(firstFile.getFileName()))
                .as("First file is displayed")
                .isTrue();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(secondFile.getFileName()))
                .as("Second file is displayed")
                .isTrue();

        assertThat(
                filesPage.getNumberOfDisplayedItems() == 4)
                .as("Number of displayed files and folders == 4")
                .isTrue();

        //---------------

        filesPage = filesPage.openFolder(thirdFolder.getFolderName());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(thirdFile.getFileName()))
                .as("Third file is displayed")
                .isTrue();

        assertThat(
                filesPage.getNumberOfDisplayedItems() == 1)
                .as("Number of displayed files and folders == 1")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin", "uploadFileToRootDirectory", "createFolderInRoot"} )
    public void checkDropDownItemsAreDisabled() {
        printTestHeader("Test Case: check that drop-down items for bulk actions are disabled when there are not selected files/folders");

        FilesPage filesPage = openFilesPage();
        filesPage.openActionsDropDown();

        assertThat(
                filesPage.isDropDownDeleteItemClickable())
                .as("Delete item is clickable")
                .isFalse();

        assertThat(
                filesPage.isDropDownDownloadItemClickable())
                .as("Download item is clickable")
                .isFalse();

        assertThat(
                filesPage.isDropDownRenameItemClickable())
                .as("Rename item is clickable")
                .isFalse();

        assertThat(
                filesPage.isDropDownMoveItemClickable())
                .as("Move item is clickable")
                .isFalse();

        assertThat(
                filesPage.isDropDownPublishItemClickable())
                .as("Publish item is clickable")
                .isFalse();

        FileProfile mainFile = getMainFileProfile();
        FolderProfile mainFolder = getMainFolderProfile();

        filesPage.selectItem(mainFile.getFileName());
        filesPage.selectItem(mainFolder.getFolderName());
        filesPage.openActionsDropDown();

        assertThat(
                filesPage.isDropDownRenameItemClickable())
                .as("Rename item is clickable")
                .isFalse();
    }

    @Test(dependsOnMethods = {"successfulLogin"} )
    public void movePublicFiles() {
        printTestHeader("Test Case: check it is possible to move public file");

        FilesPage filesPage = openFilesPage();

        FolderProfile folder = getMovePublicFolder();
        FileProfile privateFile = getMovePublicFile();
        FileProfile publicFile = getMovePrivateFile();

        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(privateFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();

        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(publicFile.getFileName());
        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(publicFile.getFileName());
        uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();

        filesPage = openFilesPage().createFolder(folder.getFolderName());
        filesPage = filesPage.openRootFilesPage();

        filesPage.selectItem(publicFile.getFileName());
        filesPage.clickPublishSelected();
        filesPage.clickPublishOnDialog();

        filesPage.selectItem(privateFile.getFileName());
        filesPage.selectItem(publicFile.getFileName());
        filesPage.clickMoveSelected();

        filesPage.clickTreeItemOnMoveDialog(folder.getFolderName());
        filesPage = filesPage.clickMoveHere();

        assertThat(
                filesPage.isDangerNotificationDisplayed())
                .as("Danger notification is displayed")
                .isFalse();

        assertThat(
                filesPage.isBreadcrumbDisplayed())
                .as("Breadcrumbs are displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateBreadcrumbsMyFiles(folder.getFolderName(), "", ""));

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(privateFile.getFileName()))
                .as("Private file is displayed inside the folder")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(publicFile.getFileName()))
                .as("Public file is displayed inside the folder")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.getNumberOfDisplayedItems() == 2)
                .as("Number of files inside the folder == 2")
                .isTrue();

        SoftAssert.assertAll();
    }

}
