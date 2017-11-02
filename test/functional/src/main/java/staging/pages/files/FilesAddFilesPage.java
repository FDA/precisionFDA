package staging.pages.files;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.locators.FilesLocators;
import staging.pages.AbstractPage;
import staging.utils.SettingsProperties;

import static staging.utils.Utils.getTestTextFileName;

public class FilesAddFilesPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = FilesLocators.FILES_BROWSE_FILES_INPUT)
    private TextInput filesBrowseFilesInput;

    @FindBy(xpath = FilesLocators.FILES_BROWSE_FILES_VISIBLE_FORM)
    private WebElement filesBrowseFilesVisibleForm;

    @FindBy(xpath = FilesLocators.FILES_UPLOAD_ALL_BUTTON)
    private Button filesUploadAllButton;

    @FindBy(xpath = FilesLocators.FILES_UPLOAD_PREVIEW_FILE_NAME)
    private WebElement fileToUploadPreviewName;

    @FindBy(xpath = FilesLocators.FILES_UPLOADS_COMPLETE_MESSAGE)
    private WebElement filesUploadsCompleteMessageWE;

    public FilesAddFilesPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_BROWSE_FILES_VISIBLE_FORM));
    }

    public TextInput getFilesBrowseFilesInput() {
        return filesBrowseFilesInput;
    }

    public Button getFilesUploadAllButton() {
        return filesUploadAllButton;
    }

    public WebElement getFileToUploadPreviewNameWE() {
        return fileToUploadPreviewName;
    }

    public WebElement getFilesUploadsCompleteMessageWE() {
        return filesUploadsCompleteMessageWE;
    }

    public boolean isBrowseFilesButtonDisplayed() {
        return isElementPresent(getFilesBrowseFilesInput());
    }

    public FilesAddFilesPage browseFileToUpload(String fileName) {
        log.info("select file to upload");

        String textFilePath = System.getProperty("user.dir") + SettingsProperties.getProperty("pathToTempFiles") + fileName;

        browseFile(textFilePath);
        return new FilesAddFilesPage(getDriver());
    }

    public void browseFile(String filePath) {
        getFilesBrowseFilesInput().sendKeys(filePath);
        waitUntilDisplayed(getFilesUploadAllButton());
    }

    public String getFileToUploadPreviewNameText() {
        return getFileToUploadPreviewNameWE().getText();
    }

    public FilesAddFilesPage uploadAllFiles() {
        log.info("upload all files");
        getFilesUploadAllButton().click();
        waitUntilDisplayed(getFilesUploadsCompleteMessageWE(), 120);
        return new FilesAddFilesPage(getDriver());
    }

    public boolean isUploadsCompleteDisplayed() {
        return isElementPresent(getFilesUploadsCompleteMessageWE());
    }

}
