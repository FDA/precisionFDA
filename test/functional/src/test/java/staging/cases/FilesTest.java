package staging.cases;

import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import staging.data.TestUserData;
import staging.model.User;
import staging.pages.files.FilesAddFilesPage;
import staging.pages.files.FilesPage;
import staging.pages.files.UploadedFilePage;
import staging.pages.overview.OverviewPage;

import static org.assertj.core.api.Assertions.assertThat;
import static staging.data.TestRunData.generateTestFolderName;
import static staging.data.TestRunData.generateTestTextFileName;

@Name("Files test suite")
public class FilesTest extends AbstractTest {

    @Test
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

    @Test(dependsOnMethods = "successfulLogin")
    public void uploadFileToRootDirectory() {
        printTestHeader("Test Case: check it is possible to upload file to root directory");

        FilesPage filesPage = getCommonPage().openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();

        String textFileName = generateTestTextFileName();

        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(textFileName);

        SoftAssert.assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("text file name")
                .isEqualTo(textFileName);

        filesAddFilesPage = filesAddFilesPage.uploadAllFiles();

        SoftAssert.assertThat(
                filesAddFilesPage.isUploadsCompleteDisplayed())
                .as("Uploads complete is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesAddFilesPage.getFileToUploadPreviewNameText())
                .as("text file name")
                .isEqualTo(textFileName);

        filesPage = getCommonPage().openFilesPage();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(textFileName))
                .as("Link to uploaded file is displayed")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(textFileName);
        uploadedFilePage = uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();

        SoftAssert.assertThat(
                uploadedFilePage.isPageTitleCorrect(textFileName))
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
    public void createFolderInRoot() {
        printTestHeader("Test Case: check it is possible to create a folder in root directory");

        String testFolderName = generateTestFolderName();

        FilesPage filesPage = getCommonPage().openFilesPage();
        filesPage = filesPage.createFolder(testFolderName);

        assertThat(
                filesPage.isSuccessMessageDisplayed())
                .as("success alert is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.getSuccessMessageText())
                .as("success alert message")
                .contains(testFolderName);

        SoftAssert.assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(testFolderName))
                .as("Link to created folder is displayed")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.isLinkToCreatedFolderDisplayed(testFolderName))
                .as("Link to created folder is displayed")
                .isTrue();

        filesPage = filesPage.openFolder(testFolderName);

        SoftAssert.assertAll();
    }

}
