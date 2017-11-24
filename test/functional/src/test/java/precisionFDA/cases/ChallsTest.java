package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestAppData;
import precisionFDA.data.TestUserData;
import precisionFDA.model.AppProfile;
import precisionFDA.model.ChallProfile;
import precisionFDA.model.TimeZoneProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.apps.AppsEditAppPage;
import precisionFDA.pages.apps.AppsPage;
import precisionFDA.pages.apps.AppsRelevantPage;
import precisionFDA.pages.apps.AppsSavedAppPage;
import precisionFDA.pages.challs.ChallsCreatedChallPage;
import precisionFDA.pages.challs.ChallsEditChallPage;
import precisionFDA.pages.challs.ChallsEditChallengeInfo;
import precisionFDA.pages.challs.ChallsPage;
import precisionFDA.pages.overview.OverviewPage;
import precisionFDA.pages.profile.ProfilePage;
import ru.yandex.qatools.htmlelements.annotations.Name;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestChallsData.getExpectedChallDateTimeValue;
import static precisionFDA.data.TestChallsData.getMainChallProfile;
import static precisionFDA.data.TimeZonesData.getMoscowTimeZone;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Challenges test suite")
public class ChallsTest extends AbstractTest {

    @Test(priority = 0)
    public void createApp() {
        printTestHeader("Test Case: create app as a test user");

        UserProfile user = TestUserData.getTestUser();
        AppProfile appProfile = TestAppData.getChallAppProfile();
        TimeZoneProfile timeZone = getMoscowTimeZone();

        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();

        ProfilePage profilePage = overviewPage.openProfilePage();
        profilePage.setTimeZone(timeZone);

        AppsPage appsPage = openOverviewPage().openAppsPage();
        AppsEditAppPage appsEditAppPage = appsPage.openCreateAppPage();
        AppsSavedAppPage appsSavedAppPage = appsEditAppPage.fillAndSaveAppForChallenge(appProfile);

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appProfile.getInitNameText());

        assertThat(
                appsSavedAppPage.isAssignToChallengeDisplayed())
                .as("Assign to Challenge button is NOT displayed")
                .isFalse();
    }

    @Test(priority = 1)
    public void createChallenge() {
        printTestHeader("Test Case: create a challenge as admin and verify");

        UserProfile user = TestUserData.getAdminUser();
        ChallProfile challProfile = getMainChallProfile();
        TimeZoneProfile timeZone = getMoscowTimeZone();

        logoutFromAll();
        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();

        ProfilePage profilePage = openOverviewPage().openProfilePage();
        profilePage.setTimeZone(timeZone);

        ChallsPage challsPage = openOverviewPage().openChallsPage();

        assertThat(
                challsPage.isCreateNewChallLinkDisplayed())
                .as("Create new challenge link is displayed")
                .isTrue();

        ChallsEditChallPage editChallPage = challsPage.clickCreateNewChall();
        editChallPage.fillChallForm(challProfile);

        ChallsCreatedChallPage createdChallPage = editChallPage.clickCreate();

        assertThat(
                createdChallPage.getCreatedNameText())
                .as("Name of the created challenge")
                .contains(challProfile.getChallName());

        SoftAssert.assertThat(
                createdChallPage.getCreatedDescrText())
                .as("Description of the created challenge")
                .isEqualTo(challProfile.getChallDescr());

        SoftAssert.assertThat(
                createdChallPage.getStartsText())
                .as("Starts value")
                .isEqualTo(getExpectedChallDateTimeValue(challProfile.getChallStartsAt(), timeZone));

        SoftAssert.assertThat(
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

        ChallsPage challsPage = openOverviewPage().openChallsPage();
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

        UserProfile user = TestUserData.getTestUser();
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

}
