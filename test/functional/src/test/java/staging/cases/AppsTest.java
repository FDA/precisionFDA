package staging.cases;

import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import staging.data.TestUserData;
import staging.model.AppProfile;
import staging.model.User;
import staging.pages.apps.*;
import staging.pages.overview.OverviewPage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.testng.Assert.assertTrue;
import static staging.data.TestAppData.*;
import static staging.data.TestRunData.*;

@Name("Applications management test suite")
public class AppsTest extends AbstractTest {

    @Test(groups = "runJob")
    void precondition() {
        successfulLogin();
    }

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

    @Test(dependsOnMethods = {"precondition"}, priority = 0)
    public void createAndSaveApp() {
        printTestHeader("Test Case: create and save an app with custom name, title and shell script");

        AppProfile appProfile = getMainProfile();

        AppsPage appsPage = getCommonPage().openAppsPage();
        AppsEditAppPage appsEditAppPage = appsPage.openCreateAppPage();
        AppsSavedAppPage appsSavedAppPage = appsEditAppPage.fillAndSaveNewApp(appProfile);

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appProfile.getInitNameText());
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveApp"})
    public void checkSavedAppHasCorrectData() {
        printTestHeader("Test Case: check Saved previously App can be open from My App list and has correct data");

        AppProfile appProfile = getMainProfile();

        AppsRelevantPage appsRelevantPage = getCommonPage().openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToSavedAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appProfile.getCurRevNameText());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppTitle())
                .as("Title of created app")
                .isEqualTo(appProfile.getCurRevTitleText());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppOrg())
                .as("Org of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppOrg());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppAddedBy())
                .as("Added By of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppAddedBy());

        SoftAssert.assertThat(
                appsSavedAppPage.getAppSavedInputLabelText())
                .as("Input label text")
                .isEqualTo(getInputLabelFieldName());

        SoftAssert.assertThat(
                appsSavedAppPage.getAppSavedInputHelpText())
                .as("Input help text")
                .isEqualTo(getInputHelpFieldName());

        SoftAssert.assertThat(
                appsSavedAppPage.getAppSavedInputDefaultText())
                .as("Input default text")
                .isEqualTo("Default: " + getInputDefaultFieldName());

        SoftAssert.assertThat(
                appsSavedAppPage.getAppSavedOutputLabelText())
                .as("Output label text")
                .isEqualTo(getOutputLabelFieldName());

        SoftAssert.assertThat(
                appsSavedAppPage.getAppSavedOutputHelpText())
                .as("Output help text")
                .isEqualTo(getOutputHelpFieldName());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveApp"})
    public void checkRevisionIsIncremented() {
        printTestHeader("Test Case: check that revision version is incremented by 1 after save revision");

        AppProfile appProfile = getMainProfile();

        AppsRelevantPage appsRelevantPage = getCommonPage().openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToSavedAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);

        int revisionBefore = appsSavedAppPage.getAppRevision();

        AppsEditAppPage appsEditAppPage = appsSavedAppPage.clickEdit();
        appsSavedAppPage = appsEditAppPage.saveRevision(appProfile);

        int revisionAfter = appsSavedAppPage.getAppRevision();

        assertTrue(revisionBefore + 1 == revisionAfter,
                "[revision before = " + revisionBefore + " + 1] == [revision after = " + revisionAfter + "]");
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveApp"})
    public void checkValuesNotChangedAfterIdleEdit() {
        printTestHeader("Test Case: check App data is not changed if click Edit App then Save without any changes");

        AppProfile appProfile = getMainProfile();

        AppsRelevantPage appsRelevantPage = getCommonPage().openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToSavedAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);
        AppsEditAppPage appsEditAppPage = appsSavedAppPage.clickEdit();
        appsSavedAppPage = appsEditAppPage.saveRevision(appProfile);

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appProfile.getCurRevNameText());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppTitle())
                .as("Title of created app")
                .isEqualTo(appProfile.getCurRevTitleText());

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

    @Test(groups = { "runJob" }, dependsOnMethods = {"precondition"})
    public void runAppAndValidateResult() {
        printTestHeader("Test Case: run app and validate result");

        AppProfile appProfile = getRunJobProfile();

        AppsPage appsPage = getCommonPage().openAppsPage();
        AppsEditAppPage appsEditAppPage = appsPage.openCreateAppPage();
        AppsSavedAppPage appsSavedAppPage = appsEditAppPage.fillAndSaveNewApp(appProfile);

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appProfile.getInitNameText());

        AppsEditAndRunJobPage appsEditAndRunJobPage = appsSavedAppPage.clickRunAppOnAppPage();
        appsEditAndRunJobPage.editJob(appProfile);
        appsSavedAppPage = appsEditAndRunJobPage.clickRunAppOnEditJobPage(appProfile);

        assertThat(appsSavedAppPage.isRunJobDisplayed(appProfile))
                .as("running job is displayed on jobs list")
                .isTrue();

        AppsJobPage appsJobPage = appsSavedAppPage.openJobFromSavedAppPage(appProfile);

        assertThat(appsJobPage.getActJobName())
                .as("job name value on the job page")
                .isEqualTo(appProfile.getJobNameText());

        appsJobPage = appsJobPage.waitUntilJobIsDone();

        SoftAssert.assertThat(appsJobPage.getJobLabelValue())
                .as("Job Label Value")
                .isEqualToIgnoringCase("DONE");

        SoftAssert.assertThat(appsJobPage.getAppsJobRunOutputResultText())
                .as("job result output")
                .isEqualTo(appProfile.getExpectedJobOutputText());

        AppsJobLogPage appsJobLogPage = appsJobPage.viewLog();

        SoftAssert.assertThat(appsJobLogPage.getFullJobLogText())
                .as("full job log")
                .contains(appProfile.getInitScriptText());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveApp"})
    public void editAppTitle() {
        printTestHeader("Test Case: check that the title of a saved app can be edited");

        AppProfile appProfile = getMainProfile();

        AppsRelevantPage appsRelevantPage = getCommonPage().openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToSavedAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);
        AppsEditAppPage appsEditAppPage = appsSavedAppPage.clickEdit();
        appsEditAppPage.editAndSaveAppTitleWithNewValue(appProfile);

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appProfile.getInitNameText());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppTitle())
                .as("Edited Title of created app")
                .isEqualTo(appProfile.getCurRevTitleText());

        System.out.println("TITLE is: " + appProfile.getCurRevTitleText());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveApp"})
    public void editReadmeAndVerify() {
        printTestHeader("Test Case: check that ReadMe tab can be edited and saved");

        AppProfile appProfile = getMainProfile();

        AppsRelevantPage appsRelevantPage = getCommonPage().openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToSavedAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);
        AppsEditAppPage appsEditAppPage = appsSavedAppPage.clickEdit();
        appsEditAppPage.openReadmeEditTab();

        appsEditAppPage.editReadmeWithNewValue(appProfile);

        appsEditAppPage = appsEditAppPage.openReadmePreviewTab();

        SoftAssert.assertThat(appsEditAppPage.getReadmePreviewText())
                .as("text on Readme Preview tab during edit")
                .isEqualTo(appProfile.getTempReadMeRichText());

        appsSavedAppPage = appsEditAppPage.saveRevisionAfterReadmeEdit(appProfile);
        appsSavedAppPage = appsSavedAppPage.openReadmeTab();

        SoftAssert.assertThat(appsSavedAppPage.getReadMeText())
                .as("Readme Preview text on saved page")
                .isEqualTo(appProfile.getCurRevReadMeRichText());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveApp"})
    public void leaveAppComment() {
        printTestHeader("Test Case: check it is possible to write a comment for an app");

        AppProfile appProfile = getMainProfile();

        AppsRelevantPage appsRelevantPage = getCommonPage().openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToSavedAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);
        appsSavedAppPage = appsSavedAppPage.openCommentsTab().leaveComment();
        appsSavedAppPage = appsSavedAppPage.openCommentsTab();

        assertThat(appsSavedAppPage.getLastCommentText())
                .as("Comment text")
                .isEqualTo(appsSavedAppPage.getExpectedCommentText());
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveApp"})
    public void checkDefaultInstanceIsDisplayed() {
        printTestHeader("Test Case: check that the default instance value is displayed on edit app page and on app profile page");

        AppProfile appProfile = getMainProfile();

        AppsRelevantPage appsRelevantPage = getCommonPage().openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToSavedAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl(appProfile);
        AppsEditAppPage appsEditAppPage = appsSavedAppPage.clickEdit();
        appsEditAppPage = appsEditAppPage.openVMEnvTab();

        assertThat(appsEditAppPage.isInstanceDefaultValueDisplayed())
                .as("Instance Default value is displayed on edit page")
                .isTrue();

        String instanceEditValue = appsEditAppPage.getInstanceValue();

        appsSavedAppPage = appsEditAppPage.saveRevision(appProfile);

        assertThat(appsSavedAppPage.isInstanceValueDisplayed())
                .as("Instance Default value is displayed on saved page")
                .isTrue();

        String instanceSavedValue = appsSavedAppPage.getInstanceValue();

        assertThat(instanceEditValue.toLowerCase())
                .as("Instance Value")
                .isEqualTo(instanceSavedValue.replace("-", " "));
    }

    @Test(dependsOnMethods = {"precondition"})
    public void verifyPreviousRevisionHasCorrectData() {
        printTestHeader("Test Case: check that a previous app revision has correct data");

        AppProfile appProfile = getCheckRevisionProfile();

        AppsPage appsPage = getCommonPage().openAppsPage();
        AppsEditAppPage appsEditAppPage = appsPage.openCreateAppPage();
        AppsSavedAppPage appsSavedAppPage = appsEditAppPage.fillAndSaveNewApp(appProfile);

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of the created app")
                .isEqualTo(appProfile.getInitNameText());

        appsEditAppPage = appsSavedAppPage.clickEdit();
        appsSavedAppPage = appsEditAppPage.editAndSaveAppWithNewValues(appProfile);

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of the updated app")
                .isEqualTo(appProfile.getInitNameText());

        appsSavedAppPage = appsSavedAppPage.openFirstRevision();

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of the first revision")
                .isEqualTo(appProfile.getInitNameText());

        SoftAssert.assertThat(
                appsSavedAppPage.getAppsSavedRevisionPageTitleText())
                .as("Title of the first revision")
                .isEqualTo(appProfile.getInitTitleText());

        appsSavedAppPage = appsSavedAppPage.openReadmeTab();

        SoftAssert.assertThat(appsSavedAppPage.getReadMeText())
                .as("Readme Preview text of the first revision")
                .isEqualTo(appProfile.getInitReadMeRichText());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppOrg())
                .as("Org of the app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppOrg());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppAddedBy())
                .as("Added By of the app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppAddedBy());

        SoftAssert.assertAll();
    }

}