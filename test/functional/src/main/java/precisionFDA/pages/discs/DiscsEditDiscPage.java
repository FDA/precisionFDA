package precisionFDA.pages.discs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.DiscsLocators;
import precisionFDA.locators.NotesLocators;
import precisionFDA.model.DiscProfile;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;

public class DiscsEditDiscPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = DiscsLocators.DISCS_EDIT_DISC_EDITOR_AREA)
    private WebElement discEditorWE;

    @FindBy(xpath = DiscsLocators.EDIT_DISC_TITLE)
    private TextInput discTitle;

    @FindBy(xpath = DiscsLocators.EDIT_DISC_CONTENT)
    private WebElement discContent;

    @FindBy(xpath = DiscsLocators.EDIT_DISC_SAVE_BUTTON_LINK)
    private Link saveButtonLink;

    @FindBy(xpath = DiscsLocators.EDIT_DISC_ATTACH_BUTTON)
    private Button attachButton;

    @FindBy(xpath = DiscsLocators.EDIT_DISC_ATTACH_MODAL_FILES_TAB)
    private WebElement attachModalFilesTab;

    @FindBy(xpath = DiscsLocators.EDIT_DISC_ATTACH_MODAL_SELECT_BUTTON)
    private WebElement attachModalSelectButton;

    public DiscsEditDiscPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(NotesLocators.NOTES_EDIT_NOTE_EDIT_TAB));
    }

    public WebElement getAttachModalSelectButton() {
        return attachModalSelectButton;
    }

    public WebElement getAttachModalFilesTab() {
        return attachModalFilesTab;
    }

    public Button getAttachButton() {
        return attachButton;
    }

    public Link getSaveButtonLink() {
        return saveButtonLink;
    }

    public TextInput getDiscTitle() {
        return discTitle;
    }

    public WebElement getDiscContent() {
        return discContent;
    }

    public WebElement getDiscEditorWE() {
        return discEditorWE;
    }

    public boolean isEditorDisplayed() {
        return isElementPresent(getDiscEditorWE());
    }

    public void fillDiscForm(DiscProfile discProfile) {
        log.info("fill discussion form");
        getDiscTitle().clear();
        getDiscTitle().sendKeys(discProfile.getDiscName());
        getDiscContent().clear();
        getDiscContent().sendKeys(discProfile.getDiscRowDescr());
    }

    public DiscsEditDiscPage clickSave() {
        log.info("click Save");
        isElementPresent(getSaveButtonLink(), 5);
        getSaveButtonLink().click();
        return new DiscsEditDiscPage(getDriver());
    }

    public DiscsPage openDiscsPage() {
        return getCommonPage().openDiscsPage();
    }

    public By getFileLinkOnModal(String fileName) {
        String xpath = DiscsLocators.EDIT_DISC_ATTACH_MODAL_FILE_LINK_TEMPLATE.replace("{FILE_NAME}", fileName);
        return By.xpath(xpath);
    }

    public WebElement getFileCheckboxOnModal(String fileName) {
        String xpath = DiscsLocators.EDIT_DISC_ATTACH_MODAL_FILE_CHECKBOX_TEMPLATE.replace("{FILE_NAME}", fileName);
        return getDriver().findElement(By.xpath(xpath));
    }

    public DiscsEditDiscPage attachFile(String fileName) {
        log.info("attach file");
        isElementPresent(getAttachButton(), 5);
        getAttachButton().click();
        waitUntilDisplayed(getAttachModalFilesTab(), 10);
        getAttachModalFilesTab().click();
        waitUntilDisplayed(getFileLinkOnModal(fileName), 30);
        getFileCheckboxOnModal(fileName).click();
        isElementPresent(getAttachModalSelectButton(), 5);
        getAttachModalSelectButton().click();
        return new DiscsEditDiscPage(getDriver());
    }

    public boolean isAttachedFileDisplayed(String fileName) {
        return isElementPresent(getAttachedFileLink(fileName), 5);
    }

    public By getAttachedFileLink(String fileName) {
        String xpath = DiscsLocators.EDIT_DISC_ATTACHED_FILE_LINK_TEMPLATE.replace("{FILE_NAME}", fileName);
        return By.xpath(xpath);
    }

}
