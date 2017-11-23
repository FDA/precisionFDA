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

        UserProfile user = TestUserData.getTestUser();
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

        SoftAssert.assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("text file name")
                .isEqualTo(fileProfile.getFileName());

        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();

        SoftAssert.assertThat(
                filesAddFilesPage.isUploadsCompleteDisplayed())
                .as("Uploads complete is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("text file name")
                .isEqualTo(fileProfile.getFileName());

        filesPage = openOverviewPage().openFilesPage();

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

        FilesPage filesPage = openOverviewPage().openFilesPage();

        assertThat(
                filesPage.isCreateFolderButtonDisplayed())
                .as("Create Folder button is displayed")
                .isTrue();

        filesPage = filesPage.createFolder(folderProfile.getFolderName());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(folderProfile.getFolderName()))
                .as("Link to created folder is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.isSuccessMessageDisplayed())
                .as("success alert is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.getSuccessMessageText())
                .as("success alert message")
                .contains(folderProfile.getFolderName());

        filesPage = filesPage.openFolder(folderProfile.getFolderName());

        SoftAssert.assertThat(
                filesPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateExpectedBreadcrumbs(folderProfile.getFolderName(), "", ""));

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "createFolderInRoot", "successfulLogin" })
    public void uploadFileToCreatedFolder() {
        printTestHeader("Test Case: check it is possible to upload png file to the created folder");

        FolderProfile folderProfile = getMainFolderProfile();
        FileProfile fileProfile = getFileInMainFolderProfile();

        FilesPage filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.openFolder(folderProfile.getFolderName());
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();

        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(fileProfile.getFileName());

        SoftAssert.assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("png file name")
                .isEqualTo(fileProfile.getFileName());

        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();

        SoftAssert.assertThat(
                filesAddFilesPage.isUploadsCompleteDisplayed())
                .as("Uploads complete is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("png file name")
                .isEqualTo(fileProfile.getFileName());

        filesPage = openOverviewPage().openFilesPage().openFolder(folderProfile.getFolderName());

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

        FilesPage filesPage = openOverviewPage().openFilesPage();
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

        FilesPage filesPage = openOverviewPage().openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();

        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(fileProfile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = openOverviewPage().openFilesPage();

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
        FilesPage filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.createFolder(filterMainFolder.getFolderName());
        filesPage = filesPage.openFolder(filterMainFolder.getFolderName());

        // upload test files

        // with phrase 'filter#1'
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(filterOneFile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.openFolder(filterMainFolder.getFolderName());

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filterOneFile.getFileName()))
                .as("Link to uploaded file #1 is displayed inside the folder")
                .isTrue();

        // with phrase 'filter#2'
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(filterTwoFile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.openFolder(filterMainFolder.getFolderName());

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filterTwoFile.getFileName()))
                .as("Link to uploaded file #2 is displayed inside the folder")
                .isTrue();

        // with phrase 'filter'
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(filterCommonFile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.openFolder(filterMainFolder.getFolderName());

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filterCommonFile.getFileName()))
                .as("Link to uploaded common filter file is displayed inside the folder")
                .isTrue();

        // create test folders

        // with phrase 'filter#1'
        filesPage = filesPage.createFolder(filterOneFolder.getFolderName());

        SoftAssert.assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(filterOneFolder.getFolderName()))
                .as("Link to created folder #1 is displayed inside the folder")
                .isTrue();

        // with phrase 'filter#2'
        filesPage = filesPage.createFolder(filterTwoFolder.getFolderName());

        // without phrase 'filter'
        filesPage = filesPage.createFolder(nonFilterFolder.getFolderName());

        SoftAssert.assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(filterTwoFolder.getFolderName()))
                .as("Link to created folder #2 is displayed inside the folder")
                .isTrue();

        // with phrase 'filter'
        filesPage = filesPage.createFolder(filterCommonFolder.getFolderName());

        SoftAssert.assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(filterCommonFolder.getFolderName()))
                .as("Link to created common filter folder is displayed inside the folder")
                .isTrue();


        // filter by 'filter#1'
        filesPage = filesPage.filterByName(getFirstFilterPhrase());

        SoftAssert.assertThat(
                filesPage.isCorrectSelectionByNameDisplayed(getFirstFilterPhrase()))
                .as("Correct selection is displayed: " + getFirstFilterPhrase())
                .isTrue();

        SoftAssert.assertThat(
                (filesPage.getNumberOfDisplayedItems() == 2))
                .as("Number of displayed files and folders == 2")
                .isTrue();

        // filter by 'filter#2'
        filesPage = filesPage.filterByName(getSecondFilterPhrase());

        SoftAssert.assertThat(
                filesPage.isCorrectSelectionByNameDisplayed(getSecondFilterPhrase()))
                .as("Correct selection is displayed: " + getSecondFilterPhrase())
                .isTrue();

        SoftAssert.assertThat(
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
        FilesPage filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.openFolder(mainFolderProfile.getFolderName());
        filesPage = filesPage.openFolder(nextFolderProfile.getFolderName());

        assertThat(
                filesPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateExpectedBreadcrumbs(mainFolderProfile.getFolderName(), nextFolderProfile.getFolderName(), ""));

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

        // open second level folder again
        filesPage = filesPage.openFolder(mainFolderProfile.getFolderName());
        filesPage = filesPage.openFolder(nextFolderProfile.getFolderName());

        // go to first level folder
        filesPage = filesPage.clickBreadcrumbFirstLevel();

        SoftAssert.assertThat(
                filesPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateExpectedBreadcrumbs(mainFolderProfile.getFolderName(), "", ""));

        SoftAssert.assertThat(
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

        FilesPage filesPage = openOverviewPage().openFilesPage();

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

        FilesPage filesPage = openOverviewPage().openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());
        uploadedFilePage = uploadedFilePage.renameFileOnFilePage(fileProfile);

        SoftAssert.assertThat(
                uploadedFilePage.getFilePageTitleText())
                .as("New Title of the page")
                .isEqualTo(fileProfile.getFileName());

        filesPage = openOverviewPage().openFilesPage();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to renamed file is displayed inside root directory")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "uploadFileToRootDirectory"})
    public void addFileDescription() {
        printTestHeader("Test Case: check it is possible to add a file description");

        FileProfile fileProfile = getMainFileProfile();

        FilesPage filesPage = openOverviewPage().openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());
        uploadedFilePage = uploadedFilePage.addFileDescription(fileProfile);

        SoftAssert.assertThat(
                uploadedFilePage.getUploadedFileDescriptionText())
                .as("New Description of the file")
                .isEqualTo(fileProfile.getFileDescription());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "uploadFileToRootDirectory"})
    public void leaveComment() {
        printTestHeader("Test Case: check it is possible to write a comment");

        FileProfile fileProfile = getMainFileProfile();

        FilesPage filesPage = openOverviewPage().openFilesPage();

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

        FilesPage filesPage = openOverviewPage().openFilesPage();

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

        SoftAssert.assertThat(
                isFileDownloaded(fileProfile.getFileName()))
                .as("The file [" + fileProfile.getFileName() + "] is downloaded by url [" + authUrl + "]")
                .isTrue();

        SoftAssert.assertAll();
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
        FilesPage filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.createFolder(mainFolder.getFolderName());
        filesPage = filesPage.openFolder(mainFolder.getFolderName());

        // upload test files

        // #1
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(firstFile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.openFolder(mainFolder.getFolderName());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(firstFile.getFileName()))
                .as("Link to uploaded file #1 is displayed inside the folder")
                .isTrue();

        // #2
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(secondFile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.openFolder(mainFolder.getFolderName());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(secondFile.getFileName()))
                .as("Link to uploaded file #2 is displayed inside the folder")
                .isTrue();

        // #3
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(thirdFile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = openOverviewPage().openFilesPage();
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
        filesAddFilesPage.uploadAllFiles();
        filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.openFolder(mainFolder.getFolderName()).openFolder(firstFolder.getFolderName());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(insideFile.getFileName()))
                .as("Link to uploaded file #4 is displayed inside the folder")
                .isTrue();

        filesPage = openOverviewPage().openFilesPage();
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
        filesPage = openOverviewPage().openFilesPage();
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

        FilesPage filesPage = openOverviewPage().openFilesPage();

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
    }

    @Test(dependsOnMethods = { "successfulLogin", "uploadFileToRootDirectory" } )
    public void downloadItemsFromFilesList() {
        printTestHeader("Test Case: check it is possible to download select items from files list");

        FileProfile mainFile = getMainFileProfile();

        FileProfile firstFile = getDownloadFirstFile();
        FileProfile secondFile = getDownloadSecondFile();
        FileProfile insideFile = getDownloadInsideFile();

        FolderProfile mainFolder = getDownloadMainFolder();
        FolderProfile firstFolder = getDownloadFirstFolder();

        // create main folder
        FilesPage filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.createFolder(mainFolder.getFolderName());
        filesPage = filesPage.openFolder(mainFolder.getFolderName());

        // upload file #1
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(firstFile.getFileName());
        filesAddFilesPage.uploadAllFiles();

        // upload file #2
        openOverviewPage().openFilesPage().openFolder(mainFolder.getFolderName());
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(secondFile.getFileName());
        filesAddFilesPage.uploadAllFiles();

        // create folder #1
        filesPage = openOverviewPage().openFilesPage().openFolder(mainFolder.getFolderName());
        filesPage = filesPage.createFolder(firstFolder.getFolderName());
        filesPage.openFolder(firstFolder.getFolderName());

        // upload file inside
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(insideFile.getFileName());
        filesAddFilesPage.uploadAllFiles();

        filesPage = openOverviewPage().openFilesPage();
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

        SoftAssert.assertThat(
                isFileDownloaded(mainFile.getFileName()))
                .as("The file is downloaded: " + mainFile.getFileName())
                .isTrue();

        filesPage.downloadItemFromDownloadDialog(firstFile.getFileName());

        SoftAssert.assertThat(
                isFileDownloaded(firstFile.getFileName()))
                .as("The file is downloaded: " + firstFile.getFileName())
                .isTrue();

        filesPage.downloadItemFromDownloadDialog(secondFile.getFileName());

        SoftAssert.assertThat(
                isFileDownloaded(secondFile.getFileName()))
                .as("The file is downloaded: " + secondFile.getFileName())
                .isTrue();

        filesPage.downloadItemFromDownloadDialog(insideFile.getFileName());

        SoftAssert.assertThat(
                isFileDownloaded(insideFile.getFileName()))
                .as("The file is downloaded: " + insideFile.getFileName())
                .isTrue();

        openOverviewPage();

        SoftAssert.assertAll();
    }
}
