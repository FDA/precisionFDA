package precisionFDA.pages.wf;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.WorkflowLocators;
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

}
