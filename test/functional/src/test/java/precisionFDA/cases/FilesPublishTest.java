package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestUserData;
import precisionFDA.model.FileProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.files.FilesAddFilesPage;
import precisionFDA.pages.files.FilesPage;
import precisionFDA.pages.files.FilesPublishPage;
import precisionFDA.pages.files.UploadedFilePage;
import ru.yandex.qatools.htmlelements.annotations.Name;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestFilesData.getPublishFileProfile;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Files publish test suite")
public class FilesPublishTest extends AbstractTest {

    @Test(priority = 0)
    public void uploadPrivateFileCheckAccessByAuthor() {
        printTestHeader("Test Case: upload new file and verify access");

        FileProfile fileProfile = getPublishFileProfile();
        UserProfile user = TestUserData.getTestUser();

        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        FilesPage filesPage = openOverviewPage().openFilesPage();

        assertThat(
                filesPage.isAddFilesButtonDisplayed())
                .as("Add Files button is displayed")
                .isTrue();

        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(fileProfile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = openOverviewPage().openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        filesPage = filesPage.openFilesExplorePage();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is NOT displayed in Explore Tab")
                .isFalse();

        filesPage = openOverviewPage().openFilesPage();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());

        SoftAssert.assertThat(
                uploadedFilePage.isAccessPrivate())
                .as("Access is private")
                .isTrue();

        logoutFromAll();

        SoftAssert.assertAll();
    }

    @Test(priority = 1)
    public void checkPrivateFileAccessByAnotherUser() {
        printTestHeader("Test Case: verify the just uploaded file access by another user");

        FileProfile fileProfile = getPublishFileProfile();
        UserProfile user = TestUserData.getAnotherTestUser();

        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        FilesPage filesPage = openOverviewPage().openFilesPage();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to the uploaded private file is NOT displayed on My Files page for another user")
                .isFalse();

        filesPage = filesPage.openFilesExplorePage();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to the uploaded private file is NOT displayed in Explore Tab for another user")
                .isFalse();

        logoutFromAll();

        SoftAssert.assertAll();
    }

    @Test(priority = 3)
    public void publishFileByAuthor() {
        printTestHeader("Test Case: verify the just uploaded file can be published by author");

        FileProfile fileProfile = getPublishFileProfile();
        UserProfile user = TestUserData.getTestUser();

        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        FilesPage filesPage = openOverviewPage().openFilesPage();
        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());

        FilesPublishPage publishPage = uploadedFilePage.clickPublish();

        assertThat(
                publishPage.getFileToPublishNameText())
                .as("Displayed file name on Publish page")
                .isEqualTo(fileProfile.getFileName());

        uploadedFilePage = publishPage.clickPublishObjects();

        assertThat(
                uploadedFilePage.isAccessPublic())
                .as("Access is public")
                .isTrue();

        filesPage = openOverviewPage().openFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        filesPage = filesPage.openFilesExplorePage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed in Explore list for the author")
                .isTrue();

        logoutFromAll();
    }

    @Test(priority = 4)
    public void checkPublicFileAccessByAnotherUser() {
        printTestHeader("Test Case: verify the published file access by another user");

        FileProfile fileProfile = getPublishFileProfile();
        UserProfile user = TestUserData.getAnotherTestUser();

        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        FilesPage filesPage = openOverviewPage().openFilesPage();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to published file is NOT displayed on My Files page")
                .isFalse();

        filesPage = filesPage.openFilesExplorePage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to published file is now displayed on Explore page")
                .isTrue();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());

        SoftAssert.assertThat(
                uploadedFilePage.isAccessPublic())
                .as("Access is public")
                .isTrue();

        logoutFromAll();

        SoftAssert.assertAll();
    }
}
