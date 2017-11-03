package staging.pages.files;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.locators.FilesLocators;
import staging.pages.AbstractPage;

import java.util.List;

public class FilesPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = FilesLocators.FILES_MY_FILES_LINK)
    private Link filesMyFilesLink;

    @FindBy(xpath = FilesLocators.FILES_FEATURED_LINK)
    private Link filesFeaturedLink;

    @FindBy(xpath = FilesLocators.FILES_EXPLORE_LINK)
    private Link filesExploreLink;

    @FindBy(xpath = FilesLocators.FILES_ADD_FILES_LINK)
    private Link filesAddFilesLink;

    @FindBy(xpath = FilesLocators.FILES_CREATE_FOLDER_BUTTON)
    private WebElement filesCreateFolderButton;

    @FindBy(xpath = FilesLocators.FILES_CREATE_FOLDER_FORM_CREATE_BUTTON)
    private WebElement createFolderFormCreateButton;

    @FindBy(xpath = FilesLocators.FILES_CREATE_FOLDER_FORM_NAME_INPUT)
    private TextInput createFolderFormNameInput;

    @FindBy(xpath = FilesLocators.FILES_SUCCESS_ALERT)
    private WebElement successAlertWE;

    public FilesPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_MY_FILES_LINK));
    }

    public Link getFilesMyFilesLink() {
        return filesMyFilesLink;
    }

    public Link getFilesAddFilesLink() {
        return filesAddFilesLink;
    }

    public Link getFilesExploreLink() {
        return filesExploreLink;
    }

    public Link getFilesFeaturedLink() {
        return filesFeaturedLink;
    }

    public WebElement getSuccessAlertWE() {
        return successAlertWE;
    }

    public TextInput getCreateFolderFormNameInput() {
        return createFolderFormNameInput;
    }

    public WebElement getCreateFolderFormCreateButton() {
        return createFolderFormCreateButton;
    }

    public WebElement getFilesCreateFolderButton() {
        return filesCreateFolderButton;
    }

    public FilesMyFilesPage openFilesMyFilesPage() {
        log.info("open Files.MyFiles page");
        getFilesMyFilesLink().click();
        return new FilesMyFilesPage(getDriver());
    }

    public FilesFeaturedPage openFilesFeaturedPage() {
        log.info("open Files.Featured page");
        getFilesFeaturedLink().click();
        return new FilesFeaturedPage(getDriver());
    }

    public FilesExplorePage openFilesExplorePage() {
        log.info("open Files.Explore page");
        getFilesExploreLink().click();
        return new FilesExplorePage(getDriver());
    }

    public FilesAddFilesPage openFilesAddFilesPage() {
        log.info("opening Files.AddFiles page");
        getFilesAddFilesLink().click();
        return new FilesAddFilesPage(getDriver());
    }

    public boolean isMyFilesLinkDisplayed() {
        return isElementPresent(getFilesMyFilesLink());
    }

    public WebElement getUploadedFileLink(String fileName) {
        WebElement fileLink = null;
        List<WebElement> allLinks = getDriver().findElements(By.xpath(FilesLocators.FILES_COMMON_LINK_TO_UPLOADED_FILE));
        for (WebElement we : allLinks) {
            if (we.getText().contains(fileName)) {
                fileLink = we;
                break;
            }
        }
        return fileLink;
    }

    public WebElement getCreatedFolderLink(String folderName) {
        WebElement folderLink = null;
        List<WebElement> allLinks = getDriver().findElements(By.xpath(FilesLocators.FILES_COMMON_LINK_TO_CREATED_FOLDER));
        for (WebElement we : allLinks) {
            if (we.getText().contains(folderName)) {
                folderLink = we;
                break;
            }
        }
        return folderLink;
    }

    public boolean isLinkToUploadedFileDisplayed(String fileName) {
        WebElement fileLink = getUploadedFileLink(fileName);
        if (fileLink == null) {
            return false;
        }
        else {
            return isElementPresent(fileLink);
        }
    }

    public UploadedFilePage openUploadedFile(String fileName) {
        log.info("open uploaded file page");
        getUploadedFileLink(fileName).click();
        return new UploadedFilePage(getDriver());
    }

    public FilesPage createFolder(String folderName) {
        log.info("create new folder");
        getFilesCreateFolderButton().click();
        waitUntilDisplayed(getCreateFolderFormCreateButton());
        getCreateFolderFormNameInput().sendKeys(folderName);
        getCreateFolderFormCreateButton().click();
        log.info("created folder: " + folderName);
        return new FilesPage(getDriver());
    }

    public boolean isLinkToCreatedFolderDisplayed(String folderName) {
        WebElement folderLink = getCreatedFolderLink(folderName);
        if (folderLink == null) {
            return false;
        }
        else {
            return isElementPresent(folderLink);
        }
    }

    public FilesPage openFolder(String folderName) {
        log.info("open folder");
        getCreatedFolderLink(folderName).click();
        return new FilesPage(getDriver());
    }

    public boolean isSuccessMessageDisplayed() {
        return isElementPresent(getSuccessAlertWE());
    }

    public String getSuccessMessageText() {
        return getSuccessAlertWE().getText();
    }

}
