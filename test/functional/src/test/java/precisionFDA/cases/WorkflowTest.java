package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestAppData;
import precisionFDA.data.TestUserData;
import precisionFDA.model.*;
import precisionFDA.pages.apps.AppsEditAppPage;
import precisionFDA.pages.apps.AppsPage;
import precisionFDA.pages.apps.AppsSavedAppPage;
import precisionFDA.pages.wf.CreateWorkflowPage;
import precisionFDA.pages.wf.WorkflowsPage;
import ru.yandex.qatools.htmlelements.annotations.Name;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestWorkflowData.getMainWorkflowProfile;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Workflow test suite")
public class WorkflowTest extends AbstractTest {

    @Test
    public void precondition() {
        printTestHeader("Precondition: login");
        UserProfile user = TestUserData.getTestUser();
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

        // createWorkflowPage.clickOnWorkflowBlock(appProfile.getCurRevNameText());
    }

}
