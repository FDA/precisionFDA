package precisionFDA.pages.files;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.TextInput;
import precisionFDA.locators.FilesLocators;
import precisionFDA.pages.AbstractPage;
import precisionFDA.utils.SettingsProperties;

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

    public WebElement getFilesBrowseFilesVisibleForm() {
        return filesBrowseFilesVisibleForm;
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
        return isElementPresent(getFilesBrowseFilesVisibleForm());
    }

    public FilesAddFilesPage browseFileToUpload(String fileName) {
        log.info("select file to upload");

        String textFilePath = System.getProperty("user.dir") + SettingsProperties.getProperty("pathToTempFiles") + fileName;

        browseFile(textFilePath);
        return new FilesAddFilesPage(getDriver());
    }

    public void browseFile(String filePath) {
        TextInput input = getFilesBrowseFilesInput();
        input.sendKeys(filePath);
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

    public FilesPage openRootFilesPage() {
        return getCommonPage().openFilesPage();
    }

}
