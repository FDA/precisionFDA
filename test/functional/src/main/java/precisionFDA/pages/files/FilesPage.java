package precisionFDA.pages.files;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;
import precisionFDA.locators.FilesLocators;
import precisionFDA.pages.AbstractPage;

import java.util.List;

import static precisionFDA.utils.Utils.sleep;

public class FilesPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = FilesLocators.FILES_MY_FILES_LINK)
    private Link filesMyFilesLink;

    @FindBy(xpath = FilesLocators.FILES_FEATURED_LINK)
    private Link filesFeaturedLink;

    @FindBy(xpath = FilesLocators.FILES_EXPLORE_LINK)
    private Link filesExploreLink;

    @FindBy(xpath = FilesLocators.FILES_ADD_FILES_BUTTON_LINK)
    private Link filesAddFilesButtonLink;

    @FindBy(xpath = FilesLocators.FILES_CREATE_FOLDER_BUTTON)
    private WebElement filesCreateFolderButton;

    @FindBy(xpath = FilesLocators.FILES_CREATE_FOLDER_FORM_CREATE_BUTTON)
    private Button createFolderFormCreateButton;

    @FindBy(xpath = FilesLocators.FILES_CREATE_FOLDER_FORM_NAME_INPUT)
    private TextInput createFolderFormNameInput;

    @FindBy(xpath = FilesLocators.FILES_SUCCESS_ALERT)
    private WebElement successAlertWE;

    @FindBy(xpath = FilesLocators.FILES_BREADCRUMBS)
    private WebElement breadcrumbs;

    @FindBy(xpath = FilesLocators.FILES_FILTER_NAME_INPUT)
    private TextInput filterNameInput;

    @FindBy(xpath = FilesLocators.FILES_FILTER_ICON)
    private WebElement filterIcon;

    public FilesPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_ADD_FILES_BUTTON_LINK));
        //waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_CREATE_FOLDER_BUTTON));
        sleep(1000);
    }

    public Link getFilesMyFilesLink() {
        return filesMyFilesLink;
    }

    public Link getFilesAddFilesButtonLink() {
        return filesAddFilesButtonLink;
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

    public WebElement getBreadcrumbs() {
        return breadcrumbs;
    }

    public Button getCreateFolderFormCreateButton() {
        return createFolderFormCreateButton;
    }

    public TextInput getFilterNameInput() {
        return filterNameInput;
    }

    public WebElement getFilterIcon() {
        return filterIcon;
    }

    public WebElement getFilesCreateFolderButton() {
        return filesCreateFolderButton;
    }

    public boolean isBreadcrumbDisplayed() {
        return isElementPresent(getBreadcrumbs(), 2);
    }

    public String getDisplayedBreadcrumbsText() {
        isElementPresent(getBreadcrumbs());
        List<WebElement> chains = getDriver().findElements(By.xpath(FilesLocators.FILES_BREADCRUMB_CHAIN));
        String br = "";
        if (!chains.isEmpty()) {
            for (int i = 0; i <= chains.size() - 1; i ++) {
                br = br + chains.get(i).getText();
                if (i < chains.size() - 1) {
                    br = br + " / ";
                }
            }
        }
        else {
            br = "breadcrumbs are not displayed";
        }
        return br;
    }

    public FilesMyFilesPage openFilesMyFilesPage() {
        log.info("open Files.MyFiles page");
        Link link = getFilesMyFilesLink();
        waitUntilClickable(link);
        link.click();
        return new FilesMyFilesPage(getDriver());
    }

    public FilesFeaturedPage openFilesFeaturedPage() {
        log.info("open Files.Featured page");
        Link link = getFilesFeaturedLink();
        waitUntilClickable(link);
        link.click();
        return new FilesFeaturedPage(getDriver());
    }

    public FilesExplorePage openFilesExplorePage() {
        log.info("open Files.Explore page");
        Link link = getFilesExploreLink();
        waitUntilClickable(link);
        link.click();
        return new FilesExplorePage(getDriver());
    }

    public FilesAddFilesPage openFilesAddFilesPage() {
        log.info("opening Files.AddFiles page");
        Link link = getFilesAddFilesButtonLink();
        waitUntilClickable(link);
        link.click();
        return new FilesAddFilesPage(getDriver());
    }

    public boolean isMyFilesLinkDisplayed() {
        return isElementPresent(getFilesMyFilesLink());
    }

    public WebElement getUploadedFileLink(String fileName) {
        WebElement fileLink = null;
        List<WebElement> allLinks = getDriver().findElements(By.xpath(FilesLocators.FILES_COMMON_LINK_TO_UPLOADED_FILE));
        if (allLinks.size() > 0) {
            for (WebElement we : allLinks) {
                if (we.getText().contains(fileName)) {
                    fileLink = we;
                    break;
                }
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
            return isElementPresent(fileLink, 1);
        }
    }

    public UploadedFilePage openUploadedFile(String fileName) {
        log.info("open uploaded file page");
        WebElement file = getUploadedFileLink(fileName);
        file.click();
        return new UploadedFilePage(getDriver());
    }

    public FilesPage createFolder(String folderName) {
        log.info("create new folder");
        WebElement we1 = getFilesCreateFolderButton();
        waitUntilDisplayed(we1);
        we1.click();
        Button we2 = getCreateFolderFormCreateButton();
        waitUntilClickable(we2);
        getCreateFolderFormNameInput().sendKeys(folderName);
        we2.click();
        log.info("created folder: " + folderName);
        return new FilesPage(getDriver());
    }

    public boolean isCreateFolderButtonDisplayed() {
        sleep(1000);
        return isElementPresent(getFilesCreateFolderButton(), 1);
    }

    public boolean isAddFilesButtonDisplayed() {
        return isElementPresent(getFilesAddFilesButtonLink(), 2);
    }

    public boolean isLinkToCreatedFolderDisplayed(String folderName) {
        WebElement folderLink = getCreatedFolderLink(folderName);
        if (folderLink == null) {
            return false;
        }
        else {
            return isElementPresent(folderLink, 1);
        }
    }

    public FilesPage openFolder(String folderName) {
        log.info("open folder");
        WebElement folder = getCreatedFolderLink(folderName);
        folder.click();
        return new FilesPage(getDriver());
    }

    public boolean isSuccessMessageDisplayed() {
        return isElementPresent(getSuccessAlertWE());
    }

    public String getSuccessMessageText() {
        return getSuccessAlertWE().getText();
    }

    public FilesPage filterByName(String name) {
        log.info("filter by name");
        getFilterNameInput().clear();
        getFilterNameInput().sendKeys(name);
        getFilterIcon().click();
        waitUntilScriptsReady();
        return new FilesPage(getDriver());
    }

    public boolean isCorrectSelectionByNameDisplayed(String name) {
        boolean res = true;
        List<WebElement> allLinks = getDriver().findElements(By.xpath(FilesLocators.FILES_COMMON_LINK));
        if (!allLinks.isEmpty()) {
            for (WebElement we : allLinks) {
                if (!we.getText().toLowerCase().contains(name.toLowerCase())) {
                    res = false;
                    log.error("[" + we.getText() + "] does not contain [" + name + "]");
                    break;
                }
            }
        }
        else {
            res = false;
            log.error("selection is empty");
        }
        return res;
    }

    public int getNumberOfDisplayedItems() {
        List<WebElement> allLinks = getDriver().findElements(By.xpath(FilesLocators.FILES_COMMON_LINK));
        return allLinks.size();
    }

    public FilesPage clickBreadcrumbMyFiles() {
        log.info("click My Files in breadcrumbs");
        List<WebElement> chains = getDriver().findElements(By.xpath(FilesLocators.FILES_BREADCRUMB_CHAIN));
        chains.get(0).click();
        return new FilesPage(getDriver());
    }

    public FilesPage clickBreadcrumbFirstLevel() {
        log.info("click first level folder in breadcrumbs");
        List<WebElement> chains = getDriver().findElements(By.xpath(FilesLocators.FILES_BREADCRUMB_CHAIN));
        chains.get(1).click();
        return new FilesPage(getDriver());
    }

}
