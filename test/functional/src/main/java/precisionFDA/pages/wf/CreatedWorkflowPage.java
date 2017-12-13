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

    public Link getRunWorkflowButton() {
        return runWorkflowButton;
    }

    public Link getWfDiagramTabLink() {
        return wfDiagramTabLink;
    }

    public boolean isWorkflowDiagramLinkDisplayed() {
        return isElementPresent(getWfDiagramTabLink(), 2);
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

    public boolean isWorkflowTitleDisplayedOnAnalyses(WorkflowProfile workflowProfile) {
        String xpath = WorkflowLocators.CREATED_WF_ANALYSES_WF_TITLE.replace("{WF_TITLE}", workflowProfile.getWfTitle());
        return isElementPresent(By.xpath(xpath), 5);
    }

}
