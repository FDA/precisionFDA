package precisionFDA.cases;

import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import precisionFDA.data.TestUserData;
import precisionFDA.model.FilesProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.files.FilesAddFilesPage;
import precisionFDA.pages.files.FilesPage;
import precisionFDA.pages.files.UploadedFilePage;
import precisionFDA.pages.overview.OverviewPage;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestDict.getDictCommonFilterPhrase;
import static precisionFDA.data.TestDict.getDictFirstFilterPhrase;
import static precisionFDA.data.TestDict.getDictSecondFilterPhrase;
import static precisionFDA.data.TestFilesData.*;
import static precisionFDA.utils.Utils.generateExpectedBreadcrumbs;
import static precisionFDA.utils.Utils.removeSameFileFromDownloads;

@Name("Files test suite")
public class FilesTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader(" -- Successful Login -- ");

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

        FilesProfile filesProfile = getMainFilesProfile();

        FilesPage filesPage = openOverviewPage().openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(filesProfile.getFileInRoot());

        SoftAssert.assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("text file name")
                .isEqualTo(filesProfile.getFileInRoot());

        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();

        SoftAssert.assertThat(
                filesAddFilesPage.isUploadsCompleteDisplayed())
                .as("Uploads complete is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("text file name")
                .isEqualTo(filesProfile.getFileInRoot());

        filesPage = openOverviewPage().openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filesProfile.getFileInRoot()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(filesProfile.getFileInRoot());
        uploadedFilePage = uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();

        SoftAssert.assertThat(
                uploadedFilePage.isPageTitleCorrect(filesProfile.getFileInRoot()))
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

    @Test(dependsOnMethods = "successfulLogin")
    public void createFirstLevelFolder() {
        printTestHeader("Test Case: check it is possible to create a folder in the root directory");

        FilesProfile filesProfile = getMainFilesProfile();

        FilesPage filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.createFolder(filesProfile.getFirstLevelFolder());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(filesProfile.getFirstLevelFolder()))
                .as("Link to created folder is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.isSuccessMessageDisplayed())
                .as("success alert is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.getSuccessMessageText())
                .as("success alert message")
                .contains(filesProfile.getFirstLevelFolder());

        filesPage = filesPage.openFolder(filesProfile.getFirstLevelFolder());

        SoftAssert.assertThat(
                filesPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateExpectedBreadcrumbs(filesProfile.getFirstLevelFolder(), "", ""));

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = "createFirstLevelFolder")
    public void uploadFileToFirstLevelFolder() {
        printTestHeader("Test Case: check it is possible to upload png file to the first level folder");

        FilesProfile filesProfile = getMainFilesProfile();

        FilesPage filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.openFolder(filesProfile.getFirstLevelFolder());
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();

        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(filesProfile.getFileInFirstLevelFolder());

        SoftAssert.assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("png file name")
                .isEqualTo(filesProfile.getFileInFirstLevelFolder());

        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();

        SoftAssert.assertThat(
                filesAddFilesPage.isUploadsCompleteDisplayed())
                .as("Uploads complete is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("png file name")
                .isEqualTo(filesProfile.getFileInFirstLevelFolder());

        filesPage = openOverviewPage().openFilesPage().openFolder(filesProfile.getFirstLevelFolder());

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filesProfile.getFileInFirstLevelFolder()))
                .as("Link to uploaded file is displayed inside the first level folder")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(filesProfile.getFileInFirstLevelFolder());
        uploadedFilePage = uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();

        SoftAssert.assertThat(
                uploadedFilePage.isPageTitleCorrect(filesProfile.getFileInFirstLevelFolder()))
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

    @Test(dependsOnMethods = "createFirstLevelFolder")
    public void createSecondLevelFolder() {
        printTestHeader("Test Case: check it is possible to create a folder in the first level folder");

        FilesProfile filesProfile = getMainFilesProfile();

        FilesPage filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.openFolder(filesProfile.getFirstLevelFolder());
        filesPage = filesPage.createFolder(filesProfile.getSecondLevelFolder());

        assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(filesProfile.getSecondLevelFolder()))
                .as("Link to created folder is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.isSuccessMessageDisplayed())
                .as("success alert is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.getSuccessMessageText())
                .as("success alert message")
                .contains(filesProfile.getSecondLevelFolder());

        filesPage = filesPage.openFolder(filesProfile.getSecondLevelFolder());

        SoftAssert.assertThat(
                filesPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateExpectedBreadcrumbs(filesProfile.getFirstLevelFolder(), filesProfile.getSecondLevelFolder(), ""));

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = "successfulLogin")
    public void deleteFileInRoot() {
        printTestHeader("Test Case: check it is possible to delete an uploaded to root file");

        FilesProfile filesProfile = getFileToDeleteProfile();

        FilesPage filesPage = openOverviewPage().openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();

        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(filesProfile.getFileInRoot());
        filesAddFilesPage.uploadAllFiles();
        filesPage = openOverviewPage().openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filesProfile.getFileInRoot()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(filesProfile.getFileInRoot());
        uploadedFilePage = uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();
        filesPage = uploadedFilePage.deleteFile();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filesProfile.getFileInRoot()))
                .as("Link to uploaded file is NOT displayed inside root directory")
                .isFalse();
    }

    @Test(dependsOnMethods = {"successfulLogin", "createFirstLevelFolder"})
    public void filterByName() {
        printTestHeader("Test Case: check it is possible to filter folders and files by name");

        FilesProfile firstFilterProfile = getFirstFilterProfile();
        FilesProfile secondFilterProfile = getSecondFilterProfile();

        //upload files what should be in a filter result
        FilesPage filesPage = openOverviewPage().openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(firstFilterProfile.getFileInRoot());
        filesAddFilesPage.uploadAllFiles();
        filesPage = openOverviewPage().openFilesPage();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(firstFilterProfile.getFileInRoot()))
                .as("Link to uploaded file #1 is displayed inside root directory")
                .isTrue();

        filesPage = openOverviewPage().openFilesPage();
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(secondFilterProfile.getFileInRoot());
        filesAddFilesPage.uploadAllFiles();
        filesPage = openOverviewPage().openFilesPage();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(secondFilterProfile.getFileInRoot()))
                .as("Link to uploaded file #2 is displayed inside root directory")
                .isTrue();

        //create folders what should be in a filter result
        filesPage = filesPage.createFolder(firstFilterProfile.getFirstLevelFolder());

        SoftAssert.assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(firstFilterProfile.getFirstLevelFolder()))
                .as("Link to created folder #1 is displayed inside root directory")
                .isTrue();

        filesPage = filesPage.createFolder(secondFilterProfile.getFirstLevelFolder());

        SoftAssert.assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(secondFilterProfile.getFirstLevelFolder()))
                .as("Link to created folder #2 is displayed inside root directory")
                .isTrue();

        //filter phrase #1
        filesPage = filesPage.filterByName(getDictFirstFilterPhrase());

        SoftAssert.assertThat(
                filesPage.isCorrectSelectionByNameDisplayed(getDictFirstFilterPhrase()))
                .as("Correct selection is displayed: " + getDictFirstFilterPhrase())
                .isTrue();

        SoftAssert.assertThat(
                (filesPage.getNumberOfDisplayedItems() >= 2))
                .as("Number of displayed files and folders equals or more than 2")
                .isTrue();

        //filter phrase #2
        filesPage = filesPage.filterByName(getDictSecondFilterPhrase());

        SoftAssert.assertThat(
                filesPage.isCorrectSelectionByNameDisplayed(getDictSecondFilterPhrase()))
                .as("Correct selection is displayed: " + getDictSecondFilterPhrase())
                .isTrue();

        SoftAssert.assertThat(
                (filesPage.getNumberOfDisplayedItems() >= 2))
                .as("Number of displayed files and folders equals or more than 2")
                .isTrue();

        //filter common phrase
        filesPage = filesPage.filterByName(getDictCommonFilterPhrase());

        SoftAssert.assertThat(
                filesPage.isCorrectSelectionByNameDisplayed(getDictCommonFilterPhrase()))
                .as("Correct selection is displayed: " + getDictCommonFilterPhrase())
                .isTrue();

        SoftAssert.assertThat(
                (filesPage.getNumberOfDisplayedItems() >= 4))
                .as("Number of displayed files and folders equals or more than 4")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "createSecondLevelFolder", "createFirstLevelFolder"})
    public void breadcrumbsNavigation() {
        printTestHeader("Test Case: validate navigation via breadcrumbs");

        FilesProfile filesProfile = getMainFilesProfile();

        // open second level folder
        FilesPage filesPage = openOverviewPage().openFilesPage();
        filesPage = filesPage.openFolder(filesProfile.getFirstLevelFolder());
        filesPage = filesPage.openFolder(filesProfile.getSecondLevelFolder());

        assertThat(
                filesPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateExpectedBreadcrumbs(filesProfile.getFirstLevelFolder(), filesProfile.getSecondLevelFolder(), ""));

        // go to root directory
        filesPage = filesPage.clickBreadcrumbMyFiles();

        SoftAssert.assertThat(
                filesPage.isBreadcrumbDisplayed())
                .as("Breadcrumbs are displayed")
                .isFalse();

        SoftAssert.assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(filesProfile.getFirstLevelFolder()))
                .as("Link to first level folder is displayed")
                .isTrue();

        // open second level folder again
        filesPage = filesPage.openFolder(filesProfile.getFirstLevelFolder());
        filesPage = filesPage.openFolder(filesProfile.getSecondLevelFolder());

        // go to first level folder
        filesPage = filesPage.clickBreadcrumbFirstLevel();

        SoftAssert.assertThat(
                filesPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateExpectedBreadcrumbs(filesProfile.getFirstLevelFolder(), "", ""));

        SoftAssert.assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(filesProfile.getSecondLevelFolder()))
                .as("Link to second level folder is displayed")
                .isTrue();

        // go to root directory
        filesPage = filesPage.clickBreadcrumbMyFiles();

        SoftAssert.assertThat(
                filesPage.isBreadcrumbDisplayed())
                .as("Breadcrumbs are displayed")
                .isFalse();

        SoftAssert.assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(filesProfile.getFirstLevelFolder()))
                .as("Link to first level folder is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "uploadFileToRootDirectory"})
    public void downloadFile() {
        printTestHeader("Test Case: check it is possible to download a file");

        FilesProfile filesProfile = getMainFilesProfile();

        FilesPage filesPage = openOverviewPage().openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filesProfile.getFileInRoot()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(filesProfile.getFileInRoot());
        removeSameFileFromDownloads(filesProfile.getFileInRoot());
        uploadedFilePage = uploadedFilePage.downloadFile();

        SoftAssert.assertThat(
                uploadedFilePage.getFilePageTitleText())
                .as("Title of the page")
                .isEqualTo(filesProfile.getFileInRoot());

        SoftAssert.assertThat(
                isFileDownloaded(filesProfile.getFileInRoot()))
                .as("The file is downloaded")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "uploadFileToRootDirectory"})
    public void renameFile() {
        printTestHeader("Test Case: check it is possible to rename a file");

        FilesProfile filesProfile = getMainFilesProfile();

        FilesPage filesPage = openOverviewPage().openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filesProfile.getFileInRoot()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(filesProfile.getFileInRoot());
        uploadedFilePage = uploadedFilePage.renameFileOnFilePage(filesProfile);

        SoftAssert.assertThat(
                uploadedFilePage.getFilePageTitleText())
                .as("New Title of the page")
                .isEqualTo(filesProfile.getFileInRoot());

        filesPage = openOverviewPage().openFilesPage();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filesProfile.getFileInRoot()))
                .as("Link to renamed file is displayed inside root directory")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "uploadFileToRootDirectory"})
    public void addFileDescription() {
        printTestHeader("Test Case: check it is possible to add a file description");

        FilesProfile filesProfile = getMainFilesProfile();

        FilesPage filesPage = openOverviewPage().openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filesProfile.getFileInRoot()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(filesProfile.getFileInRoot());
        uploadedFilePage = uploadedFilePage.addFileDescription(filesProfile);

        SoftAssert.assertThat(
                uploadedFilePage.getUploadedFileDescriptionText())
                .as("New Description of the file")
                .isEqualTo(filesProfile.getFileInRootDescription());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "uploadFileToRootDirectory"})
    public void leaveComment() {
        printTestHeader("Test Case: check it is possible to write a comment");

        FilesProfile filesProfile = getMainFilesProfile();

        FilesPage filesPage = openOverviewPage().openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(filesProfile.getFileInRoot()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(filesProfile.getFileInRoot());
        uploadedFilePage = uploadedFilePage.leaveComment(filesProfile.getFileInRootComment());

        SoftAssert.assertThat(
                uploadedFilePage.getFilePageTitleText())
                .as("Title of the page")
                .isEqualTo(filesProfile.getFileInRoot());

        SoftAssert.assertThat(
                uploadedFilePage.getUploadedFileSavedCommentText())
                .as("Submitted comment text")
                .isEqualTo(filesProfile.getFileInRootComment());

        SoftAssert.assertAll();
    }


}
