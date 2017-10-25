package staging.cases;

import org.testng.annotations.Test;
import staging.model.Users;
import staging.pages.CommonPage;
import staging.pages.apps.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.testng.Assert.assertTrue;
import static staging.data.TestVariables.getAppCommentText;
import static staging.data.TestVariables.getReadMeRichText;

public class AppsManagementTest extends AbstractTest {

    @Test(groups = "runJob")
    public void successfulLogin() {
        printTestHeader("Test Case: Successful Login");

        Users user = Users.getTestUser();

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

    @Test(groups = { "runJob" }, dependsOnMethods = {"successfulLogin"}, priority = 0)
    public void createAndSaveSimpleApp() {
        printTestHeader("Test Case: create and save simple app with custom name, title and shell script");

        CommonPage commonPage = openCommonPage();
        ApplCreateAppPage applCreateAppPage = commonPage.openAppsPage().openCreateAppPage();
        AppsSavedAppPage appsSavedAppPage = applCreateAppPage.fillCreateAppForm().clickCreate();

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppName());

        SoftAssert.assertAll();

    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveSimpleApp"})
    public void checkSavedAppHasCorrectData() {
        printTestHeader("Test Case: check Saved previously App can be open from My App list and has correct data");

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl();

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppName());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppTitle())
                .as("Title of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppTitle());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppOrg())
                .as("Org of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppOrg());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppAddedBy())
                .as("Added By of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppAddedBy());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppCreated())
                .as("Created date/time")
                .contains(appsSavedAppPage.getExpSelectedAppCreated());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveSimpleApp"})
    public void checkRevisionIncremented() {
        printTestHeader("Test Case: check that revision version is incremented by 1 after save revision");

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl();

        int revisionBefore = appsSavedAppPage.getAppRevision();

        AppsEditAppPage appsEditAppPage = appsSavedAppPage.editSavedApp();
        appsSavedAppPage = appsEditAppPage.saveRevision();

        int revisionAfter = appsSavedAppPage.getAppRevision();

        assertTrue(revisionBefore + 1 == revisionAfter,
                "[revision before = " + revisionBefore + " + 1] == [revision after = " + revisionAfter + "]");
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveSimpleApp"})
    public void checkValuesNotChangedAfterIdleEdit() {
        printTestHeader("Test Case: check App data is not changed if click Edit App then Save without any changes");

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl();
        AppsEditAppPage appsEditAppPage = appsSavedAppPage.editSavedApp();
        appsSavedAppPage = appsEditAppPage.saveRevision();

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppName());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppTitle())
                .as("Title of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppTitle());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppOrg())
                .as("Org of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppOrg());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppAddedBy())
                .as("Added By of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppAddedBy());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppCreated())
                .as("Created date/time")
                .contains(appsSavedAppPage.getExpSelectedAppCreated());

        SoftAssert.assertAll();
    }

    @Test(groups = { "runJob" }, dependsOnMethods = {"successfulLogin", "createAndSaveSimpleApp"})
    public void runAppAndValidateResult() {
        printTestHeader("Test Case: run created previously app and validate result");

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl();
        AppsEditAndRunAppPage appsEditAndRunAppPage = appsSavedAppPage.runAppFromRelevantPage();
        appsSavedAppPage = appsEditAndRunAppPage.editJobName().runAppFromEditPage();

        assertTrue(appsSavedAppPage.isRunJobDisplayed(), "running job is displayed");

        AppsJobPage appsJobPage = appsSavedAppPage.openJobFromSavedAppPage();

        assertTrue(
                appsJobPage.getActJobName().equals(appsJobPage.getExpJobName()),
                "Job Name");

        appsJobPage = appsJobPage.waitUntilJobIsDone();

        assertTrue(
                appsJobPage.getJobLabelValue().equalsIgnoreCase("DONE"),
                "Job Label Value");

        AppsJobLogPage appsJobLogPage = appsJobPage.viewLog();

        assertTrue(
                appsJobLogPage.isJobResultCorrect(),
                "Script Job Result is correct");
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveSimpleApp"})
    public void editAppTitle() {
        printTestHeader("Test Case: check that the title of a saved app can be edited");

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl();

        AppsEditAppPage appsEditAppPage = appsSavedAppPage.editSavedApp();
        appsEditAppPage.enterNewAppTitle();
        appsSavedAppPage = appsEditAppPage.saveRevision();

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppName());

        SoftAssert.assertThat(
                appsSavedAppPage.getActSelectedAppTitle())
                .as("Edited Title of created app")
                .isEqualTo(appsSavedAppPage.getExpSelectedAppTitle());

        SoftAssert.assertAll();

    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveSimpleApp"})
    public void editReadMeTab() {
        printTestHeader("Test Case: check that ReadMe tab can be edited and saved");

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl();

        AppsEditAppPage appsEditAppPage = appsSavedAppPage.editSavedApp();
        appsEditAppPage = appsEditAppPage.editReadmeTab();
        appsEditAppPage = appsEditAppPage.openReadmeReviewTab();

        assertThat(appsEditAppPage.getReadmePreviewText())
                .as("text on Readme Preview tab during edit")
                .isEqualTo(getReadMeRichText());

        appsSavedAppPage = appsEditAppPage.saveRevision();
        appsSavedAppPage = appsSavedAppPage.openReadmeTab();

        assertThat(appsSavedAppPage.getReadMeText())
                .as("Readme Preview text on saved page")
                .isEqualTo(getReadMeRichText());
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveSimpleApp"})
    public void leaveComment() {
        printTestHeader("Test Case: check it is possible to write a comment");

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl();
        appsSavedAppPage = appsSavedAppPage.openCommentsTab().writeComment();
        appsSavedAppPage = appsSavedAppPage.openCommentsTab();

        assertThat(appsSavedAppPage.getLastCommentText())
                .as("Comment text")
                .isEqualTo(getAppCommentText());
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveSimpleApp"})
    public void checkDefaultInstanceIsDisplayed() {
        printTestHeader("Test Case: check that the default instance value is displayed on edit app page and on app profile page");

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl();
        AppsEditAppPage appsEditAppPage = appsSavedAppPage.editSavedApp();
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