package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestUserData;
import precisionFDA.model.FileProfile;
import precisionFDA.model.FolderProfile;
import precisionFDA.model.SpaceProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.files.FilesAddFilesPage;
import precisionFDA.pages.files.FilesPage;
import precisionFDA.pages.files.FilesPublishPage;
import precisionFDA.pages.files.UploadedFilePage;
import precisionFDA.pages.overview.OverviewPage;
import precisionFDA.pages.spaces.EditSpacePage;
import precisionFDA.pages.spaces.SpaceDetailsPage;
import precisionFDA.pages.spaces.SpacesPage;
import ru.yandex.qatools.htmlelements.annotations.Name;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestDict.getDictActive;
import static precisionFDA.data.TestDict.getDictUnactivated;
import static precisionFDA.data.TestFilesData.*;
import static precisionFDA.data.TestSpacesData.getMainSpaceProfile;
import static precisionFDA.utils.Utils.generateBreadcrumbsSpaces;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Spaces management test suite")
public class SpacesTest extends AbstractTest {

    @Test
    public void loginAsAdminUser() {
        printTestHeader(" -- Successful Login as an admin user -- ");

        UserProfile user = TestUserData.getAdminUser();

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

    @Test(dependsOnMethods = {"loginAsAdminUser"}, priority = 0)
    public void createAndSaveSpace() {
        printTestHeader("Test Case: create and save a space");

        SpaceProfile spaceProfile = getMainSpaceProfile();

        SpacesPage spacesPage = openSpacesPage();
        EditSpacePage editSpacePage = spacesPage.clickProvisionSpace();
        editSpacePage.fillSpaceForm(spaceProfile);
        spacesPage = editSpacePage.clickCreate();

        SoftAssert.assertThat(
                spacesPage.isProvisionButtonDisplayed())
                .as("Provision Space button is displayed")
                .isTrue();

        SoftAssert.assertThat(
                spacesPage.isCreatedSpaceNameDisplayed(spaceProfile.getSpaceName()))
                .as("Created space name is displayed")
                .isTrue();

        SoftAssert.assertThat(
                spacesPage.isCreatedSpaceDescrDisplayed(spaceProfile.getSpaceDescription()))
                .as("Created space description is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"createAndSaveSpace"}, priority = 1)
    public void activateSpaceByHostLead() {
        printTestHeader("Test Case: activate space by host lead");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        UserProfile user = TestUserData.getTestUserOne();

        logoutFromAll();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        SpacesPage spacesPage = overviewPage.openSpacesPage();

        assertThat(
                spacesPage.getSpaceStatusOnGrid(spaceProfile.getSpaceName()))
                .as("Status is Unactivated")
                .isEqualToIgnoringCase(getDictUnactivated());

        SpaceDetailsPage spaceDetailsPage = spacesPage.openSpace(spaceProfile.getSpaceName());

        assertThat(
                spaceDetailsPage.isAcceptByHostLeadDisplayed())
                .as("'Accept' link for Host Lead is displayed")
                .isTrue();

        assertThat(
                spaceDetailsPage.isAcceptByGuestLeadDisplayed())
                .as("'Accept' link for Guest Lead is displayed")
                .isFalse();

        spaceDetailsPage = spaceDetailsPage.acceptByHostLead();

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByHostLeadDisplayed())
                .as("'Accept' link for Host Lead is displayed")
                .isFalse();

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByGuestLeadDisplayed())
                .as("'Accept' link for Guest Lead is displayed")
                .isFalse();

        SoftAssert.assertThat(
                spaceDetailsPage.isMembersTabLinkDisplayed())
                .as("Members Tab is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"createAndSaveSpace"}, priority = 2)
    public void activateSpaceByGuestLead() {
        printTestHeader("Test Case: activate space by guest lead");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        UserProfile user = TestUserData.getTestUserTwo();

        logoutFromAll();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        SpacesPage spacesPage = overviewPage.openSpacesPage();

        assertThat(
                spacesPage.getSpaceStatusOnGrid(spaceProfile.getSpaceName()))
                .as("Status is Unactivated")
                .isEqualToIgnoringCase(getDictUnactivated());

        SpaceDetailsPage spaceDetailsPage = spacesPage.openSpace(spaceProfile.getSpaceName());

        assertThat(
                spaceDetailsPage.isAcceptByGuestLeadDisplayed())
                .as("'Accept' link for Guest Lead is displayed")
                .isTrue();

        assertThat(
                spaceDetailsPage.isAcceptByHostLeadDisplayed())
                .as("'Accept' link for Host Lead is displayed")
                .isFalse();

        spaceDetailsPage = spaceDetailsPage.acceptByGuestLead();

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByHostLeadDisplayed())
                .as("'Accept' link for Host Lead is displayed")
                .isFalse();

        SoftAssert.assertThat(
                spaceDetailsPage.isAcceptByGuestLeadDisplayed())
                .as("'Accept' link for Guest Lead is displayed")
                .isFalse();

        SoftAssert.assertThat(
                spaceDetailsPage.isMembersTabLinkDisplayed())
                .as("Members Tab is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"createAndSaveSpace"}, priority = 3)
    public void createFolderByHostLead() {
        printTestHeader("Test Case: create a folder by host lead");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        UserProfile user = TestUserData.getTestUserOne();
        FolderProfile spaceFolder = getMainSpaceFolder();

        logoutFromAll();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        SpacesPage spacesPage = overviewPage.openSpacesPage();

        assertThat(
                spacesPage.getSpaceStatusOnGrid(spaceProfile.getSpaceName()))
                .as("Status is Active")
                .isEqualToIgnoringCase(getDictActive());

        SpaceDetailsPage spaceDetailsPage = spacesPage.openSpace(spaceProfile.getSpaceName());

        assertThat(
                spaceDetailsPage.isAcceptByHostLeadDisplayed())
                .as("'Accept' link for Host Lead is displayed")
                .isFalse();

        assertThat(
                spaceDetailsPage.isAcceptByGuestLeadDisplayed())
                .as("'Accept' link for Guest Lead is displayed")
                .isFalse();

        spaceDetailsPage = spaceDetailsPage.createFolder(spaceFolder.getFolderName());

        assertThat(
                spaceDetailsPage.isLinkToCreatedFolderDisplayed(spaceFolder.getFolderName()))
                .as("Created folder is displayed")
                .isTrue();

        spaceDetailsPage = spaceDetailsPage.openFolder(spaceFolder.getFolderName());

        assertThat(
                spaceDetailsPage.isBreadcrumbDisplayed())
                .as("Breadcrumbs are displayed")
                .isTrue();

        assertThat(
                spaceDetailsPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateBreadcrumbsSpaces(spaceFolder.getFolderName(), "", ""));

        spaceDetailsPage = spaceDetailsPage.clickBreadcrumbSpaceFiles();

        assertThat(
                spaceDetailsPage.isLinkToCreatedFolderDisplayed(spaceFolder.getFolderName()))
                .as("Created folder is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"createAndSaveSpace"}, priority = 4)
    public void addFileByHostLead() {
        printTestHeader("Test Case: add a file by host lead");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        FileProfile spaceFile = getMainSpaceFile();

        FilesPage filesPage = openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(spaceFile.getFileName());
        FilesAddFilesPage addFilesPage = filesAddFilesPage.uploadAllFiles();
        UploadedFilePage uploadedFilePage = addFilesPage.openUploadedFile(spaceFile.getFileName());
        uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();

        SpaceDetailsPage spaceDetailsPage = openSpacesPage().openSpace(spaceProfile.getSpaceName());
        spaceDetailsPage.clickMoveDataToSpace();
        spaceDetailsPage = spaceDetailsPage.selectFileOnMoveToSpaceDialog(spaceFile.getFileName());

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile.getFileName()))
                .as("Added file is displayed")
                .isTrue();

        filesPage = openFilesPage();
        filesPage = filesPage.filterByName(spaceFile.getFileName());

        assertThat(
                filesPage.getLinkToSpaceText(spaceFile.getFileName()))
                .as("Link to space text")
                .isEqualTo(spaceProfile.getSpaceName());

        spaceDetailsPage = filesPage.clickOnSpaceLink(spaceFile.getFileName());

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile.getFileName()))
                .as("Added file is displayed in the space")
                .isTrue();
    }

    @Test(dependsOnMethods = {"createAndSaveSpace"}, priority = 5)
    public void checkVisibilityByGuest() {
        printTestHeader("Test Case: verify Guest User can view create by Host User file and folder");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        FileProfile spaceFile = getMainSpaceFile();
        FolderProfile spaceFolder = getMainSpaceFolder();
        UserProfile user = TestUserData.getTestUserTwo();

        logoutFromAll();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        SpacesPage spacesPage = overviewPage.openSpacesPage();
        SpaceDetailsPage spaceDetailsPage = spacesPage.openSpace(spaceProfile.getSpaceName());

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile.getFileName()))
                .as("Added by Host file is displayed")
                .isTrue();

        assertThat(
                spaceDetailsPage.isLinkToCreatedFolderDisplayed(spaceFolder.getFolderName()))
                .as("Created by Host folder is displayed")
                .isTrue();

        UploadedFilePage uploadedFilePage = spaceDetailsPage.openFile(spaceFile.getFileName());

        assertThat(
                uploadedFilePage.isPageTitleCorrect(spaceFile.getFileName()))
                .as("Page title is correct one")
                .isTrue();
    }

    @Test(dependsOnMethods = {"createAndSaveSpace"}, priority = 6)
    public void renameFile() {
        printTestHeader("Test Case: rename a file");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        FileProfile spaceFile = getToEditSpaceFile();
        UserProfile user = TestUserData.getTestUserOne();

        logoutFromAll();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();

        FilesPage filesPage = overviewPage.openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(spaceFile.getFileName());
        FilesAddFilesPage addFilesPage = filesAddFilesPage.uploadAllFiles();
        UploadedFilePage uploadedFilePage = addFilesPage.openUploadedFile(spaceFile.getFileName());
        uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();

        SpaceDetailsPage spaceDetailsPage = openSpacesPage().openSpace(spaceProfile.getSpaceName());
        spaceDetailsPage.clickMoveDataToSpace();
        spaceDetailsPage = spaceDetailsPage.selectFileOnMoveToSpaceDialog(spaceFile.getFileName());

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile.getFileName()))
                .as("Added file is displayed")
                .isTrue();

        spaceDetailsPage.selectItem(spaceFile.getFileName());
        spaceDetailsPage.clickDropDownEdit();
        spaceDetailsPage = spaceDetailsPage.renameOnGrid(spaceFile);

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile.getFileName()))
                .as("The file with updated name is displayed")
                .isTrue();

        filesPage = openFilesPage();
        filesPage = filesPage.filterByName(spaceFile.getFileName());

        assertThat(
                spaceDetailsPage.isDangerNotificationDisplayed())
                .as("Danger notification is displayed")
                .isFalse();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(spaceFile.getFileName()))
                .as("Renamed file is displayed on Files page")
                .isTrue();
    }

    @Test(dependsOnMethods = {"createAndSaveSpace"}, priority = 7)
    public void renameFolder() {
        printTestHeader("Test Case: rename a folder");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        FolderProfile spaceFolder = getToEditSpaceFolder();

        SpaceDetailsPage spaceDetailsPage = openSpacesPage().openSpace(spaceProfile.getSpaceName());
        spaceDetailsPage = spaceDetailsPage.createFolder(spaceFolder.getFolderName());

        assertThat(
                spaceDetailsPage.isLinkToCreatedFolderDisplayed(spaceFolder.getFolderName()))
                .as("Created folder is displayed")
                .isTrue();

        spaceDetailsPage.selectItem(spaceFolder.getFolderName());
        spaceDetailsPage.clickDropDownEdit();
        spaceDetailsPage = spaceDetailsPage.renameOnGrid(spaceFolder);

        assertThat(
                spaceDetailsPage.isDangerNotificationDisplayed())
                .as("Danger notification is displayed")
                .isFalse();

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFolder.getFolderName()))
                .as("The folder with updated name is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"createAndSaveSpace"}, priority = 8)
    public void moveFile() {
        printTestHeader("Test Case: move a file to a folder");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        FolderProfile spaceFolder = getToMoveSpaceFolder();
        FileProfile spaceFile = getToMoveSpaceFile();

        FilesPage filesPage = openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(spaceFile.getFileName());
        FilesAddFilesPage addFilesPage = filesAddFilesPage.uploadAllFiles();
        UploadedFilePage uploadedFilePage = addFilesPage.openUploadedFile(spaceFile.getFileName());
        uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();

        SpaceDetailsPage spaceDetailsPage = openSpacesPage().openSpace(spaceProfile.getSpaceName());
        spaceDetailsPage.clickMoveDataToSpace();
        spaceDetailsPage = spaceDetailsPage.selectFileOnMoveToSpaceDialog(spaceFile.getFileName());

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile.getFileName()))
                .as("Added file is displayed")
                .isTrue();

        spaceDetailsPage = spaceDetailsPage.createFolder(spaceFolder.getFolderName());

        assertThat(
                spaceDetailsPage.isLinkToCreatedFolderDisplayed(spaceFolder.getFolderName()))
                .as("Created folder is displayed")
                .isTrue();

        spaceDetailsPage.selectItem(spaceFile.getFileName());
        spaceDetailsPage.clickDropDownEdit();
        spaceDetailsPage.clickMoveSelected();
        spaceDetailsPage.clickTreeItemOnMoveDialog(spaceFolder.getFolderName());
        spaceDetailsPage = spaceDetailsPage.clickMoveHere();

        assertThat(
                spaceDetailsPage.isBreadcrumbDisplayed())
                .as("Breadcrumbs are displayed")
                .isTrue();

        assertThat(
                spaceDetailsPage.getDisplayedBreadcrumbsText())
                .as("Breadcrumbs")
                .isEqualTo(generateBreadcrumbsSpaces(spaceFolder.getFolderName(), "", ""));

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile.getFileName()))
                .as("Moved file is displayed inside the folder")
                .isTrue();

        assertThat(
                spaceDetailsPage.isDangerNotificationDisplayed())
                .as("Danger notification is displayed")
                .isFalse();

        spaceDetailsPage = spaceDetailsPage.clickBreadcrumbSpaceFiles();

        assertThat(
                spaceDetailsPage.isLinkToCreatedFolderDisplayed(spaceFolder.getFolderName()))
                .as("Folder is displayed in root")
                .isTrue();

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile.getFileName()))
                .as("Moved file is displayed in root")
                .isFalse();
    }

    @Test(dependsOnMethods = {"createAndSaveSpace"}, priority = 9)
    public void deleteFolderAndFiles() {
        printTestHeader("Test Case: delete folder and files");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        FolderProfile spaceFolder = getToDeleteSpaceFolder();
        FileProfile spaceFile1 = getToDeleteSpaceFile();
        FileProfile spaceFile2 = getToDeleteSpaceFileSecond();

        FilesPage filesPage = openFilesPage();

        // upload test file 1
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(spaceFile1.getFileName());
        filesPage = filesAddFilesPage.uploadAllFiles().openRootFilesPage();

        // upload test file 2
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(spaceFile2.getFileName());
        FilesAddFilesPage addFilesPage = filesAddFilesPage.uploadAllFiles();
        UploadedFilePage uploadedFilePage = addFilesPage.openUploadedFile(spaceFile2.getFileName());
        uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();

        // add file to space
        SpaceDetailsPage spaceDetailsPage = openSpacesPage().openSpace(spaceProfile.getSpaceName());
        spaceDetailsPage.clickMoveDataToSpace();
        spaceDetailsPage = spaceDetailsPage.selectFileOnMoveToSpaceDialog(spaceFile1.getFileName());
        spaceDetailsPage.clickMoveDataToSpace();
        spaceDetailsPage = spaceDetailsPage.selectFileOnMoveToSpaceDialog(spaceFile2.getFileName());

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile1.getFileName()))
                .as("Added file1 is displayed")
                .isTrue();

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile2.getFileName()))
                .as("Added file2 is displayed")
                .isTrue();

        // create folder
        spaceDetailsPage = spaceDetailsPage.createFolder(spaceFolder.getFolderName());

        assertThat(
                spaceDetailsPage.isLinkToCreatedFolderDisplayed(spaceFolder.getFolderName()))
                .as("Created folder is displayed")
                .isTrue();

        // move file2 to the folder
        spaceDetailsPage.selectItem(spaceFile2.getFileName());
        spaceDetailsPage.clickDropDownEdit();
        spaceDetailsPage.clickMoveSelected();
        spaceDetailsPage.clickTreeItemOnMoveDialog(spaceFolder.getFolderName());
        spaceDetailsPage = spaceDetailsPage.clickMoveHere();
        spaceDetailsPage = spaceDetailsPage.clickBreadcrumbSpaceFiles();

        // select file1 and folder and delete
        spaceDetailsPage.selectItem(spaceFolder.getFolderName());
        spaceDetailsPage.selectItem(spaceFile1.getFileName());
        spaceDetailsPage.clickDropDownEdit();
        spaceDetailsPage.clickDeleteSelected();

        assertThat(
                spaceDetailsPage.isItemInDeleteDialogDisplayed(spaceFile1.getFileName()))
                .as("Selected to delete item is displayed in the confirmation dialog: " + spaceFile1.getFileName())
                .isTrue();

        assertThat(
                spaceDetailsPage.isItemInDeleteDialogDisplayed(spaceFile2.getFileName()))
                .as("Selected to delete item is displayed in the confirmation dialog: " + spaceFile2.getFileName())
                .isTrue();

        assertThat(
                spaceDetailsPage.isItemInDeleteDialogDisplayed(spaceFolder.getFolderName()))
                .as("Selected to delete item is displayed in the confirmation dialog: " + spaceFolder.getFolderName())
                .isTrue();

        assertThat(
                spaceDetailsPage.getNumberOfItemsToDelete() == 3)
                .as("number of displayed items at the confirmation dialog == 3")
                .isTrue();

        spaceDetailsPage = spaceDetailsPage.clickDeleteOnDialog();

        assertThat(
                spaceDetailsPage.isDangerNotificationDisplayed())
                .as("Danger notification is displayed")
                .isFalse();

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile1.getFileName()))
                .as("Deleted file1 is displayed")
                .isFalse();

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile2.getFileName()))
                .as("Deleted file2 is displayed")
                .isFalse();

        assertThat(
                spaceDetailsPage.isLinkToCreatedFolderDisplayed(spaceFolder.getFolderName()))
                .as("Deleted folder is displayed")
                .isFalse();

        filesPage = openFilesPage();

        filesPage.filterByName(spaceFile1.getFileName());

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile1.getFileName()))
                .as("Deleted file is displayed")
                .isFalse();

        filesPage.filterByName(spaceFile2.getFileName());

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile2.getFileName()))
                .as("Deleted file is displayed")
                .isFalse();
    }

    @Test(dependsOnMethods = {"createAndSaveSpace"}, priority = 10)
    public void publishFiles() {
        printTestHeader("Test Case: publish files");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        FolderProfile spaceFolder = getToPublishSpaceFolder();
        FileProfile spaceFile1 = getToPublishSpaceFile();
        FileProfile spaceFile2 = getToPublishSpaceFileSecond();

        FilesPage filesPage = openFilesPage();

        // upload test file 1
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(spaceFile1.getFileName());
        filesPage = filesAddFilesPage.uploadAllFiles().openRootFilesPage();

        // upload test file 2
        filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(spaceFile2.getFileName());
        FilesAddFilesPage addFilesPage = filesAddFilesPage.uploadAllFiles();
        UploadedFilePage uploadedFilePage = addFilesPage.openUploadedFile(spaceFile2.getFileName());
        uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();

        // add file to space
        SpaceDetailsPage spaceDetailsPage = openSpacesPage().openSpace(spaceProfile.getSpaceName());
        spaceDetailsPage.clickMoveDataToSpace();
        spaceDetailsPage = spaceDetailsPage.selectFileOnMoveToSpaceDialog(spaceFile1.getFileName());
        spaceDetailsPage.clickMoveDataToSpace();
        spaceDetailsPage = spaceDetailsPage.selectFileOnMoveToSpaceDialog(spaceFile2.getFileName());

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile1.getFileName()))
                .as("Added file1 is displayed")
                .isTrue();

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile2.getFileName()))
                .as("Added file2 is displayed")
                .isTrue();

        // create folder
        spaceDetailsPage = spaceDetailsPage.createFolder(spaceFolder.getFolderName());

        assertThat(
                spaceDetailsPage.isLinkToCreatedFolderDisplayed(spaceFolder.getFolderName()))
                .as("Created folder is displayed")
                .isTrue();

        // move file2 to the folder
        spaceDetailsPage.selectItem(spaceFile2.getFileName());
        spaceDetailsPage.clickDropDownEdit();
        spaceDetailsPage.clickMoveSelected();
        spaceDetailsPage.clickTreeItemOnMoveDialog(spaceFolder.getFolderName());
        spaceDetailsPage = spaceDetailsPage.clickMoveHere();
        spaceDetailsPage = spaceDetailsPage.clickBreadcrumbSpaceFiles();

        // select file1 and folder and publish
        spaceDetailsPage.selectItem(spaceFolder.getFolderName());
        spaceDetailsPage.selectItem(spaceFile1.getFileName());
        spaceDetailsPage.clickDropDownEdit();
        spaceDetailsPage.clickPublishSelected();

        assertThat(
                spaceDetailsPage.isItemInPublishDialogDisplayed(spaceFile1.getFileName()))
                .as("File1 is displayed on the Publish dialog")
                .isTrue();

        assertThat(
                spaceDetailsPage.isItemInPublishDialogDisplayed(spaceFile1.getFileName()))
                .as("File2 is displayed on the Publish dialog")
                .isTrue();

        spaceDetailsPage.clickPublishOnDialog();

        assertThat(
                spaceDetailsPage.isLinkToCreatedFolderDisplayed(spaceFolder.getFolderName()))
                .as("Created folder is displayed")
                .isTrue();

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile1.getFileName()))
                .as("Added file1 is displayed")
                .isFalse();

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile2.getFileName()))
                .as("Added file2 is displayed")
                .isFalse();

        spaceDetailsPage = spaceDetailsPage.openFolder(spaceFolder.getFolderName());

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile2.getFileName()))
                .as("Added file2 is displayed")
                .isFalse();

        filesPage = openFilesPage().openFilesExplorePage();

        filesPage.filterByName(spaceFile1.getFileName());

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile1.getFileName()))
                .as("file1 is displayed in Explore tab")
                .isTrue();

        filesPage.filterByName(spaceFile2.getFileName());

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(spaceFile2.getFileName()))
                .as("file2 is displayed in Explore tab")
                .isTrue();
    }

    @Test(dependsOnMethods = {"loginAsAdminUser", "createAndSaveSpace"}, priority = 11)
    public void publishFileToSpaceFromFilesPage() {
        printTestHeader("Test Case: publish a file to a space from Files page");

        SpaceProfile spaceProfile = getMainSpaceProfile();
        FileProfile fileProfile = getPublishToSpaceFile();

        FilesPage filesPage = openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(fileProfile.getFileName());
        FilesAddFilesPage addFilesPage = filesAddFilesPage.uploadAllFiles();
        UploadedFilePage uploadedFilePage = addFilesPage.openUploadedFile(fileProfile.getFileName());
        uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();

        FilesPublishPage filesPublishPage = uploadedFilePage.clickPublishToSpace(spaceProfile.getSpaceName());
        uploadedFilePage = filesPublishPage.clickPublishObjects();

        assertThat(
                uploadedFilePage.isAccessSpace(spaceProfile.getSpaceName()))
                .as("Access is space " + spaceProfile.getSpaceName())
                .isTrue();

        SpaceDetailsPage spaceDetailsPage = openSpacesPage().openSpace(spaceProfile.getSpaceName());

        assertThat(
                spaceDetailsPage.isLinkToAddedFileDisplayed(fileProfile.getFileName()))
                .as("Published to space file is displayed")
                .isTrue();
    }

}