package precisionFDA.pages.spaces;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.FilesLocators;
import precisionFDA.locators.SpacesLocators;
import precisionFDA.model.FileProfile;
import precisionFDA.model.FolderProfile;
import precisionFDA.pages.AbstractPage;
import precisionFDA.pages.files.FilesPage;
import precisionFDA.pages.files.UploadedFilePage;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;

import java.util.List;

import static precisionFDA.utils.Utils.sleep;

public class SpaceDetailsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = SpacesLocators.SPACE_DETAILS_MEMBERS_TAB_LINK)
    private Link editSpaceHostLeadInput;

    @FindBy(xpath = SpacesLocators.SPACE_DETAILS_ACCEPT_BY_GUEST_LEAD_LINK)
    private Link acceptByGuestLeadLink;

    @FindBy(xpath = SpacesLocators.SPACE_DETAILS_ACCEPT_BY_HOST_LEAD_LINK)
    private Link acceptByHostLeadLink;

    @FindBy(xpath = SpacesLocators.SPACES_CREATE_FOLDER_BUTTON)
    private WebElement createFolderButton;

    @FindBy(xpath = SpacesLocators.SPACES_CREATE_FOLDER_FORM_CREATE_BUTTON)
    private Button createFolderFormCreateButton;

    @FindBy(xpath = SpacesLocators.SPACES_CREATE_FOLDER_FORM_NAME_INPUT)
    private TextInput createFolderFormNameInput;

    @FindBy(xpath = SpacesLocators.SPACES_FILES_BREADCRUMBS)
    private WebElement breadcrumbs;

    @FindBy(xpath = SpacesLocators.SPACES_MOVE_DATA_TO_SPACE_BUTTON)
    private Button moveDataToSpaceButton;

    @FindBy(xpath = SpacesLocators.SPACES_MOVE_DATA_TO_SPACE_FILES_ITEM)
    private Link moveDataToSpaceFilesItem;

    @FindBy(xpath = SpacesLocators.SPACES_MOVE_DATA_TO_SPACE_DIALOG_SELECT_BUTTON)
    private Button moveDataToSpaceDialogSelectButton;

    @FindBy(xpath = SpacesLocators.SPACES_DD_COG_BUTTON)
    private Button cogEditItemsButton;

    @FindBy(xpath = SpacesLocators.SPACES_DD_COG_ITEMS)
    private WebElement cogDDItems;

    @FindBy(xpath = SpacesLocators.SPACES_DD_RENAME_ITEM)
    private Link cogDDRenameItem;

    @FindBy(xpath = SpacesLocators.SPACES_DD_DELETE_ITEM)
    private Link cogDDDeleteItem;

    @FindBy(xpath = SpacesLocators.SPACES_DD_PUBLISH_ITEM)
    private Link cogDDPublishItem;

    @FindBy(xpath = SpacesLocators.SPACES_DD_MOVE_ITEM)
    private Link cogDDMoveItem;

    @FindBy(xpath = SpacesLocators.SPACES_MODAL_RENAME_NAME_INPUT)
    private TextInput modalRenameNameInput;

    @FindBy(xpath = SpacesLocators.SPACES_MODAL_RENAME_SUBMIT_BUTTON)
    private Button modalRenameSubmitButton;

    @FindBy(xpath = SpacesLocators.SPACES_MODAL_DELETE_TABLE)
    private WebElement modalDeleteTable;

    @FindBy(xpath = SpacesLocators.SPACES_MODAL_PUBLISH_TABLE)
    private WebElement modalPublishTable;

    @FindBy(xpath = SpacesLocators.SPACES_MODAL_DELETE_BUTTON)
    private Button modalDeleteButton;

    @FindBy(xpath = SpacesLocators.DANGER_NOTIFICATION)
    private WebElement dangerNotification;

    @FindBy(xpath = SpacesLocators.MOVE_DIALOG_TREE)
    private WebElement moveDialogTree;

    @FindBy(xpath = SpacesLocators.MOVE_DIALOG_MOVE_HERE_BUTTON)
    private Button moveDialogMoveHereButton;

    @FindBy(xpath = SpacesLocators.SPACE_FILES_FIRST_CHECKBOX)
    private WebElement spaceFilesFirstCheckbox;

    @FindBy(xpath = SpacesLocators.FILES_PUBLISH_DIALOG_PUBLISH_BUTTON)
    private Button publishDialogPublishButton;

    @FindBy(xpath = SpacesLocators.SPACE_DETAILS_MEMBERS_TAB_LINK)
    private Link membersTabLink;

    public SpaceDetailsPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(SpacesLocators.SPACE_DETAILS_MEMBERS_TAB_LINK));
    }

    public Link getMembersTabLink() {
        return membersTabLink;
    }

    public WebElement getSpaceFilesFirstCheckbox() {
        return spaceFilesFirstCheckbox;
    }

    public Button getMoveDialogMoveHereButton() {
        return moveDialogMoveHereButton;
    }

    public WebElement getMoveDialogTree() {
        return moveDialogTree;
    }

    public WebElement getModalDeleteTable() {
        return modalDeleteTable;
    }

    public WebElement getModalPublishTable() {
        return modalPublishTable;
    }

    public Button getModalDeleteButton() {
        return modalDeleteButton;
    }

    public Button getModalRenameSubmitButton() {
        return modalRenameSubmitButton;
    }

    public TextInput getModalRenameNameInput() {
        return modalRenameNameInput;
    }

    public Link getCogDDRenameItem() {
        return cogDDRenameItem;
    }

    public Link getCogDDDeleteItem() {
        return cogDDDeleteItem;
    }

    public Link getCogDDPublishItem() {
        return cogDDPublishItem;
    }

    public Link getCogDDMoveItem() {
        return cogDDMoveItem;
    }

    public WebElement getCogDDItems() {
        return cogDDItems;
    }

    public Button getCogEditItemsButton() {
        return cogEditItemsButton;
    }

    public Button getMoveDataToSpaceDialogSelectButton() {
        return moveDataToSpaceDialogSelectButton;
    }

    public Link getMoveDataToSpaceFilesItem() {
        return moveDataToSpaceFilesItem;
    }

    public Button getMoveDataToSpaceButton() {
        return moveDataToSpaceButton;
    }

    public TextInput getCreateFolderFormNameInput() {
        return createFolderFormNameInput;
    }

    public WebElement getCreateFolderButton() {
        return createFolderButton;
    }

    public Button getCreateFolderFormCreateButton() {
        return createFolderFormCreateButton;
    }

    public Link getAcceptByGuestLeadLink() {
        return acceptByGuestLeadLink;
    }

    public Link getAcceptByHostLeadLink() {
        return acceptByHostLeadLink;
    }

    public boolean isAcceptByHostLeadDisplayed() {
        return isElementPresent(acceptByHostLeadLink, 1);
    }

    public boolean isAcceptByGuestLeadDisplayed() {
        return isElementPresent(acceptByGuestLeadLink, 1);
    }

    public WebElement getDangerNotification() {
        return dangerNotification;
    }

    public SpaceDetailsPage acceptByHostLead() {
        log.info("accept by Host Lead");
        Link link = getAcceptByHostLeadLink();
        link.click();
        return new SpaceDetailsPage(getDriver());
    }

    public SpaceDetailsPage acceptByGuestLead() {
        log.info("accept by Guest Lead");
        Link link = getAcceptByGuestLeadLink();
        link.click();
        return new SpaceDetailsPage(getDriver());
    }

    public SpaceDetailsPage createFolder(String folderName) {
        log.info("create folder");
        WebElement we1 = getCreateFolderButton();
        waitUntilDisplayed(we1);
        we1.click();
        Button we2 = getCreateFolderFormCreateButton();
        waitUntilClickable(we2);
        getCreateFolderFormNameInput().sendKeys(folderName);
        we2.click();
        log.info("created folder: " + folderName);
        return new SpaceDetailsPage(getDriver());
    }

    public boolean isLinkToCreatedFolderDisplayed(String folderName) {
        String xpath = SpacesLocators.SPACES_CREATED_FOLDER_TEMPLATE.replace("{FOLDER_NAME}", folderName);
        return isElementPresent(By.xpath(xpath), 1);
    }

    public boolean isLinkToAddedFileDisplayed(String fileName) {
        String xpath = SpacesLocators.SPACES_ADDED_FILE_TEMPLATE.replace("{FILE_NAME}", fileName);
        return isElementPresent(By.xpath(xpath), 1);
    }

    public SpaceDetailsPage openFolder(String folderName) {
        log.info("open folder");
        String xpath = SpacesLocators.SPACES_CREATED_FOLDER_TEMPLATE.replace("{FOLDER_NAME}", folderName);
        WebElement we = getDriver().findElement(By.xpath(xpath));
        we.click();
        return new SpaceDetailsPage(getDriver());
    }

    public UploadedFilePage openFile(String fileName) {
        log.info("open file");
        String xpath = SpacesLocators.SPACES_ADDED_FILE_TEMPLATE.replace("{FILE_NAME}", fileName);
        WebElement we = getDriver().findElement(By.xpath(xpath));
        we.click();
        return new UploadedFilePage(getDriver());
    }

    public String getDisplayedBreadcrumbsText() {
        isElementPresent(getBreadcrumbs());
        List<WebElement> chains = getDriver().findElements(By.xpath(SpacesLocators.FILES_BREADCRUMB_CHAIN));
        String br = "";
        if (!chains.isEmpty()) {
            for (int i = 0; i <= chains.size() - 1; i ++) {
                br = br + chains.get(i).getText();
                if (i < chains.size() - 1) {
                    br = br + " / ";
                }
            }
            log.info("Breadcrumb is: " + br);
        }
        else {
            br = "breadcrumbs are not displayed";
        }
        return br;
    }

    public WebElement getBreadcrumbs() {
        return breadcrumbs;
    }

    public SpaceDetailsPage clickBreadcrumbSpaceFiles() {
        List<WebElement> chains = getDriver().findElements(By.xpath(SpacesLocators.FILES_BREADCRUMB_CHAIN));
        chains.get(0).click();
        waitUntilDisplayed(getSpaceFilesFirstCheckbox(), 30);
        return new SpaceDetailsPage(getDriver());
    }

    public boolean isBreadcrumbDisplayed() {
        return isElementPresent(getBreadcrumbs(), 2);
    }

    public void clickMoveDataToSpace() {
        log.info("click Move Data to Space");
        Button button = getMoveDataToSpaceButton();
        waitUntilDisplayed(button);
        button.click();
    }

    public SpaceDetailsPage selectFileOnMoveToSpaceDialog(String fileName) {
        log.info("select file");
        Link files = getMoveDataToSpaceFilesItem();
        waitUntilDisplayed(files);
        files.click();
        String xpath = SpacesLocators.SPACES_MOVE_DATA_TO_SPACE_FILE_CHECKBOX_TEMPLATE.replace("{FILE_NAME}", fileName);
        By elBy = By.xpath(xpath);
        waitUntilDisplayed(elBy, 30);
        getDriver().findElement(elBy).click();
        Button button = getMoveDataToSpaceDialogSelectButton();
        waitUntilDisplayed(button);
        button.click();
        String file = SpacesLocators.SPACES_ADDED_FILE_TEMPLATE.replace("{FILE_NAME}", fileName);
        By fileBy = By.xpath(file);
        waitUntilDisplayed(fileBy, 30);
        return new SpaceDetailsPage(getDriver());
    }

    public void selectItem(String itemName) {
        log.info("select: " + itemName);
        String xpath = SpacesLocators.SPACES_CHECKBOX_TEMPLATE.replace("{ITEM_NAME}", itemName);
        By xpathBy = By.xpath(xpath);
        waitUntilDisplayed(xpathBy, 5);
        getDriver().findElement(xpathBy).click();
        sleep(200);
    }

    public void clickDropDownEdit() {
        waitUntilDisplayed(getCogEditItemsButton());
        getCogEditItemsButton().click();
        waitUntilDisplayed(getCogDDItems(), 5);
    }

    public SpaceDetailsPage renameOnGrid(FileProfile fileProfile) {
        log.info("rename file: " + fileProfile.getFileName());
        Link link = getCogDDRenameItem();
        waitUntilClickable(link);
        link.click();
        TextInput input = getModalRenameNameInput();
        waitUntilDisplayed(input, 5);
        input.clear();

        String newName = "Upd_" + fileProfile.getFileName();
        input.sendKeys(newName);
        fileProfile.setFileName(newName);

        Button button = getModalRenameSubmitButton();
        waitUntilDisplayed(button);
        button.click();
        return new SpaceDetailsPage(getDriver());
    }

    public SpaceDetailsPage renameOnGrid(FolderProfile folderProfile) {
        log.info("rename folder: " + folderProfile.getFolderName());
        Link link = getCogDDRenameItem();
        waitUntilClickable(link);
        link.click();
        TextInput input = getModalRenameNameInput();
        waitUntilDisplayed(input, 5);
        input.clear();

        String newName = "Upd_" + folderProfile.getFolderName();
        input.sendKeys(newName);
        folderProfile.setFolderName(newName);

        Button button = getModalRenameSubmitButton();
        waitUntilDisplayed(button);
        button.click();
        return new SpaceDetailsPage(getDriver());
    }

    public boolean isDangerNotificationDisplayed() {
        return isElementPresent(getDangerNotification(), 1);
    }

    public boolean isMembersTabLinkDisplayed() {
        return isElementPresent(getMembersTabLink(), 1);
    }

    public void clickMoveSelected() {
        log.info("click move item(s)");
        Link link = getCogDDMoveItem();
        waitUntilClickable(link);
        link.click();
        waitUntilDisplayed(getMoveDialogTree(), 30);
    }

    public void clickDeleteSelected() {
        log.info("click delete item(s)");
        Link link = getCogDDDeleteItem();
        waitUntilClickable(link);
        link.click();
        waitUntilDisplayed(getModalDeleteTable(), 15);
        waitUntilClickable(getModalDeleteButton());
    }

    public void clickPublishSelected() {
        log.info("click publish item(s)");
        Link link = getCogDDPublishItem();
        waitUntilClickable(link);
        link.click();
        waitUntilDisplayed(getModalPublishTable(), 15);
        waitUntilClickable(getPublishDialogPublishButton());
    }

    public void clickTreeItemOnMoveDialog(String itemName) {
        log.info("click on the tree item: " + itemName);
        String xpath = SpacesLocators.MOVE_DIALOG_TREE_TEMPLATE_LINK.replace("{ITEM_NAME}", itemName);
        WebElement link = getDriver().findElement(By.xpath(xpath));
        waitUntilClickable(link, 5);
        link.click();
        String clickedXpath = SpacesLocators.MOVE_DIALOG_TREE_TEMPLATE_CLICKED_LINK.replace("{ITEM_NAME}", itemName);
        WebElement clickedLink = getDriver().findElement(By.xpath(clickedXpath));
        waitUntilDisplayed(clickedLink, 5);
    }

    public SpaceDetailsPage clickMoveHere() {
        log.info("click Move Here");
        Button button = getMoveDialogMoveHereButton();
        waitUntilClickable(button);
        button.click();
        return new SpaceDetailsPage(getDriver());
    }

    public boolean isItemInDeleteDialogDisplayed(String name) {
        String xpath = SpacesLocators.FILES_DELETE_DIALOG_ITEM_TEMPLATE.replace("{ITEM_NAME}", name);
        return isElementPresent(By.xpath(xpath), 1);
    }

    public int getNumberOfItemsToDelete() {
        int num = getDriver().findElements(By.xpath(SpacesLocators.FILES_DELETE_DIALOG_ITEM_COMMON)).size();
        log.info("number of items to delete: " + num);
        return num;
    }

    public SpaceDetailsPage clickDeleteOnDialog() {
        log.info("click Delete");
        waitUntilClickable(getModalDeleteButton());
        getModalDeleteButton().click();
        return new SpaceDetailsPage(getDriver());
    }

    public boolean isItemInPublishDialogDisplayed(String name) {
        String xpath = SpacesLocators.FILES_PUBLISH_DIALOG_ITEM_TEMPLATE.replace("{ITEM_NAME}", name);
        return isElementPresent(By.xpath(xpath), 1);
    }

    public SpaceDetailsPage clickPublishOnDialog() {
        log.info("click Publish");
        getPublishDialogPublishButton().click();
        return new SpaceDetailsPage(getDriver());
    }

    public Button getPublishDialogPublishButton() {
        return publishDialogPublishButton;
    }

}
