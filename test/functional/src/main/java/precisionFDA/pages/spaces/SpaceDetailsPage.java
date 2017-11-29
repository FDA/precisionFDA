package precisionFDA.pages.spaces;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.FilesLocators;
import precisionFDA.locators.SpacesLocators;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;

import java.util.List;

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

    public SpaceDetailsPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(SpacesLocators.SPACE_DETAILS_MEMBERS_TAB_LINK));
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

    public SpaceDetailsPage openFolder(String folderName) {
        log.info("open folder");
        String xpath = SpacesLocators.SPACES_CREATED_FOLDER_TEMPLATE.replace("{FOLDER_NAME}", folderName);
        WebElement we = getDriver().findElement(By.xpath(xpath));
        we.click();
        return new SpaceDetailsPage(getDriver());
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
        return new SpaceDetailsPage(getDriver());
    }

    public boolean isBreadcrumbDisplayed() {
        return isElementPresent(getBreadcrumbs(), 2);
    }
}
