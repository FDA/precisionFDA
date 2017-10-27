package staging.cases;

import org.testng.annotations.Test;
import staging.model.AppProfile;
import staging.model.User;
import staging.pages.CommonPage;
import staging.pages.apps.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.testng.Assert.assertTrue;

public class AppsManagementTest extends AbstractTest {

    @Test(groups = "runJob")
    void precondition() {
        successfulLogin();
    }

    public void successfulLogin() {
        printTestHeader(" -- Successful Login -- ");

        User user = User.getTestUser();

        openStartPage();
        CommonPage commonPage = correctLoginToFDA(user);

        SoftAssert.assertThat(
                commonPage.isNavigationPanelDisplayed())
                .as("navigation panel is displayed")
                .isTrue();

        SoftAssert.assertThat(
                commonPage.isCorrectUserNameDisplayed(user))
                .as("logged username is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(groups = { "runJob" }, dependsOnMethods = {"precondition"}, priority = 0)
    public void createAndSaveSimpleApp() {
        printTestHeader("Test Case: create and save simple app with custom name, title and shell script");

        AppProfile appProfile = AppProfile.getMainApp();

        CommonPage commonPage = openCommonPage();
        AppsPage appsPage = commonPage.openAppsPage();
        AppsSavedAppPage appsSavedAppPage = appsPage.createNewApp(appProfile);

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appProfile.getAppNameText());
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveSimpleApp"})
    public void checkSavedAppHasCorrectData() {
        printTestHeader("Test Case: check Saved previously App can be open from My App list and has correct data");

        AppProfile appProfile = AppProfile.getMainApp();

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appProfile.getAppNameText());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppTitle())
                .as("Title of created app")
                .isEqualTo(appProfile.getAppTitleText());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppOrg())
                .as("Org of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppOrg());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppAddedBy())
                .as("Added By of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppAddedBy());

        /*
        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppCreated())
                .as("Created date/time")
                .contains(appProfile.getAppCreationDateTimeText());

        SoftAssert.assertThat(
                appsSavedAppPage.getIsAppCreationDateTimeCorrect(appProfile))
                .as("Created date/time is correct one")
                .isEqualTo(appsSavedAppPage.getDateTimeCorrectTrueResult());
        */

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveSimpleApp"})
    public void checkRevisionIncremented() {
        printTestHeader("Test Case: check that revision version is incremented by 1 after save revision");

        AppProfile appProfile = AppProfile.getMainApp();

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);

        int revisionBefore = appsSavedAppPage.getAppRevision();

        AppsEditAppPage appsEditAppPage = appsSavedAppPage.clickEdit();
        appsSavedAppPage = appsEditAppPage.saveRevision();

        int revisionAfter = appsSavedAppPage.getAppRevision();

        assertTrue(revisionBefore + 1 == revisionAfter,
                "[revision before = " + revisionBefore + " + 1] == [revision after = " + revisionAfter + "]");
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveSimpleApp"})
    public void checkValuesNotChangedAfterIdleEdit() {
        printTestHeader("Test Case: check App data is not changed if click Edit App then Save without any changes");

        AppProfile appProfile = AppProfile.getMainApp();

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);
        AppsEditAppPage appsEditAppPage = appsSavedAppPage.clickEdit();
        appsSavedAppPage = appsEditAppPage.saveRevision();

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appProfile.getAppNameText());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppTitle())
                .as("Title of created app")
                .isEqualTo(appProfile.getAppTitleText());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppOrg())
                .as("Org of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppOrg());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppAddedBy())
                .as("Added By of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppAddedBy());

        SoftAssert.assertAll();
    }

    @Test(groups = { "runJob" }, dependsOnMethods = {"precondition", "createAndSaveSimpleApp"})
    public void runAppAndValidateResult() {
        printTestHeader("Test Case: run created previously app and validate result");

        AppProfile appProfile = AppProfile.getMainApp();

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);

        appsSavedAppPage = appsSavedAppPage.runJob(appProfile);

        assertThat(appsSavedAppPage.isRunJobDisplayed(appProfile))
                .as("running job is displayed on jobs list")
                .isTrue();

        AppsJobPage appsJobPage = appsSavedAppPage.openJobFromSavedAppPage(appProfile);

        assertThat(appsJobPage.getActJobName())
                .as("job name on a job page")
                .isEqualTo(appProfile.getJobNameText());

        appsJobPage = appsJobPage.waitUntilJobIsDone();

        SoftAssert.assertThat(appsJobPage.getJobLabelValue())
                .as("Job Label Value")
                .isEqualToIgnoringCase("DONE");

        AppsJobLogPage appsJobLogPage = appsJobPage.viewLog();

        SoftAssert.assertThat(appsJobLogPage.getFullJobLogText())
                .as("full job log")
                .contains(appProfile.getAppScriptCodeText());

        SoftAssert.assertThat(appsJobLogPage.getScriptResultFromLog(appProfile))
                .as("script result output")
                .contains(appProfile.getExpectedJobOutputText());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveSimpleApp"})
    public void editAppTitle() {
        printTestHeader("Test Case: check that the title of a saved app can be edited");

        AppProfile initProfile = AppProfile.getMainApp();
        AppProfile updProfile = AppProfile.getUpdatedApp();

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(initProfile);

        AppsEditAppPage appsEditAppPage = appsSavedAppPage.clickEdit();
        appsEditAppPage.enterNewAppTitle(updProfile);
        appsSavedAppPage = appsEditAppPage.saveRevision();

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(initProfile.getAppNameText());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppTitle())
                .as("Edited Title of created app")
                .isEqualTo(updProfile.getAppTitleText());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveSimpleApp"})
    public void editReadMeTab() {
        printTestHeader("Test Case: check that ReadMe tab can be edited and saved");

        AppProfile appProfile = AppProfile.getMainApp();

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);

        AppsEditAppPage appsEditAppPage = appsSavedAppPage.clickEdit();
        appsEditAppPage = appsEditAppPage.editReadmeTab(appProfile);
        appsEditAppPage = appsEditAppPage.openReadmeReviewTab();

        assertThat(appsEditAppPage.getReadmePreviewText())
                .as("text on Readme Preview tab during edit")
                .isEqualTo(appProfile.getReadMeRichText());

        appsSavedAppPage = appsEditAppPage.saveRevision();
        appsSavedAppPage = appsSavedAppPage.openReadmeTab();

        assertThat(appsSavedAppPage.getReadMeText())
                .as("Readme Preview text on saved page")
                .isEqualTo(appProfile.getReadMeRichText());
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveSimpleApp"})
    public void leaveComment() {
        printTestHeader("Test Case: check it is possible to write a comment");

        AppProfile appProfile = AppProfile.getMainApp();

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);
        appsSavedAppPage = appsSavedAppPage.openCommentsTab().writeComment();
        appsSavedAppPage = appsSavedAppPage.openCommentsTab();

        assertThat(appsSavedAppPage.getLastCommentText())
                .as("Comment text")
                .isEqualTo(appsSavedAppPage.getExpectedCommentText());
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveSimpleApp"})
    public void checkDefaultInstanceIsDisplayed() {
        printTestHeader("Test Case: check that the default instance value is displayed on edit app page and on app profile page");

        AppProfile appProfile = AppProfile.getMainApp();

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);
        AppsEditAppPage appsEditAppPage = appsSavedAppPage.clickEdit();
        appsEditAppPage = appsEditAppPage.openVMEnvTab();

        assertThat(appsEditAppPage.isInstanceDefaultValueDisplayed())
                .as("Instance Default value is displayed on edit page")
                .isTrue();

        String instanceEditValue = appsEditAppPage.getInstanceValue();

        appsSavedAppPage = appsEditAppPage.saveRevision();

        assertThat(appsSavedAppPage.isInstanceValueDisplayed())
                .as("Instance Default value is displayed on saved page")
                .isTrue();

        String instanceSavedValue = appsSavedAppPage.getInstanceValue();

        assertThat(instanceEditValue.toLowerCase())
                .as("Instance Value")
                .isEqualTo(instanceSavedValue.replace("-", " "));
    }

}