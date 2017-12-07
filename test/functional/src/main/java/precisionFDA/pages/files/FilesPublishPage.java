package precisionFDA.pages.files;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.FilesLocators;
import precisionFDA.pages.AbstractPage;
import precisionFDA.pages.challs.ChallsCreatedChallPage;
import ru.yandex.qatools.htmlelements.element.Button;

public class FilesPublishPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = FilesLocators.FILES_PUBLISH_PAGE_PUBLISH_OBJ_BUTTON)
    private Button publishObjectsButton;

    @FindBy(xpath = FilesLocators.FILES_PUBLISH_PAGE_FILE_NAME)
    private WebElement fileToPublishNameWE;

    public FilesPublishPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_PUBLISH_PAGE_PUBLISH_OBJ_BUTTON));
    }

    public Button getPublishObjectsButton() {
        return publishObjectsButton;
    }

    public WebElement getFileToPublishNameWE() {
        return fileToPublishNameWE;
    }

    public String getFileToPublishNameText() {
        return getFileToPublishNameWE().getText();
    }

    public UploadedFilePage clickPublishObjects() {
        log.info("click Publish Objects");
        waitUntilClickable(getPublishObjectsButton());
        getPublishObjectsButton().click();
        return new UploadedFilePage(getDriver());
    }

    public ChallsCreatedChallPage clickPublishObjectsViaEntrySubmit() {
        log.info("click Publish Objects");
        waitUntilClickable(getPublishObjectsButton());
        getPublishObjectsButton().click();
        return new ChallsCreatedChallPage(getDriver());
    }
}
