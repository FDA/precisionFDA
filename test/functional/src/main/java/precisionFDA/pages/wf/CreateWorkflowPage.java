package precisionFDA.pages.wf;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.FilesLocators;
import precisionFDA.locators.WorkflowLocators;
import precisionFDA.model.AppProfile;
import precisionFDA.model.FolderProfile;
import precisionFDA.model.WorkflowProfile;
import precisionFDA.pages.AbstractPage;
import precisionFDA.pages.files.FilesAddFilesPage;
import precisionFDA.pages.files.FilesFeaturedPage;
import precisionFDA.pages.files.FilesMyFilesPage;
import precisionFDA.pages.files.UploadedFilePage;
import precisionFDA.pages.spaces.SpaceDetailsPage;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;

import java.util.List;

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

    public CreateWorkflowPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(WorkflowLocators.ADD_STAGE_BUTTON));
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
        waitUntilDisplayed(By.xpath(xpath), 60);
        if (!isElementPresent(By.xpath(xpath), 1)) {
            log.warn("it looks like revisions are not uploaded");
        }
    }

    public CreateWorkflowPage clickCloseAddStageModal() {
        log.info("click Close Add Stage Modal");
        getModalAddStageCloseButton().click();
        return new CreateWorkflowPage(getDriver());
    }

    public boolean isAppBlockDisplayed(AppProfile appProfile) {
        String xpath = WorkflowLocators.WORKFLOW_APP_BLOCK_LINK.replace("{APP_NAME}", appProfile.getCurRevNameText());
        WebElement el = getDriver().findElement(By.xpath(xpath));
        return el.isDisplayed();
    }

}
