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

import static precisionFDA.utils.TestRunConfig.getPathToTempFilesFolder;

public class FilesAddFilesPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = FilesLocators.FILES_BROWSE_FILES_INPUT)
    private TextInput filesBrowseFilesInput;

    @FindBy(xpath = FilesLocators.FILES_BROWSE_FILES_VISIBLE_FORM)
    private WebElement filesBrowseFilesVisibleForm;

    @FindBy(xpath = FilesLocators.FILES_UPLOAD_ALL_BUTTON)
    private Button filesUploadAllButton;

    @FindBy(xpath = FilesLocators.FILES_UPLOAD_PREVIEW_FILE_NAME_COMMON)
    private WebElement fileToUploadPreviewName;

    @FindBy(xpath = FilesLocators.FILES_UPLOADS_COMPLETE_MESSAGE)
    private WebElement filesUploadsCompleteMessageWE;

    @FindBy(xpath = FilesLocators.FILES_UPLOAD_RESTART_BUTTON)
    private Button filesUploadRestartButton;

    public FilesAddFilesPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_BROWSE_FILES_VISIBLE_FORM));
    }

    public Button getFilesUploadRestartButton() {
        return filesUploadRestartButton;
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

        String textFilePath = getPathToTempFilesFolder() + fileName;

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

    public FilesAddFilesPage clickRestart() {
        log.info("click Restart");
        isElementPresent(getFilesUploadRestartButton(), 5);
        getFilesUploadRestartButton().click();
        return new FilesAddFilesPage(getDriver());
    }

    public UploadedFilePage openUploadedFile(String fileName) {
        log.info("open uploaded file page");
        By fileBy = getUploadedFileLinkBy(fileName);
        WebElement fileWE = getDriver().findElement(fileBy);
        fileWE.click();
        return new UploadedFilePage(getDriver());
    }

    public By getUploadedFileLinkBy(String fileName) {
        String xpath = FilesLocators.FILES_UPLOAD_PREVIEW_FILE_NAME_TEMPLATE.replace("{FILE_NAME}", fileName);
        return By.xpath(xpath);
    }

}
