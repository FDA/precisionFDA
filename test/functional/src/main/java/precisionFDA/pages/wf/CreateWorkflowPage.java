package precisionFDA.pages.wf;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.WorkflowLocators;
import precisionFDA.model.AppProfile;
import precisionFDA.model.WorkflowProfile;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.*;

import static precisionFDA.utils.Utils.*;

public class CreateWorkflowPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = WorkflowLocators.NEW_WF_FORM_NAME_INPUT)
    private TextInput nameInput;

    @FindBy(xpath = WorkflowLocators.NEW_WF_FORM_TITLE_INPUT)
    private TextInput titleInput;

    @FindBy(xpath = WorkflowLocators.ADD_STAGE_BUTTON)
    private Button addStageButton;

    @FindBy(xpath = WorkflowLocators.NEW_WF_ADD_STAGE_MODAL_FILTER_INPUT)
    private TextInput modalFilterInput;

    @FindBy(xpath = WorkflowLocators.NEW_WF_ADD_STAGE_ADD_LINK)
    private Link modalAddStageLink;

    @FindBy(xpath = WorkflowLocators.NEW_WF_ADD_STAGE_MODAL_CLOSE_BUTTON)
    private Button modalAddStageCloseButton;

    @FindBy(xpath = WorkflowLocators.WORKFLOW_APP_SETTINGS_MODAL_INSTANCE_SELECTOR)
    private Select appSettingsModalInstanceSelector;

    @FindBy(xpath = WorkflowLocators.WORKFLOW_APP_SETTINGS_MODAL_FIRST_INPUT_REQUIRED)
    private CheckBox appSettingsModalFirstInputRequired;

    @FindBy(xpath = WorkflowLocators.WORKFLOW_APP_SETTINGS_MODAL_CLOSE_BUTTON)
    private Button appSettingsModalCloseButton;

    @FindBy(xpath = WorkflowLocators.WORKFLOW_UPDATE_WF_BUTTON)
    private Button updateWorkflowButton;

    @FindBy(xpath = WorkflowLocators.WORKFLOW_CREATE_WF_BUTTON)
    private Button createWorkflowButton;

    public CreateWorkflowPage(final WebDriver driver) {
        super(driver);
        // waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(WorkflowLocators.ADD_STAGE_BUTTON));
    }

    public Button getCreateWorkflowButton() {
        return createWorkflowButton;
    }

    public Button getUpdateWorkflowButton() {
        return updateWorkflowButton;
    }

    public Button getAppSettingsModalCloseButton() {
        return appSettingsModalCloseButton;
    }

    public CheckBox getAppSettingsModalFirstInputRequired() {
        return appSettingsModalFirstInputRequired;
    }

    public Select getAppSettingsModalInstanceSelector() {
        return appSettingsModalInstanceSelector;
    }

    public Button getModalAddStageCloseButton() {
        return modalAddStageCloseButton;
    }

    public Link getModalAddStageLink() {
        return modalAddStageLink;
    }

    public TextInput getModalFilterInput() {
        return modalFilterInput;
    }

    public Button getAddStageButton() {
        return addStageButton;
    }

    public TextInput getNameInput() {
        return nameInput;
    }

    public TextInput getTitleInput() {
        return titleInput;
    }

    public void fillNewWorkflow(WorkflowProfile workflowProfile) {
        getNameInput().sendKeys(workflowProfile.getWfName());
        getTitleInput().sendKeys(workflowProfile.getWfTitle());
    }

    public CreateWorkflowPage clickAddStage() {
        log.info("click Add Stage");
        getAddStageButton().click();
        waitUntilDisplayed(getModalFilterInput());
        return new CreateWorkflowPage(getDriver());
    }

    public void addStageOnModal(AppProfile appProfile) {
        log.info("add stage: " + appProfile.getCurRevNameText());
        getModalFilterInput().sendKeys(appProfile.getCurRevNameText());
        waitUntilInputsDisplayed(appProfile.getCurRevNameText());
        getModalAddStageLink().click();
        sleep(2000);
    }

    public void waitUntilInputsDisplayed(String appName) {
        String xpath = WorkflowLocators.NEW_WF_ADD_STAGE_INPUTS_LABEL.replace("{APP_NAME}", appName);
        waitUntilDisplayed(By.xpath(xpath), 180);
        if (!isElementPresent(By.xpath(xpath), 1)) {
            log.warn("it looks like revisions are not uploaded");
        }
    }

    public CreateWorkflowPage clickCloseAddStageModal() {
        log.info("click Close Add Stage Modal");
        getModalAddStageCloseButton().click();
        sleep(3000);
        return new CreateWorkflowPage(getDriver());
    }

    public boolean isAppBlockDisplayed(AppProfile appProfile) {
        return isElementPresent(getAppBlockBy(appProfile), 5);
    }

    public By getAppBlockBy(AppProfile appProfile) {
        String xpath = WorkflowLocators.WORKFLOW_APP_BLOCK_LINK.replace("{APP_NAME}", appProfile.getCurRevNameText());
        return By.xpath(xpath);
    }

    public CreateWorkflowPage clickOnWorkflowBlock(AppProfile appProfile) {
        log.info("click on the app block");
        WebElement el = getDriver().findElement(getAppBlockBy(appProfile));
        waitUntilDisplayed(el, 10);
        el.click();
        waitUntilDisplayed(getAppSettingsModalInstanceSelector(), 30);
        return  new CreateWorkflowPage(getDriver());
    }

    public boolean isAppSettingsModalDisplayed() {
        return isElementPresent(getAppSettingsModalInstanceSelector(), 5);
    }

    public void setFirstInputAsRequired() {
        log.info("set first input as required");
        getAppSettingsModalFirstInputRequired().select();
    }

    public CreateWorkflowPage closeAppSettingsModal() {
        log.info("close app settings modal dialog");
        getAppSettingsModalCloseButton().click();
        return  new CreateWorkflowPage(getDriver());
    }

    public WorkflowsPage clickWorkflowUpdateButton() {
        log.info("click update workflow");
        waitUntilClickable(getUpdateWorkflowButton());
        getUpdateWorkflowButton().click();
        return new WorkflowsPage(getDriver());
    }

    public CreatedWorkflowPage clickWorkflowCreateButton() {
        log.info("click create workflow");
        waitUntilClickable(getCreateWorkflowButton());
        sleep(1000);
        getCreateWorkflowButton().click();
        return new CreatedWorkflowPage(getDriver());
    }

}
