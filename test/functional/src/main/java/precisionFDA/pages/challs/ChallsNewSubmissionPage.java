package precisionFDA.pages.challs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.ChallsLocators;
import precisionFDA.model.ChallEntryProfile;
import precisionFDA.pages.AbstractPage;
import precisionFDA.pages.files.FilesPublishPage;
import precisionFDA.utils.Utils;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.TextInput;

import static precisionFDA.data.TestChallsData.getTestChallAppInputFileFieldName1;

public class ChallsNewSubmissionPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ChallsLocators.SUBMIT_NEW_ENTRY_NAME_INPUT)
    private TextInput newEntryNameInput;

    @FindBy(xpath = ChallsLocators.SUBMIT_NEW_ENTRY_DESCR_INPUT)
    private TextInput newEntryDescrInput;

    @FindBy(xpath = ChallsLocators.SUBMIT_NEW_ENTRY_MODAL_FILES_TAB)
    private WebElement modalFilesTab;

    @FindBy(xpath = ChallsLocators.SUBMIT_NEW_ENTRY_MODAL_SUBMIT_BUTTON)
    private Button modalSubmitButton;

    @FindBy(xpath = ChallsLocators.SUBMIT_NEW_ENTRY_SUBMIT_BUTTON)
    private Button submitButton;

    public Button getSubmitButton() {
        return submitButton;
    }

    public Button getModalSubmitButton() {
        return modalSubmitButton;
    }

    public WebElement getModalFilesTab() {
        return modalFilesTab;
    }

    public TextInput getNewEntryNameInput() {
        return newEntryNameInput;
    }

    public TextInput getNewEntryDescrInput() {
        return newEntryDescrInput;
    }

    public ChallsNewSubmissionPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ChallsLocators.SUBMIT_NEW_ENTRY_NAME_INPUT));
    }

    public void fillNewChallSubmissionPage(ChallEntryProfile entryProfile) {
        log.info("fill New Challenge Submission page");
        getNewEntryNameInput().sendKeys(entryProfile.getEntryName());
        getNewEntryDescrInput().sendKeys(entryProfile.getEntryDescr());
    }

    public WebElement getSelectInputFile1Button() {
        return getDriver().findElement(By.xpath("//button[@name='" + getTestChallAppInputFileFieldName1() + "']"));
    }

    public void clickSelectFile1() {
        WebElement button = getSelectInputFile1Button();
        waitUntilDisplayed(button, 3);
        button.click();
        waitUntilDisplayed(getModalFilesTab(), 10);
    }

    public boolean isSelectInputPopupDisplayed() {
        return isElementPresent(getModalFilesTab(), 1);
    }

    public void clickFilesOnModal() {
        waitUntilDisplayed(getModalFilesTab(), 1);
        getModalFilesTab().click();
    }

    public void selectFileInModal(String fileName) {
        String xpath = ChallsLocators.SUBMIT_NEW_ENTRY_MODAL_FILE_RB_TEMPLATE.replace("{FILE_NAME}", fileName);
        By we = By.xpath(xpath);
        waitUntilDisplayed(we, 1);
        getDriver().findElement(we).click();
    }

    public boolean isFileOnModalDisplayed(String fileName) {
        String xpath = ChallsLocators.SUBMIT_NEW_ENTRY_MODAL_FILE_NAME_TEMPLATE.replace("{FILE_NAME}", fileName);
        By we = By.xpath(xpath);
        return isElementPresent(we, 30);
    }

    public ChallsNewSubmissionPage clickSelectOnModal() {
        log.info("click Select on modal dialog");
        waitUntilDisplayed(getModalSubmitButton());
        getModalSubmitButton().click();
        return new ChallsNewSubmissionPage(getDriver());
    }

    public boolean isFileAttached(String fileName) {
        String xpath = ChallsLocators.SUBMIT_NEW_ENTRY_ATTACHED_FILE_TEMPLATE.replace("{FILE_NAME}", fileName);
        return isElementPresent(By.xpath(xpath), 2);
    }

    public FilesPublishPage clickSubmit() {
        log.info("click Submit entry");
        Utils.sleep(3000);
        getSubmitButton().click();
        return new FilesPublishPage(getDriver());
    }





}
