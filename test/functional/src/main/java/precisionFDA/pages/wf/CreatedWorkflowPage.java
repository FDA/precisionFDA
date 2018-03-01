package precisionFDA.pages.wf;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.WorkflowLocators;
import precisionFDA.model.AppProfile;
import precisionFDA.model.WorkflowProfile;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Link;

import static precisionFDA.data.TestDict.getDictDone;
import static precisionFDA.utils.Utils.sleep;

public class CreatedWorkflowPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = WorkflowLocators.CREATED_WF_DIAGRAM_LINK)
    private Link wfDiagramTabLink;

    @FindBy(xpath = WorkflowLocators.RUN_WF_BUTTON)
    private Link runWorkflowButton;

    public CreatedWorkflowPage(final WebDriver driver) {
        super(driver);
        // waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(WorkflowLocators.CREATED_WF_DIAGRAM_LINK));
    }

    public By getAnalysisStateBy(String analysisName) {
        String xpath = WorkflowLocators.RUN_WF_CONFIG_ANALYSIS_STATUS.replace("{ANALYSIS_NAME}", analysisName);
        return By.xpath(xpath);
    }

    public Link getRunWorkflowButton() {
        return runWorkflowButton;
    }

    public By getAppInputBy(AppProfile appProfile) {
        String xpath = WorkflowLocators.CREATED_WF_APP_NAME_INPUT_TEMPLATE.replace("{APP_NAME}", appProfile.getCurRevNameText());
        return By.xpath(xpath);
    }

    public boolean isAppInputDisplayed(AppProfile appProfile) {
        return isElementPresent(getAppInputBy(appProfile), 15);
    }

    public boolean isRunWorkflowButtonDisplayed() {
        return isElementPresent(getRunWorkflowButton(), 2);
    }

    public RunWorkflowConfigPage clickRunWorkflow() {
        log.info("click Run workflow");
        waitUntilDisplayed(getRunWorkflowButton(), 2);
        getRunWorkflowButton().click();
        return new RunWorkflowConfigPage(getDriver());
    }

    public boolean isAnalysisNameDisplayed(WorkflowProfile workflowProfile) {
        String xpath = WorkflowLocators.CREATED_WF_ANALYSES_WF_TITLE.replace("{WF_TITLE}", workflowProfile.getWfFirstAnalysisName());
        return isElementPresent(By.xpath(xpath), 5);
    }

    public String getAnalysisStateText(String analysisName) {
        return getDriver().findElement(getAnalysisStateBy(analysisName)).getText();
    }

    public boolean isAnalysisStatusDone(String analysisName) {
        boolean isDone = false;
        if (getAnalysisStateText(analysisName).equalsIgnoreCase(getDictDone())) {
            isDone = true;
        }
        return isDone;
    }

    public CreatedWorkflowPage waitUntilAnalysisDone(String analysisName) {
        int timeoutSec = 300;
        int refreshStepSec = 15;
        int spentTimeSec = 0;
        log.info("waiting for " + timeoutSec + " sec until analysis status is Done for " + analysisName);
        while ( !isAnalysisStatusDone(analysisName) && (spentTimeSec < timeoutSec) ) {
            sleep(refreshStepSec*1000);
            spentTimeSec = spentTimeSec + refreshStepSec;
            log.info("it's been " + spentTimeSec + " seconds");
            getDriver().navigate().refresh();
        }
        if (!isAnalysisStatusDone(analysisName)) {
            log.info("[WARNING] the analysis status is not DONE after " + timeoutSec + " seconds: " + analysisName);
        }
        return new CreatedWorkflowPage(getDriver());
    }

}