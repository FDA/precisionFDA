package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestAppData;
import precisionFDA.data.TestUserData;
import precisionFDA.model.*;
import precisionFDA.pages.apps.AppsEditAppPage;
import precisionFDA.pages.apps.AppsPage;
import precisionFDA.pages.apps.AppsSavedAppPage;
import precisionFDA.pages.files.FilesAddFilesPage;
import precisionFDA.pages.files.FilesPage;
import precisionFDA.pages.files.UploadedFilePage;
import precisionFDA.pages.wf.CreateWorkflowPage;
import precisionFDA.pages.wf.CreatedWorkflowPage;
import precisionFDA.pages.wf.RunWorkflowConfigPage;
import precisionFDA.pages.wf.WorkflowsPage;
import ru.yandex.qatools.htmlelements.annotations.Name;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestFilesData.getMainWFInputFile;
import static precisionFDA.data.TestWorkflowData.getMainWorkflowProfile;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Workflow test suite")
public class WorkflowTest extends AbstractTest {

    @Test
    public void precondition() {
        printTestHeader("Precondition: login");
        UserProfile user = TestUserData.getTestUserOne();
        openLoginPrecisionPage(user).correctLogin(user).grantAccess();
    }

    @Test(priority = 0, dependsOnMethods = "precondition")
    public void createApp() {
        printTestHeader("Test Case: create app");

        AppProfile appProfile = TestAppData.getMainWorkflowAppProfile();

        AppsPage appsPage = openOverviewPage().openAppsPage();
        AppsEditAppPage appsEditAppPage = appsPage.openCreateAppPage();
        AppsSavedAppPage appsSavedAppPage = appsEditAppPage.fillAndSaveAppForWorkflow(appProfile);

        assertThat(
                appsSavedAppPage.getActSelectedAppName())
                .as("Name of created app")
                .isEqualTo(appProfile.getInitNameText());
    }

    @Test(priority = 1, dependsOnMethods = "precondition")
    public void createWorkflow() {
        printTestHeader("Test Case: create a workflow");

        WorkflowProfile workflowProfile = getMainWorkflowProfile();
        AppProfile appProfile = TestAppData.getMainWorkflowAppProfile();

        WorkflowsPage workflowsPage = openOverviewPage().openWorkflowsPage();
        CreateWorkflowPage createWorkflowPage = workflowsPage.clickCreateWorkflow();
        createWorkflowPage.fillNewWorkflow(workflowProfile);
        createWorkflowPage = createWorkflowPage.clickAddStage();
        createWorkflowPage.addStageOnModal(appProfile);
        createWorkflowPage = createWorkflowPage.clickCloseAddStageModal();

        assertThat(
                createWorkflowPage.isAppBlockDisplayed(appProfile))
                .as("App block is displayed on the workflow")
                .isTrue();

        createWorkflowPage = createWorkflowPage.clickOnWorkflowBlock(appProfile);

        assertThat(
                createWorkflowPage.isAppSettingsModalDisplayed())
                .as("App settings Modal dialog is displayed")
                .isTrue();

        createWorkflowPage.setFirstInputAsRequired();
        createWorkflowPage = createWorkflowPage.closeAppSettingsModal();
        CreatedWorkflowPage createdWorkflowPage = createWorkflowPage.clickWorkflowCreateButton();

        assertThat(
                createdWorkflowPage.isAppInputDisplayed(appProfile))
                .as("Input App is displayed")
                .isTrue();

        assertThat(
                createdWorkflowPage.isRunWorkflowButtonDisplayed())
                .as("Run Workflow button is displayed")
                .isTrue();
    }

    @Test(priority = 2, dependsOnMethods = { "precondition", "createWorkflow" })
    public void runWorkflow() {
        printTestHeader("Test Case: run workflow");

        AppProfile appProfile = TestAppData.getMainWorkflowAppProfile();
        FileProfile inputFileProfile = getMainWFInputFile();
        WorkflowProfile workflowProfile = getMainWorkflowProfile();

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

        WorkflowsPage workflowsPage = openOverviewPage().openWorkflowsPage();

        assertThat(
                workflowsPage.isLinkToCreatedWorkflowDisplayed(workflowProfile))
                .as("Link to the created workflow is displayed")
                .isTrue();

        CreatedWorkflowPage createdWorkflowPage = workflowsPage.openCreatedWorkflow(workflowProfile);
        RunWorkflowConfigPage runWorkflowConfigPage = createdWorkflowPage.clickRunWorkflow();

        assertThat(
                runWorkflowConfigPage.isAppInputDisplayed(appProfile))
                .as("Input App is displayed")
                .isTrue();

        runWorkflowConfigPage.enterAnalysisName(workflowProfile.getWfFirstAnalysisName());
        runWorkflowConfigPage = runWorkflowConfigPage.clickSelectFile();
        runWorkflowConfigPage.clickFilesOnModal();
        runWorkflowConfigPage.selectFileInModal(inputFileProfile.getFileName());
        runWorkflowConfigPage = runWorkflowConfigPage.clickSelectOnModal();

        assertThat(
                runWorkflowConfigPage.isSelectedFileDisplayed(inputFileProfile.getFileName()))
                .as("selected file is displayed as input parameter")
                .isTrue();

        createdWorkflowPage = runWorkflowConfigPage.clickRunWorkflow();

        assertThat(
                createdWorkflowPage.isAnalysisNameDisplayed(workflowProfile))
                .as("Analysis name is displayed on Analyses tab")
                .isTrue();

        createdWorkflowPage = createdWorkflowPage.waitUntilAnalysisDone(workflowProfile.getWfFirstAnalysisName());

        assertThat(
                createdWorkflowPage.isAnalysisStatusDone(workflowProfile.getWfFirstAnalysisName()))
                .as("analysis status is Done")
                .isTrue();
    }

}
