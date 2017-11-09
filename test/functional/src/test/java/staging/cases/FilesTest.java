package staging.cases;

import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import staging.data.TestUserData;
import staging.model.FilesProfile;
import staging.model.User;
import staging.pages.files.FilesAddFilesPage;
import staging.pages.files.FilesPage;
import staging.pages.files.UploadedFilePage;
import staging.pages.overview.OverviewPage;

import static org.assertj.core.api.Assertions.assertThat;
import static staging.data.TestFilesData.getMainProfile;
import static staging.utils.Utils.generateExpectedBreadcrumbs;

@Name("Files test suite")
public class FilesTest extends AbstractTest {

    @Test(priority = 0)
    public void successfulLogin() {
        printTestHeader(" -- Successful Login -- ");

        User user = TestUserData.getTestUser();

        OverviewPage overviewPage = openLoginPage(user).correctLogin(user).grantAccess();

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

    @Test(priority = 1)
    public void uploadFileToRootDirectory() {
        printTestHeader("Test Case: check it is possible to upload text file to the root directory");

        FilesProfile filesProfile = getMainProfile();

        FilesPage filesPage = getCommonPage().openFilesPage();
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

        filesPage = getCommonPage().openFilesPage();

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

    @Test(priority = 2)
    public void createFirstLevelFolder() {
        printTestHeader("Test Case: check it is possible to create a folder in the root directory");

        FilesProfile filesProfile = getMainProfile();

        FilesPage filesPage = getCommonPage().openFilesPage();
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

    @Test(priority = 3)
    public void uploadFileToFirstLevelFolder() {
        printTestHeader("Test Case: check it is possible to upload png file to the first level folder");

        FilesProfile filesProfile = getMainProfile();

        FilesPage filesPage = getCommonPage().openFilesPage();
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

        filesPage = getCommonPage().openFilesPage().openFolder(filesProfile.getFirstLevelFolder());

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

    @Test(priority = 4)
    public void createSecondLevelFolder() {
        printTestHeader("Test Case: check it is possible to create a folder in the first level folder");

        FilesProfile filesProfile = getMainProfile();

        FilesPage filesPage = getCommonPage().openFilesPage();
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

}
