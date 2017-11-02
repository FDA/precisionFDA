package staging.cases;

import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import staging.model.User;
import staging.pages.files.FilesAddFilesPage;
import staging.pages.files.FilesPage;
import staging.pages.overview.OverviewPage;

import static staging.data.TestRunData.getTestTextTemplateFileName;
import static staging.utils.Utils.getTestTextFileName;

@Name("Files test suite")
public class FilesManagementTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader(" -- Successful Login -- ");

        User user = User.getTestUser();

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

        String textFileName = getTestTextFileName();

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

        SoftAssert.assertAll();
    }

}
