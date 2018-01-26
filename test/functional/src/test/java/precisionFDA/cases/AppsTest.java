package precisionFDA.cases;

import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import precisionFDA.data.TestUserData;
import precisionFDA.model.AppProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.apps.*;
import precisionFDA.pages.overview.OverviewPage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.testng.Assert.assertTrue;
import static precisionFDA.data.TestAppData.*;
import static precisionFDA.data.TestCommonData.*;
import static precisionFDA.utils.Utils.*;

@Name("Applications management test suite")
public class AppsTest extends AbstractTest {

    @Test(groups = "runJob")
    public void successfulLogin() {
        printTestHeader(" -- Successful Login -- ");

        UserProfile user = TestUserData.getTestUserOne();

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

    @Test(dependsOnMethods = {"successfulLogin"}, priority = 0)
    public void createAndSaveApp() {
        printTestHeader("Test Case: create and save an app with custom name, title and shell script");

        AppProfile appProfile = getMainAppProfile();

        AppsPage appsPage = openAppsPage();
        AppsEditAppPage appsEditAppPage = appsPage.openCreateAppPage();
        AppsSavedAppPage appsSavedAppPage = appsEditAppPage.fillAndSaveNewApp(appProfile);

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appProfile.getInitNameText());
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveApp"})
    public void checkSavedAppHasCorrectData() {
        printTestHeader("Test Case: check Saved previously App can be open from My App list and has correct data");

        AppProfile appProfile = getMainAppProfile();
        UserProfile user = TestUserData.getTestUserOne();

        AppsRelevantPage appsRelevantPage = openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToMyAppsAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openAppFromMyAppsList(appProfile);

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
                .isEqualTo(user.getApplUserOrg());

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

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveApp"})
    public void checkRevisionIsIncremented() {
        printTestHeader("Test Case: check that revision version is incremented by 1 after save revision");

        AppProfile appProfile = getMainAppProfile();

        AppsRelevantPage appsRelevantPage = openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToMyAppsAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openAppFromMyAppsList(appProfile);

        int revisionBefore = appsSavedAppPage.getAppRevision();

        AppsEditAppPage appsEditAppPage = appsSavedAppPage.clickEdit();
        appsSavedAppPage = appsEditAppPage.saveRevision(appProfile);

        int revisionAfter = appsSavedAppPage.getAppRevision();

        assertTrue(revisionBefore + 1 == revisionAfter,
                "[revision before = " + revisionBefore + " + 1] == [revision after = " + revisionAfter + "]");
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveApp"})
    public void checkValuesNotChangedAfterIdleEdit() {
        printTestHeader("Test Case: check App data is not changed if click Edit App then Save without any changes");

        AppProfile appProfile = getMainAppProfile();
        UserProfile user = TestUserData.getTestUserOne();

        AppsRelevantPage appsRelevantPage = openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToMyAppsAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openAppFromMyAppsList(appProfile);
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
                .isEqualTo(user.getApplUserOrg());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppAddedBy())
                .as("Added By of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppAddedBy());

        SoftAssert.assertAll();
    }

    @Test(groups = { "runJob" }, dependsOnMethods = {"successfulLogin"})
    public void runAppAndValidateResult() {
        printTestHeader("Test Case: run app and validate result");

        AppProfile appProfile = getRunJobAppProfile();

        AppsPage appsPage = openAppsPage();
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

        assertThat(appsJobPage.getJobLabelValue())
                .as("Job Label Value")
                .isEqualToIgnoringCase("DONE");

        assertThat(appsJobPage.getAppsJobRunOutputResultText())
                .as("job result output")
                .isEqualTo(appProfile.getExpectedJobOutputText());

        AppsJobLogPage appsJobLogPage = appsJobPage.viewLog();

        assertThat(appsJobLogPage.getFullJobLogText())
                .as("full job log")
                .contains(appProfile.getInitScriptText());
    }

    @Test(groups = { "runJob" }, dependsOnMethods = {"successfulLogin", "runAppAndValidateResult"})
    public void openItemsFromJobsList() {
        printTestHeader("Test Case: check it is possible to open the app and job from jobs list");

        AppProfile appProfile = getRunJobAppProfile();

        AppsRelevantPage appsRelevantPage = openAppsPage().openAppsRelevantPage();

        assertThat(appsRelevantPage.isLinkToJobsListAppDisplayed(appProfile))
                .as("Link to the application in the jobs list is displayed")
                .isTrue();

        assertThat(appsRelevantPage.isLinkToJobsListJobDisplayed(appProfile))
                .as("Link to the job in the jobs list is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openAppFromJobsList(appProfile);

        assertThat(
                appsSavedAppPage.isRunJobDisplayed(appProfile))
                .as("Job name is displayed: " + appProfile.getJobNameText())
                .isTrue();

        appsRelevantPage = openAppsPage().openAppsRelevantPage();

        AppsJobPage appsJobPage = appsRelevantPage.openJobFromJobsList(appProfile);

        assertThat(
                appsJobPage.isAppsJobPageIOTabLinkDisplayed())
                .as("Input/Output tab is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveApp"})
    public void editAppTitle() {
        printTestHeader("Test Case: check that the title of a saved app can be edited");

        AppProfile appProfile = getMainAppProfile();

        AppsRelevantPage appsRelevantPage = openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToMyAppsAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openAppFromMyAppsList(appProfile);
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

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveApp"})
    public void editReadmeAndVerify() {
        printTestHeader("Test Case: check that ReadMe tab can be edited and saved");

        AppProfile appProfile = getMainAppProfile();

        AppsRelevantPage appsRelevantPage = openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToMyAppsAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openAppFromMyAppsList(appProfile);
        AppsEditAppPage appsEditAppPage = appsSavedAppPage.clickEdit();
        appsEditAppPage.openReadmeEditTab();

        appsEditAppPage.editReadmeWithNewValue(appProfile);

        appsEditAppPage = appsEditAppPage.openReadmePreviewTab();

        assertThat(appsEditAppPage.getReadmePreviewText())
                .as("text on Readme Preview tab during edit")
                .isEqualTo(appProfile.getTempReadMeRichText());

        appsSavedAppPage = appsEditAppPage.saveRevisionAfterReadmeEdit(appProfile);
        appsSavedAppPage = appsSavedAppPage.openReadmeTab();

        assertThat(appsSavedAppPage.getReadMeText())
                .as("Readme Preview text on saved page")
                .isEqualTo(appProfile.getCurRevReadMeRichText());
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveApp"})
    public void leaveAppComment() {
        printTestHeader("Test Case: check it is possible to write a comment for an app");

        AppProfile appProfile = getMainAppProfile();

        AppsRelevantPage appsRelevantPage = openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToMyAppsAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openAppFromMyAppsList(appProfile);
        appsSavedAppPage = appsSavedAppPage.openCommentsTab().leaveComment();
        appsSavedAppPage = appsSavedAppPage.openCommentsTab();

        assertThat(appsSavedAppPage.getLastCommentText())
                .as("Comment text")
                .isEqualTo(appsSavedAppPage.getExpectedCommentText());
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveApp"})
    public void checkDefaultInstanceIsDisplayed() {
        printTestHeader("Test Case: check that the default instance value is displayed on edit app page and on app profile page");

        AppProfile appProfile = getMainAppProfile();

        AppsRelevantPage appsRelevantPage = openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToMyAppsAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openAppFromMyAppsList(appProfile);
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

    @Test(dependsOnMethods = {"successfulLogin"})
    public void verifyPreviousRevisionHasCorrectData() {
        printTestHeader("Test Case: check that a previous app revision has correct data");

        AppProfile appProfile = getCheckRevisionAppProfile();
        UserProfile user = TestUserData.getTestUserOne();

        AppsPage appsPage = openAppsPage();
        AppsEditAppPage appsEditAppPage = appsPage.openCreateAppPage();
        AppsSavedAppPage appsSavedAppPage = appsEditAppPage.fillAndSaveNewApp(appProfile);

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of the created app")
                .isEqualTo(appProfile.getInitNameText());

        appsEditAppPage = appsSavedAppPage.clickEdit();
        appsSavedAppPage = appsEditAppPage.editAndSaveAppWithNewValues(appProfile);

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of the updated app")
                .isEqualTo(appProfile.getInitNameText());

        appsSavedAppPage = appsSavedAppPage.openFirstRevision();

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of the first revision")
                .isEqualTo(appProfile.getInitNameText());

        assertThat(
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
                .isEqualTo(user.getApplUserOrg());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppAddedBy())
                .as("Added By of the app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppAddedBy());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveApp"})
    public void exportDockerFile() {
        printTestHeader("Test Case: check it is possible to export an app as a docker file");

        AppProfile appProfile = getMainAppProfile();

        AppsRelevantPage appsRelevantPage = openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToMyAppsAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openAppFromMyAppsList(appProfile);
        removeDockerFileFromDownloads();
        appsSavedAppPage = appsSavedAppPage.exportDockerContainer();

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of the app")
                .isEqualTo(appProfile.getCurRevNameText());

        assertThat(
                appsSavedAppPage.isDockerFileDownloaded())
                .as("Docker file is downloaded")
                .isTrue();

        assertThat(
                appsSavedAppPage.isDockerFileNotEmpty())
                .as("Docker file is not empty")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveApp"})
    public void exportCWLToolFile() {
        printTestHeader("Test Case: check it is possible to export an app as a CWL Tool file");

        AppProfile appProfile = getMainAppProfile();

        AppsRelevantPage appsRelevantPage = openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToMyAppsAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openAppFromMyAppsList(appProfile);
        removeCWLToolFileFromDownloads(appProfile);
        appsSavedAppPage = appsSavedAppPage.exportCWLTool(appProfile);

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of the app")
                .isEqualTo(appProfile.getCurRevNameText());

        assertThat(
                appsSavedAppPage.isCWLToolFileDownloaded(appProfile))
                .as("CWL Tool file is downloaded")
                .isTrue();

        assertThat(
                appsSavedAppPage.isCWLToolFileNotEmpty(appProfile))
                .as("CWL Tool file is not empty")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveApp"})
    public void exportWDLTaskFile() {
        printTestHeader("Test Case: check it is possible to export an app as a WDL Task file");

        AppProfile appProfile = getMainAppProfile();

        AppsRelevantPage appsRelevantPage = openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToMyAppsAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openAppFromMyAppsList(appProfile);
        removeWDLTaskFileFromDownloads(appProfile);
        appsSavedAppPage = appsSavedAppPage.exportWDLTask(appProfile);

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of the app")
                .isEqualTo(appProfile.getCurRevNameText());

        assertThat(
                appsSavedAppPage.isWDLTaskFileDownloaded(appProfile))
                .as("WDL Task file is downloaded")
                .isTrue();

        assertThat(
                appsSavedAppPage.isWDLTaskFileNotEmpty(appProfile))
                .as("WDL Task file is not empty")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveApp"})
    public void trackApp() {
        printTestHeader("Test Case: check it is possible to track an app");

        AppProfile appProfile = getMainAppProfile();

        AppsRelevantPage appsRelevantPage = openAppsPage().openAppsRelevantPage();

        assertThat(
                appsRelevantPage.isLinkToMyAppsAppDisplayed(appProfile))
                .as("Link to saved app is displayed")
                .isTrue();

        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openAppFromMyAppsList(appProfile);
        AppsTrackAppPage trackAppPage = appsSavedAppPage.clickTrack();

        assertThat(
                trackAppPage.isAppBlockDisplayed(appProfile))
                .as("App block is displayed on the schema")
                .isTrue();
    }

}