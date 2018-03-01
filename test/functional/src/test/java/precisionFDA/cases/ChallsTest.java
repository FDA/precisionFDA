package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestAppData;
import precisionFDA.data.TestUserData;
import precisionFDA.model.*;
import precisionFDA.pages.apps.AppsEditAppPage;
import precisionFDA.pages.apps.AppsPage;
import precisionFDA.pages.apps.AppsRelevantPage;
import precisionFDA.pages.apps.AppsSavedAppPage;
import precisionFDA.pages.challs.*;
import precisionFDA.pages.files.FilesAddFilesPage;
import precisionFDA.pages.files.FilesPage;
import precisionFDA.pages.files.FilesPublishPage;
import precisionFDA.pages.files.UploadedFilePage;
import precisionFDA.pages.overview.OverviewPage;
import precisionFDA.pages.profile.ProfilePage;
import ru.yandex.qatools.htmlelements.annotations.Name;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestChallsData.getExpectedChallDateTimeValue;
import static precisionFDA.data.TestChallsData.getMainChallProfile;
import static precisionFDA.data.TestFilesData.getMainNewChallEntryFile;
import static precisionFDA.data.TestFilesData.getSecondNewChallEntryFile;
import static precisionFDA.data.TestNewChallEntryData.getMainChallEntryProfile;
import static precisionFDA.data.TestNewChallEntryData.getSecondChallEntryProfile;
import static precisionFDA.data.TimeZonesData.getMoscowTimeZone;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Challenges test suite")
public class ChallsTest extends AbstractTest {

    @Test
    public void precondition() {
        printTestHeader("Precondition: login and set timezone");

        UserProfile user = TestUserData.getTestUserTwo();
        TimeZoneProfile timeZone = getMoscowTimeZone();

        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();

        ProfilePage profilePage = overviewPage.openProfilePage();
        profilePage.setTimeZone(timeZone);
    }

    @Test(priority = 0, dependsOnMethods = "precondition")
    public void createApp() {
        printTestHeader("Test Case: create app as a test user one");

        AppProfile appProfile = TestAppData.getChallAppProfile();

        AppsPage appsPage = openAppsPage();
        AppsEditAppPage appsEditAppPage = appsPage.openCreateAppPage();
        AppsSavedAppPage appsSavedAppPage = appsEditAppPage.fillAndSaveAppForChallenge(appProfile);

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appProfile.getInitNameText());
    }

    @Test(priority = 1, dependsOnMethods = "precondition")
    public void createChallenge() {
        printTestHeader("Test Case: create a challenge as admin and verify");

        UserProfile user = TestUserData.getAdminUser();
        ChallProfile challProfile = getMainChallProfile();
        TimeZoneProfile timeZone = getMoscowTimeZone();

        logoutFromAll();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();

        ProfilePage profilePage = overviewPage.openProfilePage();
        profilePage.setTimeZone(timeZone);

        ChallsPage challsPage = openChallsPage();

        assertThat(
                challsPage.isCreateNewChallLinkDisplayed())
                .as("Create new challenge link is displayed")
                .isTrue();

        ChallsEditChallPage editChallPage = challsPage.clickCreateNewChall();
        editChallPage.fillChallForm(challProfile);

        ChallsCreatedChallPage createdChallPage = editChallPage.clickCreate();

        assertThat(
                createdChallPage.getCreatedChallengeNameText())
                .as("Name of the created challenge")
                .contains(challProfile.getChallName());

        assertThat(
                createdChallPage.getCreatedChallengeDescrText())
                .as("Description of the created challenge")
                .isEqualTo(challProfile.getChallDescr());

        assertThat(
                createdChallPage.getStartsText())
                .as("Starts value")
                .isEqualTo(getExpectedChallDateTimeValue(challProfile.getChallStartsAt(), timeZone));

        assertThat(
                createdChallPage.getEndsText())
                .as("Ends value")
                .isEqualTo(getExpectedChallDateTimeValue(challProfile.getChallEndsAt(), timeZone));

        challsPage = overviewPage.openChallsPage();

        SoftAssert.assertThat(
                challsPage.isCreatedChallNameDisplayed(challProfile.getChallName()))
                .as("Correct Name of the created challenge is displayed on the Challenges page")
                .isTrue();

        SoftAssert.assertThat(
                challsPage.isCreatedChallDescriptionDisplayed(challProfile.getChallDescr()))
                .as("Correct Description of the created challenge is displayed on the Challenges page")
                .isTrue();

        SoftAssert.assertThat(
                challsPage.getCreatedChallStartsValue(challProfile))
                .as("Starts value on the Challenges page")
                .isEqualTo(getExpectedChallDateTimeValue(challProfile.getChallStartsAt(), timeZone));

        SoftAssert.assertThat(
                challsPage.getCreatedChallEndsValue(challProfile))
                .as("Ends value on the Challenges page")
                .isEqualTo(getExpectedChallDateTimeValue(challProfile.getChallEndsAt(), timeZone));

        SoftAssert.assertAll();
    }

    @Test(priority = 2, dependsOnMethods = { "createChallenge" })
    public void editChallengePage() {
        printTestHeader("Test Case: edit the created challenge page");

        ChallProfile challProfile = getMainChallProfile();

        ChallsPage challsPage = openChallsPage();
        ChallsCreatedChallPage createdChallPage = challsPage.viewChallenge(challProfile);
        ChallsEditChallengeInfo editChallengeInfo = createdChallPage.clickEditPage();
        editChallengeInfo = editChallengeInfo.clickChallengeInfo();

        assertThat(
                editChallengeInfo.isChallengeInfoLinkActivated())
                .as("Challenge info link is activated")
                .isTrue();

        assertThat(
                editChallengeInfo.isPencilIconDisplayed())
                .as("Pencil Icon is displayed")
                .isTrue();

        editChallengeInfo = editChallengeInfo.clickPencilIcon();

        assertThat(
                editChallengeInfo.isConfirmIconDisplayed())
                .as("Confirm Icon is displayed")
                .isTrue();

        editChallengeInfo.writeChallengeInfo(challProfile.getChallInfo());
        editChallengeInfo = editChallengeInfo.clickConfirmIcon();

        editChallengeInfo = editChallengeInfo.clickChallengeResults();

        assertThat(
                editChallengeInfo.isChallengeResultsLinkActivated())
                .as("Challenge results link is activated")
                .isTrue();

        assertThat(
                editChallengeInfo.isPencilIconDisplayed())
                .as("Pencil Icon is displayed")
                .isTrue();

        editChallengeInfo = editChallengeInfo.clickPencilIcon();

        assertThat(
                editChallengeInfo.isConfirmIconDisplayed())
                .as("Confirm Icon is displayed")
                .isTrue();

        editChallengeInfo.writeChallengeResults(challProfile.getChallResults());
        editChallengeInfo = editChallengeInfo.clickConfirmIcon();
        createdChallPage = editChallengeInfo.clickReturn();

        assertThat(
                createdChallPage.getIntroText())
                .as("Introduction text")
                .isEqualTo(challProfile.getChallInfo());
    }

    @Test(priority = 3, dependsOnMethods = { "createChallenge", "createApp" })
    public void assignToChallenge() {
        printTestHeader("Test Case: assign the created app to the created challenge");

        UserProfile user = TestUserData.getTestUserTwo();
        AppProfile appProfile = TestAppData.getChallAppProfile();
        ChallProfile challProfile = getMainChallProfile();

        logoutFromAll();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        AppsRelevantPage appsRelevantPage = overviewPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openAppFromMyAppsList(appProfile);

        assertThat(
                appsSavedAppPage.isAssignToChallengeDisplayed())
                .as("Assign to Challenge button is displayed")
                .isTrue();

        appsSavedAppPage = appsSavedAppPage.assignToChallenge(challProfile.getChallName());

        assertThat(
                appsSavedAppPage.isChallengeTagDisplayed(challProfile.getChallName()))
                .as("Challenge tag is displayed")
                .isTrue();
    }

    @Test(priority = 4, dependsOnMethods = { "createChallenge", "createApp" })
    public void setChallengeStatusToOpen() {
        printTestHeader("Test Case: set challenge status to open");

        UserProfile user = TestUserData.getAdminUser();
        ChallProfile challProfile = getMainChallProfile();

        logoutFromAll();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ChallsPage challsPage = overviewPage.openChallsPage();

        assertThat(
                challsPage.isCreatedChallNameDisplayed(challProfile.getChallName()))
                .as("The created challenge is displayed")
                .isTrue();

        ChallsCreatedChallPage createdChallPage = challsPage.viewChallenge(challProfile);
        ChallsEditChallPage editChallPage = createdChallPage.clickSettings();

        editChallPage.setOpenStatus();
        createdChallPage = editChallPage.clickUpdate();

        createdChallPage.waitUntilChallengeActive();

        assertThat(
                createdChallPage.isJoinChallengeButtonDisplayed())
                .as("Join Challenge button is displayed")
                .isTrue();
    }

    @Test(priority = 5, dependsOnMethods = { "createChallenge", "createApp" })
    public void joinChallenge() {
        printTestHeader("Test Case: join challenge");

        UserProfile user = TestUserData.getTestUserOne();
        ChallProfile challProfile = getMainChallProfile();

        logoutFromAll();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ChallsPage challsPage = overviewPage.openChallsPage();

        assertThat(
                challsPage.isCreatedChallNameDisplayed(challProfile.getChallName()))
                .as("The created challenge is displayed for test user two")
                .isTrue();

        ChallsCreatedChallPage createdChallPage = challsPage.viewChallenge(challProfile);

        assertThat(
                createdChallPage.getIntroText())
                .as("Introduction text")
                .isEqualTo(challProfile.getChallInfo());

        assertThat(
                createdChallPage.isJoinChallengeButtonDisplayed())
                .as("Join Challenge button is displayed")
                .isTrue();

        createdChallPage = createdChallPage.clickJoinChallenge();

        assertThat(
                createdChallPage.isSubmitEntryChallengeButtonDisplayed())
                .as("Submit Entry button is displayed for test user two")
                .isTrue();

    }

    @Test(priority = 6, dependsOnMethods = { "createChallenge", "createApp" })
    public void submitChallengeEntryByAnotherUser() {
        printTestHeader("Test Case: submit challenge entry by test user two");

        ChallProfile challProfile = getMainChallProfile();
        ChallEntryProfile challEntryProfile = getMainChallEntryProfile();
        FileProfile inputFileProfile = getMainNewChallEntryFile();

        FilesPage filesPage = openOverviewPage().openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(inputFileProfile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(inputFileProfile.getFileName());
        uploadedFilePage = uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();
        filesPage = uploadedFilePage.openRootFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(inputFileProfile.getFileName()))
                .as("File is uploaded: " + inputFileProfile.getFileName())
                .isTrue();

        ChallsPage challsPage = openChallsPage();
        ChallsCreatedChallPage createdChallPage = challsPage.viewChallenge(challProfile);

        assertThat(
                createdChallPage.isSubmitEntryChallengeButtonDisplayed())
                .as("Submit Entry button is displayed")
                .isTrue();

        ChallsNewSubmissionPage newSubmissionPage = createdChallPage.clickSubmitEntry();
        newSubmissionPage.fillNewChallSubmissionPage(challEntryProfile);
        newSubmissionPage.clickSelectFile1();

        assertThat(
                newSubmissionPage.isSelectInputPopupDisplayed())
                .as("Select input modal dialog is displayed")
                .isTrue();

        newSubmissionPage.clickFilesOnModal();

        assertThat(
                newSubmissionPage.isFileOnModalDisplayed(inputFileProfile.getFileName()))
                .as("Required file is displayed om the modal dialog")
                .isTrue();

        newSubmissionPage.selectFileInModal(inputFileProfile.getFileName());
        newSubmissionPage = newSubmissionPage.clickSelectOnModal();

        assertThat(
                newSubmissionPage.isFileAttached(inputFileProfile.getFileName()))
                .as("File is attached")
                .isTrue();

        FilesPublishPage publishPage = newSubmissionPage.clickSubmit();
        createdChallPage = publishPage.clickPublishObjectsViaEntrySubmit();

        assertThat(
                createdChallPage.isSubmittedInputFileLinkDisplayed(inputFileProfile.getFileName()))
                .as("Submitted input file link is displayed")
                .isTrue();
    }

    @Test(priority = 7, dependsOnMethods = { "createChallenge", "createApp" })
    public void submitChallengeEntryByAppAuthor() {
        printTestHeader("Test Case: submit challenge entry by the app author [test user one]");

        UserProfile user = TestUserData.getTestUserTwo();
        ChallProfile challProfile = getMainChallProfile();
        FileProfile inputFileProfile = getSecondNewChallEntryFile();
        ChallEntryProfile challEntryProfile = getSecondChallEntryProfile();

        logoutFromAll();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        FilesPage filesPage = overviewPage.openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(inputFileProfile.getFileName());
        filesAddFilesPage.uploadAllFiles();
        filesPage = filesAddFilesPage.openRootFilesPage();

        UploadedFilePage uploadedFilePage = filesPage.openUploadedFile(inputFileProfile.getFileName());
        uploadedFilePage = uploadedFilePage.waitUntilDownloadFileLinkIsDisplayed();
        filesPage = uploadedFilePage.openRootFilesPage();

        assertThat(
                filesPage.isLinkToUploadedFileDisplayed(inputFileProfile.getFileName()))
                .as("File is uploaded: " + inputFileProfile.getFileName())
                .isTrue();

        ChallsPage challsPage = openChallsPage();

        assertThat(
                challsPage.isCreatedChallNameDisplayed(challProfile.getChallName()))
                .as("The created challenge is displayed for the test user one")
                .isTrue();

        ChallsCreatedChallPage createdChallPage = challsPage.viewChallenge(challProfile);

        assertThat(
                createdChallPage.getIntroText())
                .as("Introduction text")
                .isEqualTo(challProfile.getChallInfo());

        assertThat(
                createdChallPage.isJoinChallengeButtonDisplayed())
                .as("Join Challenge button is displayed")
                .isTrue();

        createdChallPage = createdChallPage.clickJoinChallenge();

        assertThat(
                createdChallPage.isSubmitEntryChallengeButtonDisplayed())
                .as("Submit Entry button is displayed")
                .isTrue();

        ChallsNewSubmissionPage newSubmissionPage = createdChallPage.clickSubmitEntry();
        newSubmissionPage.fillNewChallSubmissionPage(challEntryProfile);
        newSubmissionPage.clickSelectFile1();

        assertThat(
                newSubmissionPage.isSelectInputPopupDisplayed())
                .as("Select input modal dialog is displayed")
                .isTrue();

        newSubmissionPage.clickFilesOnModal();

        assertThat(
                newSubmissionPage.isFileOnModalDisplayed(inputFileProfile.getFileName()))
                .as("Required file is displayed om the modal dialog")
                .isTrue();

        newSubmissionPage.selectFileInModal(inputFileProfile.getFileName());
        newSubmissionPage = newSubmissionPage.clickSelectOnModal();

        assertThat(
                newSubmissionPage.isFileAttached(inputFileProfile.getFileName()))
                .as("File is attached")
                .isTrue();

        FilesPublishPage publishPage = newSubmissionPage.clickSubmit();
        createdChallPage = publishPage.clickPublishObjectsViaEntrySubmit();

        assertThat(
                createdChallPage.isSubmittedInputFileLinkDisplayed(inputFileProfile.getFileName()))
                .as("Submitted input file link is displayed for the app author")
                .isTrue();
    }

    @Test(priority = 8, dependsOnMethods = { "createChallenge", "createApp" })
    public void verifyEntryStatusByAnotherUser() {
        printTestHeader("Test Case: verify entry status by test user two");

        UserProfile user = TestUserData.getTestUserOne();
        ChallProfile challProfile = getMainChallProfile();
        ChallEntryProfile challEntryProfile = getMainChallEntryProfile();
        FileProfile inputFileProfile = getMainNewChallEntryFile();

        logoutFromAll();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ChallsPage challsPage = overviewPage.openChallsPage();

        assertThat(
                challsPage.isCreatedChallNameDisplayed(challProfile.getChallName()))
                .as("The created challenge is displayed for test user two")
                .isTrue();

        ChallsCreatedChallPage createdChallPage = challsPage.viewChallenge(challProfile);
        createdChallPage = createdChallPage.clickMyEntries();

        SoftAssert.assertThat(
                createdChallPage.isSubmittedEntryNameDisplayed(challEntryProfile.getEntryName()))
                .as("submitted entry name is displayed on My Entries")
                .isTrue();

        SoftAssert.assertThat(
                createdChallPage.isSubmittedEntryInputFileNameDisplayed(inputFileProfile.getFileName(), challEntryProfile.getEntryName()))
                .as("submitted entry input file name displayed on My Entries")
                .isTrue();

        SoftAssert.assertThat(
                createdChallPage.isEntryStateDone(challEntryProfile.getEntryName()))
                .as("submitted entry state is Done")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(priority = 9, dependsOnMethods = { "createChallenge", "createApp" })
    public void announceResults() {
        printTestHeader("Test Case: announce results");

        UserProfile user = TestUserData.getAdminUser();
        ChallProfile challProfile = getMainChallProfile();

        logoutFromAll();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();
        ChallsPage challsPage = overviewPage.openChallsPage();

        assertThat(
                challsPage.isCreatedChallNameDisplayed(challProfile.getChallName()))
                .as("The created challenge is displayed for admin user")
                .isTrue();

        ChallsCreatedChallPage createdChallPage = challsPage.viewChallenge(challProfile);
        createdChallPage.waitUntilChallengeClosed();
        ChallsEditChallPage editChallPage = createdChallPage.clickSettings();

        assertThat(
                editChallPage.isAnnounceResultButtonDisplayed())
                .as("Announce Result button is displayed")
                .isTrue();

        editChallPage.clickAnnounceResult();
    }

    @Test(priority = 10, dependsOnMethods = { "createChallenge", "createApp" })
    public void archiveChallenge() {
        printTestHeader("Test Case: archive challenge");

        ChallProfile challProfile = getMainChallProfile();

        ChallsPage challsPage = openChallsPage();

        ChallsCreatedChallPage createdChallPage = challsPage.viewChallenge(challProfile);
        ChallsEditChallPage editChallPage = createdChallPage.clickSettings();
        editChallPage.setArchivedStatus();
        editChallPage.clickUpdate();

        challsPage = openChallsPage();

        assertThat(
                challsPage.isAnnouncedResultDisplayed(challProfile))
                .as("Challenge card is displayed on Challenges page")
                .isTrue();

        createdChallPage = challsPage.clickOnChallengeCard(challProfile);

        assertThat(
                createdChallPage.getCreatedChallengeNameText())
                .as("Challenge name")
                .contains(challProfile.getChallName());
    }

    @Test(priority = 11, dependsOnMethods = { "createChallenge", "createApp" })
    public void checkChallengeResults() {
        printTestHeader("Test Case: check challenge results");

        ChallProfile challProfile = getMainChallProfile();
        ChallsPage challsPage = openChallsPage();

        assertThat(
                challsPage.isAnnouncedResultDisplayed(challProfile))
                .as("Challenge card is displayed on Challenges page")
                .isTrue();

        ChallsCreatedChallPage createdChallPage = challsPage.clickOnChallengeCard(challProfile);

        assertThat(
                createdChallPage.getCreatedChallengeNameText())
                .as("Challenge name")
                .contains(challProfile.getChallName());

        assertThat(
                createdChallPage.isChallengeClosedButtonDisplayed())
                .as("'Closed' button is displayed")
                .isTrue();

        SoftAssert.assertThat(
                createdChallPage.isResultUserOneFullNameDisplayed())
                .as("Full name of the user one is displayed")
                .isTrue();

        SoftAssert.assertThat(
                createdChallPage.isResultUserTwoFullNameDisplayed())
                .as("Full name of the user two is displayed")
                .isTrue();

        SoftAssert.assertThat(
                createdChallPage.isResultFirstEntryNameDisplayed())
                .as("First entry name is displayed")
                .isTrue();

        SoftAssert.assertThat(
                createdChallPage.isResultSecondEntryNameDisplayed())
                .as("Second entry name is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

}
