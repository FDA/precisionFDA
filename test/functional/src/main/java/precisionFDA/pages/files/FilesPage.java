package precisionFDA.pages.files;

import org.apache.log4j.Logger;
import org.openqa.selenium.*;
import org.openqa.selenium.support.FindBy;
import precisionFDA.model.FolderProfile;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;
import precisionFDA.locators.FilesLocators;
import precisionFDA.pages.AbstractPage;

import java.util.List;

import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;
import static precisionFDA.utils.Utils.sleep;
import static precisionFDA.utils.Utils.waitUntilFileIsDownloaded;

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

    @FindBy(xpath = FilesLocators.FILES_EXPLORE_ACTIVATED_LINK)
    private Link filesExploreActivatedLink;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_EDIT_DD)
    private Button uploadedFileEditDD;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_EDIT_DELETE_ITEM)
    private Link uploadedFileEditDeleteItem;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_EDIT_DOWNLOAD_ITEM)
    private Link uploadedFileEditDownloadItem;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_EDIT_RENAME_ITEM)
    private Link uploadedFileEditRenameItem;

    @FindBy(xpath = FilesLocators.FILES_DELETE_DIALOG_ITEMS_TABLE)
    private WebElement deleteDialogItemsTable;

    @FindBy(xpath = FilesLocators.FILES_DOWNLOAD_DIALOG_ITEMS_TABLE)
    private WebElement downloadDialogItemsTable;

    @FindBy(xpath = FilesLocators.FILES_DELETE_DIALOG_DELETE_BUTTON)
    private Button deleteDialogDeleteButton;

    @FindBy(xpath = FilesLocators.FILES_RENAME_DIALOG_INPUT)
    private TextInput renameDialogInput;

    @FindBy(xpath = FilesLocators.FILES_RENAME_DIALOG_RENAME_BUTTON)
    private Button renameDialogRenameButton;

    @FindBy(xpath = FilesLocators.FILES_DOWNLOAD_DIALOG_CLOSE_BUTTON)
    private Button downloadDialogCloseButton;

    @FindBy(xpath = FilesLocators.FILES_DOWNLOAD_DIALOG_PLACE_TO_FOCUS)
    private WebElement downloadDialogPlaceToFocus;

    public FilesPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_MY_FILES_LINK));
        sleep(2000);
    }

    private Button getDownloadDialogCloseButton() {
        return downloadDialogCloseButton;
    }

    public WebElement getDownloadDialogPlaceToFocus() {
        return downloadDialogPlaceToFocus;
    }

    public Button getRenameDialogRenameButton() {
        return renameDialogRenameButton;
    }

    public TextInput getRenameDialogInput() {
        return renameDialogInput;
    }

    public WebElement getDeleteDialogItemsTable() {
        return deleteDialogItemsTable;
    }

    public WebElement getDownloadDialogItemsTable() {
        return downloadDialogItemsTable;
    }

    public Button getDeleteDialogDeleteButton() {
        return deleteDialogDeleteButton;
    }

    public Link getFilesExploreActivatedLink() {
        return filesExploreActivatedLink;
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

    public boolean isExploreLinkActivated() {
        return isElementPresent(getFilesExploreActivatedLink());
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

    public FilesPage openFilesExplorePage() {
        log.info("open Files.Explore page");
        Link link = getFilesExploreLink();
        waitUntilClickable(link);
        link.click();
        waitUntilDisplayed(getFilesExploreActivatedLink());
        return new FilesPage(getDriver());
    }

    public FilesAddFilesPage openFilesAddFilesPage() {
        log.info("opening Files.AddFiles page");
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_ADD_FILES_BUTTON_LINK));
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
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_CREATE_FOLDER_BUTTON));
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

    public void selectItem(String name) {
        String xpath = FilesLocators.FILES_LIST_CHECKBOX_TEMPLATE.replace("{ITEM_NAME}", name);
        WebElement chb = findElement(By.xpath(xpath));
        chb.click();
        sleep(200);
    }

    public void clickDeleteSelected() {
        log.info("click delete item(s)");
        getFilesEditDD().click();
        Link link = getFilesEditDeleteItem();
        waitUntilClickable(link);
        link.click();
        waitUntilDisplayed(getDeleteDialogItemsTable(), 5);
        waitUntilClickable(getDeleteDialogDeleteButton());
    }

    public void clickDownloadSelected() {
        log.info("click download item(s)");
        getFilesEditDD().click();
        Link link = getFilesEditDownloadItem();
        waitUntilClickable(link);
        link.click();
        waitUntilDisplayed(getDownloadDialogItemsTable(), 5);
    }

    public Button getFilesEditDD() {
        return uploadedFileEditDD;
    }

    public Link getFilesEditDeleteItem() {
        return uploadedFileEditDeleteItem;
    }

    public Link getFilesEditDownloadItem() {
        return uploadedFileEditDownloadItem;
    }

    public Link getFilesEditRenameItem() {
        return uploadedFileEditRenameItem;
    }

    public boolean isItemInDeleteDialogDisplayed(String name) {
        String xpath = FilesLocators.FILES_DELETE_DIALOG_ITEM_TEMPLATE.replace("{ITEM_NAME}", name);
        WebElement link = findElement(By.xpath(xpath));
        return isElementPresent(link, 2);
    }

    public int getNumberOfItemsToDelete() {
        int num = getDriver().findElements(By.xpath(FilesLocators.FILES_DELETE_DIALOG_ITEM_COMMON)).size();
        log.info("number of items to delete: " + num);
        return num;
    }

    public int getNumberOfItemsToDownload() {
        int num = getDriver().findElements(By.xpath(FilesLocators.FILES_DOWNLOAD_DIALOG_ITEM_COMMON)).size();
        log.info("number of items to download: " + num);
        return num;
    }

    public FilesPage clickDeleteOnDialog() {
        log.info("click Delete");
        getDeleteDialogDeleteButton().click();
        return new FilesPage(getDriver());
    }

    public void clickRenameSelected() {
        log.info("click rename item");
        getFilesEditDD().click();
        Link link = getFilesEditRenameItem();
        waitUntilClickable(link);
        link.click();
        waitUntilDisplayed(getRenameDialogInput(), 5);
        waitUntilClickable(getRenameDialogRenameButton());
    }

    public FilesPage renameAndSaveFolder(FolderProfile folderProfile) {
        log.info("rename and save folder");
        getRenameDialogInput().clear();
        String newName = "upd_" + getRunTimeLocalUniqueValue() + folderProfile.getFolderName();
        getRenameDialogInput().sendKeys(newName);
        getRenameDialogRenameButton().click();
        folderProfile.setFolderName(newName);
        return new FilesPage(getDriver());
    }

    public boolean isItemInDownloadDialogDisplayed(String name) {
        String xpath = FilesLocators.FILES_DOWNLOAD_DIALOG_ITEM_TEMPLATE.replace("{ITEM_NAME}", name);
        WebElement link = findElement(By.xpath(xpath));
        return isElementPresent(link, 3);
    }

    public void downloadItemFromDownloadDialog(String name) {
        log.info("download from dialog: " + name);
        String xpath = FilesLocators.FILES_DOWNLOAD_DIALOG_DOWNLOAD_ITEM_LINK_TEMPLATE.replace("{ITEM_NAME}", name);
        WebElement link = getDriver().findElement(By.xpath(xpath));
        waitUntilDisplayed(link, 5);
        link.click();
        waitUntilFileIsDownloaded(name);
    }

    public FilesPage closeDownloadDialog() {
        log.info("Close download dialog");
        Button button = getDownloadDialogCloseButton();
        waitUntilClickable(button);
        button.click();
        return new FilesPage(getDriver());
    }

    public boolean isDownloadCloseButtonDisplayed() {
        return isElementPresent(getDownloadDialogCloseButton());
    }

    public void scrollRight() {
        log.info("scroll download dialog list to right");
        getDownloadDialogPlaceToFocus().click();
        for (int i = 0; i <= 15; i ++) {
            getDownloadDialogPlaceToFocus().sendKeys(Keys.ARROW_RIGHT);
            sleep(200);
        }
    }

}
