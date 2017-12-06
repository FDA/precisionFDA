package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestUserData;
import precisionFDA.model.FileProfile;
import precisionFDA.model.FolderProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.files.*;
import ru.yandex.qatools.htmlelements.annotations.Name;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestFilesData.*;
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
        filesPage = filesAddFilesPage.openRootFilesPage();

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

        SoftAssert.assertAll();
    }

    @Test(priority = 1)
    public void checkPrivateFileAccessByAnotherUser() {
        printTestHeader("Test Case: verify the just uploaded file access by another user");

        FileProfile fileProfile = getPublishFileProfile();
        UserProfile user = TestUserData.getAnotherTestUser();

        logoutFromAll();
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

        SoftAssert.assertAll();
    }

    @Test(priority = 3)
    public void publishFileByAuthor() {
        printTestHeader("Test Case: verify the just uploaded file can be published by author");

        FileProfile fileProfile = getPublishFileProfile();
        UserProfile user = TestUserData.getTestUser();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        FilesPage filesPage = openOverviewPage().openFilesPage();
        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());

        FilesPublishPage publishPage = uploadedFilePage.clickPublishToPublic();

        assertThat(
                publishPage.getFileToPublishNameText())
                .as("Displayed file name on Publish page")
                .isEqualTo(fileProfile.getFileName());

        uploadedFilePage = publishPage.clickPublishObjects();

        assertThat(
                uploadedFilePage.isAccessPublic())
                .as("Access is public")
                .isTrue();

        filesPage = uploadedFilePage.openRootFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed inside root directory")
                .isTrue();

        filesPage = filesPage.openFilesExplorePage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileProfile.getFileName()))
                .as("Link to uploaded file is displayed in Explore list for the author")
                .isTrue();
    }

    @Test(priority = 4)
    public void checkPublicFileAccessByAnotherUser() {
        printTestHeader("Test Case: verify the published file access by another user");

        FileProfile fileProfile = getPublishFileProfile();
        UserProfile user = TestUserData.getAnotherTestUser();

        logoutFromAll();
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

        SoftAssert.assertThat(
                filesPage.isItemCheckboxDisplayed(fileProfile.getFileName()))
                .as("Input checkbox is displayed for the file")
                .isFalse();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(fileProfile.getFileName());

        SoftAssert.assertThat(
                uploadedFilePage.isAccessPublic())
                .as("Access is public")
                .isTrue();

        SoftAssert.assertAll();

        FilesAuthURLPage authURLPage = uploadedFilePage.clickAuthorizedURL();

        assertThat(
                authURLPage.isAuthorizedUrlDisplayed())
                .as("Authorized url is displayed")
                .isTrue();
    }

    @Test(priority = 5)
    public void publicItemsFromFilesGrid() {
        printTestHeader("Test Case: check it is possible to public folder and files on Files grid");

        FileProfile fileInRootOne = getPublishGridFileInRootOne();
        FileProfile fileInRootTwo = getPublishGridFileInRootTwo();
        FileProfile firstFile = getPublishGridFirstFile();
        FileProfile secondFile = getPublishGridSecondFile();
        FileProfile thirdFile = getPublishGridThirdFile();
        FolderProfile folder = getPublishGridFolder();

        UserProfile user = TestUserData.getTestUser();

        logoutFromAll();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        FilesPage filesPage = openOverviewPage().openFilesPage();

        // upload a file in root one
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(fileInRootOne.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();

        // upload a file in root two
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(fileInRootTwo.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();

        // create folder
        filesPage = filesPage.createFolder(folder.getFolderName());
        filesPage = filesPage.openFolder(folder.getFolderName());

        // upload file #1 to the folder
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(firstFile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage().openFolder(folder.getFolderName());

        // upload file #2 to the folder
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(secondFile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage().openFolder(folder.getFolderName());

        // upload file #3 to the folder
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(thirdFile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage().openFolder(folder.getFolderName());

        // publish file #1
        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(firstFile.getFileName());
        FilesPublishPage publishPage = uploadedFilePage.clickPublishToPublic();
        uploadedFilePage = publishPage.clickPublishObjects();

        // publish file in root one
        filesPage = uploadedFilePage.openRootFilesPage();
        uploadedFilePage = filesPage.openUploadedFile(fileInRootOne.getFileName());
        publishPage = uploadedFilePage.clickPublishToPublic();
        uploadedFilePage = publishPage.clickPublishObjects();

        // select the folder and files in root one and file in root two
        filesPage = uploadedFilePage.openRootFilesPage();
        filesPage.selectItem(folder.getFolderName());
        filesPage.selectItem(fileInRootOne.getFileName());
        filesPage.selectItem(fileInRootTwo.getFileName());

        filesPage.clickPublishSelected();

        SoftAssert.assertThat(
                filesPage.isItemInPublishDialogDisplayed(secondFile.getFileName()))
                .as("Second file is displayed on the Publish dialog")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.isItemInPublishDialogDisplayed(secondFile.getFileName()))
                .as("Third file is displayed on the Publish dialog")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.isItemInPublishDialogDisplayed(fileInRootTwo.getFileName()))
                .as("File in root two is displayed on the Publish dialog")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.isItemInPublishDialogDisplayed(fileInRootOne.getFileName()))
                .as("File in root one is NOT displayed on the Publish dialog")
                .isFalse();

        SoftAssert.assertThat(
                filesPage.isItemInPublishDialogDisplayed(firstFile.getFileName()))
                .as("First file is NOT displayed on the Publish dialog")
                .isFalse();

        filesPage.clickPublishOnDialog();

        filesPage = filesPage.openFilesExplorePage();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileInRootOne.getFileName()))
                .as("Link to file in root one is displayed on Explore page")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(fileInRootTwo.getFileName()))
                .as("Link to file in root teo is displayed on Explore page")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(firstFile.getFileName()))
                .as("Link to first is displayed on Explore page")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(secondFile.getFileName()))
                .as("Link to second is displayed on Explore page")
                .isTrue();

        SoftAssert.assertThat(
                filesPage.isLinkToUploadedFileDisplayed(thirdFile.getFileName()))
                .as("Link to third is displayed on Explore page")
                .isTrue();

        logoutFromAll();

        SoftAssert.assertAll();
    }
}
