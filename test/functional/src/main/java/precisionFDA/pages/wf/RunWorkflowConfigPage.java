package precisionFDA.pages.wf;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.WorkflowLocators;
import precisionFDA.model.AppProfile;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.*;

import static precisionFDA.utils.Utils.sleep;

public class RunWorkflowConfigPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = WorkflowLocators.RUN_WF_CONFIG_SELECT_FILE_BUTTON)
    private Button selectFileButton;

    @FindBy(xpath = WorkflowLocators.RUN_WF_CONFIG_MODAL_FILES_LINK)
    private Link modalFilesLink;

    @FindBy(xpath = WorkflowLocators.RUN_WF_CONFIG_MODAL_SELECT_BUTTON)
    private Button modalSelectButton;

    @FindBy(xpath = WorkflowLocators.RUN_WF_BUTTON)
    private Button runWorkflowButton;

    @FindBy(xpath = WorkflowLocators.RUN_WF_CONFIG_ANALYSIS_NAME_INPUT)
    private TextInput analysisNameInput;

    public RunWorkflowConfigPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(WorkflowLocators.RUN_WF_CONFIG_ANALISYS_NAME_INPUT));
    }

    public TextInput getAnalysisNameInput() {
        return analysisNameInput;
    }

    public Button getRunWorkflowButton() {
        return runWorkflowButton;
    }

    public Button getModalSelectButton() {
        return modalSelectButton;
    }

    public Link getModalFilesLink() {
        return modalFilesLink;
    }

    public Button getSelectFileButton() {
        return selectFileButton;
    }

    public boolean isAppInputDisplayed(AppProfile appProfile) {
        String xpath = WorkflowLocators.RUN_WF_CONFIG_APP_INPUT_TEMPLATE.replace("{APP_NAME}", appProfile.getCurRevNameText());
        return isElementPresent(By.xpath(xpath), 5);
    }

    public RunWorkflowConfigPage clickSelectFile() {
        log.info("click select file");
        waitUntilDisplayed(getSelectFileButton());
        getSelectFileButton().click();
        waitUntilDisplayed(getModalFilesLink(), 30);
        return new RunWorkflowConfigPage(getDriver());
    }

    public void clickFilesOnModal() {
        waitUntilDisplayed(getModalFilesLink(), 1);
        getModalFilesLink().click();
    }

    public void selectFileInModal(String fileName) {
        String xpath = WorkflowLocators.RUN_WF_CONFIG_MODAL_APP_INPUT_FILE_TEMPLATE.replace("{FILE_NAME}", fileName);
        By we = By.xpath(xpath);
        waitUntilDisplayed(we, 10);
        getDriver().findElement(we).click();
    }

    public RunWorkflowConfigPage clickSelectOnModal() {
        log.info("click Select on modal dialog");
        waitUntilDisplayed(getModalSelectButton());
        getModalSelectButton().click();
        return new RunWorkflowConfigPage(getDriver());
    }

    public boolean isSelectedFileDisplayed(String fileName) {
        String xpath = WorkflowLocators.RUN_WF_CONFIG_SELECTED_INPUT_FILE_TEMPLATE.replace("{FILE_NAME}", fileName);
        return isElementPresent(By.xpath(xpath), 15);
    }

    public CreatedWorkflowPage clickRunWorkflow() {
        log.info("click Run Workflow");
        waitUntilDisplayed(getRunWorkflowButton());
        sleep(1000);
        getRunWorkflowButton().click();
        return new CreatedWorkflowPage(getDriver());
    }

    public void enterAnalysisName(String analysisName) {
        getAnalysisNameInput().clear();
        getAnalysisNameInput().sendKeys(analysisName);
    }


}
