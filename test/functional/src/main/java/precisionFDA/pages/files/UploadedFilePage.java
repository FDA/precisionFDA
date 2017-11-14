package precisionFDA.pages.files;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.model.FilesProfile;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.data.TestUserData;
import precisionFDA.locators.FilesLocators;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.TextInput;

import static precisionFDA.data.TestDict.getDictPrivate;
import static precisionFDA.data.TestRunData.getDockerFileName;
import static precisionFDA.data.TestRunData.getPathToDownloadsFolder;
import static precisionFDA.utils.Utils.generateUpdatedName;

public class UploadedFilePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = FilesLocators.FILES_DOWNLOAD_FILE_LINK)
    private Link downloadFileLink;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_PAGE_TITLE)
    private WebElement filePageTitle;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_ADDED_BY)
    private Link addedByLink;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_ACCESS_VALUE)
    private WebElement uploadedFileAccessValue;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_EDIT_DD)
    private Button uploadedFileEditDD;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_EDIT_DELETE_ITEM)
    private Link uploadedFileEditDeleteItem;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_EDIT_ITEM)
    private Link uploadedFileEditItem;

    @FindBy(xpath = FilesLocators.FILES_EDIT_FILE_FORM_NAME_INPUT)
    private TextInput editFileFormNameInput;

    @FindBy(xpath = FilesLocators.FILES_EDIT_FILE_FORM_SAVE_BUTTON)
    private Button editFileFormSaveButton;

    @FindBy(xpath = FilesLocators.FILES_EDIT_FILE_FORM_DESCR_TEXTAREA)
    private TextInput editFileFormDescrTextarea;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_PAGE_DESCRIPTION)
    private WebElement uploadedFileDescriptionWE;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_COMMENT_TEXTAREA)
    private TextInput uploadedFileCommentTextarea;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_COMMENT_SUBMIT_BUTTON)
    private WebElement uploadedFileCommentSubmitButton;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_SAVED_COMMENT_TEXT)
    private WebElement uploadedFileSavedCommentWE;

    UserProfile getTestUser() {
        return TestUserData.getTestUser();
    }

    public UploadedFilePage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_UPLOADED_FILE_ACCESS_VALUE));
    }

    public Link getDownloadFileLink() {
        return downloadFileLink;
    }

    public WebElement getFilePageTitle() {
        return filePageTitle;
    }

    public Link getAddedByLink() {
        return addedByLink;
    }

    public WebElement getUploadedFileAccessValueWE() {
        return uploadedFileAccessValue;
    }

    public String getAddedByText() {
        return getAddedByLink().getText();
    }

    public String getUploadedFileAccessValueText() {
        return getUploadedFileAccessValueWE().getText();
    }

    public Button getUploadedFileEditDD() {
        return uploadedFileEditDD;
    }

    public Link getUploadedFileEditDeleteItem() {
        return uploadedFileEditDeleteItem;
    }

    public Link getUploadedFileEditItem() {
        return uploadedFileEditItem;
    }

    public TextInput getEditFileFormNameInput() {
        return editFileFormNameInput;
    }

    public Button getEditFileFormSaveButton() {
        return editFileFormSaveButton;
    }

    public TextInput getEditFileFormDescrTextarea() {
        return editFileFormDescrTextarea;
    }

    public TextInput getUploadedFileCommentTextarea() {
        return uploadedFileCommentTextarea;
    }

    public WebElement getUploadedFileSavedCommentWE() {
        return uploadedFileSavedCommentWE;
    }

    public WebElement getUploadedFileDescriptionWE() {
        return uploadedFileDescriptionWE;
    }

    public WebElement getUploadedFileCommentSubmitButton() {
        return uploadedFileCommentSubmitButton;
    }

    public String getUploadedFileDescriptionText() {
        return getUploadedFileDescriptionWE().getText().trim();
    }

    public String getUploadedFileSavedCommentText() {
        return getUploadedFileSavedCommentWE().getText().trim();
    }

    public String getFilePageTitleText() {
            return getFilePageTitle().getText().trim();
    }

    public boolean isPageTitleCorrect(String fileName) {
        String actTitle = getFilePageTitle().getText();
        if (actTitle.contains(fileName)) {
            return true;
        }
        else {
            log.info("page title is: " + actTitle);
            return false;
        }
    }

    public boolean isAddedByCorrect() {
        String actAddedBy = getAddedByText();
        String expAddedBy = getTestUser().getApplUsername();
        if (actAddedBy.equals(expAddedBy)) {
            return true;
        }
        else {
            log.info("displayed is [" + actAddedBy + "] but expected [" + expAddedBy + "]");
            return false;
        }
    }

    public boolean isAccessPrivate() {
        String actValue = getUploadedFileAccessValueText();
        if (actValue.equalsIgnoreCase(getDictPrivate())) {
            return true;
        }
        else {
            log.info("displayed access is [" + actValue + "] but expected [" + getDictPrivate());
            return false;
        }
    }

    public boolean isDownloadFileLinkDisplayed() {
        UploadedFilePage uploadedFilePage = waitUntilDownloadFileLinkIsDisplayed();
        return isElementPresent(getDownloadFileLink());
    }

    public UploadedFilePage waitUntilDownloadFileLinkIsDisplayed() {
        int timeoutSec = 60;
        int refreshStepSec = 5;
        int spentTimeSec = 0;
        while ( !isElementPresent(getDownloadFileLink(), 1) && (spentTimeSec < timeoutSec) ) {
            sleep(refreshStepSec*1000);
            spentTimeSec = spentTimeSec + refreshStepSec;
            getDriver().navigate().refresh();
        }
        return new UploadedFilePage(getDriver());
    }

    public FilesPage deleteFile() {
        log.info("delete file");
        getUploadedFileEditDD().click();
        waitUntilDisplayed(By.xpath(FilesLocators.FILES_UPLOADED_FILE_EDIT_DELETE_ITEM));
        getUploadedFileEditDeleteItem().click();
        alertAccept(1, 100);
        return new FilesPage(getDriver());
    }

    public UploadedFilePage updateDescription(String descr) {
        log.info("update description");


        return new UploadedFilePage(getDriver());
    }

    public UploadedFilePage downloadFile() {
        log.info("download file");
        String fileName = getFilePageTitleText();
        getDownloadFileLink().click();
        waitUntilUploadedFileIsDownloaded(fileName);
        return new UploadedFilePage(getDriver());
    }

    public void waitUntilUploadedFileIsDownloaded(String fileName) {
        waitUntilFileIsDownloaded(getPathToDownloadsFolder() + fileName);
    }

    public UploadedFilePage renameFileOnFilePage(FilesProfile filesProfile) {
        log.info("rename the file");

        getUploadedFileEditDD().click();

        waitUntilDisplayed(By.xpath(FilesLocators.FILES_UPLOADED_FILE_EDIT_ITEM));
        getUploadedFileEditItem().click();

        waitUntilDisplayed(getEditFileFormNameInput(), 30);
        getEditFileFormNameInput().clear();
        String fileName = filesProfile.getFileInRoot();
        String newName = generateUpdatedName(fileName);
        getEditFileFormNameInput().sendKeys(newName);
        waitUntilClickable(getEditFileFormSaveButton());
        getEditFileFormSaveButton().click();

        filesProfile.setFileInRoot(newName);

        return new UploadedFilePage(getDriver());
    }

    public UploadedFilePage addFileDescription(FilesProfile filesProfile) {
        log.info("add file description");

        getUploadedFileEditDD().click();

        waitUntilDisplayed(By.xpath(FilesLocators.FILES_UPLOADED_FILE_EDIT_ITEM));
        getUploadedFileEditItem().click();

        waitUntilDisplayed(getEditFileFormDescrTextarea(), 30);
        getEditFileFormDescrTextarea().clear();
        getEditFileFormDescrTextarea().sendKeys(filesProfile.getFileInRootDescription());
        waitUntilClickable(getEditFileFormSaveButton());
        getEditFileFormSaveButton().click();

        return new UploadedFilePage(getDriver());
    }

    public UploadedFilePage leaveComment(String comment) {
        log.info("write a comment");
        getUploadedFileCommentTextarea().sendKeys(comment);
        waitUntilClickable(getUploadedFileCommentSubmitButton());
        getUploadedFileCommentSubmitButton().click();
        return new UploadedFilePage(getDriver());
    }


}
