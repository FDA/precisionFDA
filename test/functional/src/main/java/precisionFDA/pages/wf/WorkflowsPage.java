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

public class WorkflowsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = WorkflowLocators.CREATE_WF_BUTTON_LINK)
    private Link createWorkflowButtonLink;

    public WorkflowsPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(WorkflowLocators.CREATE_WF_BUTTON_LINK));
    }

    public Link getCreateWorkflowButtonLink() {
        return createWorkflowButtonLink;
    }

    public CreateWorkflowPage clickCreateWorkflow() {
        log.info("click Create Workflow");
        getCreateWorkflowButtonLink().click();
        return new CreateWorkflowPage(getDriver());
    }

    public CreatedWorkflowPage openCreatedWorkflow(WorkflowProfile workflowProfile) {
        log.info("open created workflow");
        waitUntilDisplayed(getLinkToCreatedWorkflowBy(workflowProfile), 1);
        getDriver().findElement(getLinkToCreatedWorkflowBy(workflowProfile)).click();
        return new CreatedWorkflowPage(getDriver());
    }

    public By getLinkToCreatedWorkflowBy(WorkflowProfile workflowProfile) {
        String xpath = WorkflowLocators.LINK_TO_CREATED_WORKFLOW_TEMPLATE.replace("{WF_TITLE}", workflowProfile.getWfTitle());
        return By.xpath(xpath);
    }

    public boolean isLinkToCreatedWorkflowDisplayed(WorkflowProfile workflowProfile) {
        return isElementPresent(getLinkToCreatedWorkflowBy(workflowProfile), 10);
    }

}
