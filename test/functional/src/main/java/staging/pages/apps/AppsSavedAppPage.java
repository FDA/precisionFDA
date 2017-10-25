package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.locators.AppsLocators;
import staging.model.Users;
import staging.pages.AbstractPage;

import static staging.data.TestVariables.*;
import static staging.utils.Utils.areTheyEqual;
import static staging.utils.Utils.doesContain;

public class AppsSavedAppPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AppsLocators.APPS_JOBS_LIST)
    private WebElement appsJobsList;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_SELECTED_APP_NAME)
    private WebElement appsRelevantSelectedAppName;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_SELECTED_APP_TITLE)
    private WebElement appsRelevantSelectedAppTitle;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_SELECTED_APP_ORG)
    private WebElement appsRelevantSelectedAppOrg;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_SELECTED_APP_ADDED_BY)
    private WebElement appsRelevantSelectedAppAddedBy;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_SELECTED_APP_CREATED)
    private WebElement appsRelevantSelectedAppCreated;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_RUN_APP_BUTTON)
    private Link appsSavedAppRunAppButton;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_REVISION)
    private WebElement appsSavedAppRevisionWE;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_EDIT_BUTTON)
    private Link appsSavedAppEditButtonLink;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_README_TAB_LINK)
    private Link appsSavedAppReadmeTabLink;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_README_PREVIEW)
    private WebElement appsSavedAppReadmePreviewWE;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_COMMENTS_TAB_LINK)
    private Link appsSavedAppCommentTabLink;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_COMMENT_AREA)
    private WebElement appsSavedAppCommentArea;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_LAST_COMMENT)
    private WebElement appsSavedAppLastComment;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_COMMENT_BUTTON)
    private Button appsSavedAppCommentButton;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_EDIT_TAG_LINK)
    private Link appsSavedAppEditTagLink;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_EDIT_TAG_FORM_TAGNAME_INPUT)
    private TextInput appsEditTagsFormTagnameInput;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_EDIT_TAG_FORM_UPDATE_TAGS_BUTTON)
    private Button appsEditTagsFormUpdateTagsButton;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_SAVED_TAG_LINK)
    private Link appsSavedAppSavedTagLink;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_INSTANCE_VALUE)
    private WebElement appsSavedAppInstanceValue;

    public AppsSavedAppPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_SAVED_APP_RUN_APP_BUTTON));
    }

    Users getUser() {
        return Users.getTestUser();
    }

    public WebElement getAppsJobsListWE() {
        return appsJobsList;
    }

    public boolean isJobsListDisplayed() {
        return isElementPresent(getAppsJobsListWE());
    }

    public WebElement getAppsRelevantSelectedAppName() {
        return appsRelevantSelectedAppName;
    }

    public WebElement getAppsRelevantSelectedAppOrg() {
        return appsRelevantSelectedAppOrg;
    }

    public WebElement getAppsRelevantSelectedAppAddedBy() {
        return appsRelevantSelectedAppAddedBy;
    }

    public WebElement getAppsRelevantSelectedAppCreated() {
        return appsRelevantSelectedAppCreated;
    }

    public WebElement getAppsRelevantSelectedAppTitle() {
        return appsRelevantSelectedAppTitle;
    }

    public Link getAppsSavedAppRunAppButton() {
        return appsSavedAppRunAppButton;
    }

    public Link getAppsSavedAppEditButtonLink() {
        return appsSavedAppEditButtonLink;
    }

    public WebElement getAppsSavedAppRevisionWE() {
        return appsSavedAppRevisionWE;
    }

    public WebElement getAppsSavedAppInstanceValue() {
        return appsSavedAppInstanceValue;
    }

    public boolean isSelectedAppNameCorrect() {
        return areTheyEqual(getActSelectedAppName(), getExpSelectedAppName());
    }

    public String getExpSelectedAppName() {
        return getAppName().replace(":", "").replace(" ", "-");
    }

    public String getActSelectedAppName() {
        return getAppsRelevantSelectedAppName().getText();
    }

    public boolean isSelectedAppOrgCorrect() {
        return areTheyEqual(getActSelectedAppOrg(), getExpSelectedAppOrg());
    }

    public String getExpSelectedAppOrg() {
        return getUser().getApplUserOrg();
    }

    public String getActSelectedAppOrg() {
        return getAppsRelevantSelectedAppOrg().getText();
    }

    public boolean isSelectedAppAddedByCorrect() {
        return areTheyEqual(getActSelectedAppAddedBy(), getExpSelectedAppAddedBy());
    }

    public String getExpSelectedAppAddedBy() {
        return getUser().getApplUsername();
    }

    public String getActSelectedAppAddedBy() {
        return getAppsRelevantSelectedAppAddedBy().getText();
    }

    public boolean isCreatedDateCorrect() {
        return doesContain(getActSelectedAppCreated(), getExpSelectedAppCreated());
    }

    public String getActSelectedAppCreated() {
        return getAppsRelevantSelectedAppCreated().getText();
    }

    public String getExpSelectedAppCreated() {
        return getAppCreateTimeUTC().substring(0, 16);
    }

    public boolean isSelectedAppTitleCorrect() {
        return areTheyEqual(getActSelectedAppTitle(), getExpSelectedAppTitle());
    }

    public String getExpSelectedAppTitle() {
        return getAppTitle();
    }

    public String getActSelectedAppTitle() {
        return getAppsRelevantSelectedAppTitle().getText();
    }

    public boolean isRunAppButtonDisplayed() {
        return isElementPresent(appsSavedAppRunAppButton);
    }

    public WebElement getAppsSavedAppLastComment() {
        return appsSavedAppLastComment;
    }

    public String getLastCommentText() {
        return getAppsSavedAppLastComment().getText();
    }

    public Link getAppsSavedAppCommentTabLink() {
        return appsSavedAppCommentTabLink;
    }

    public WebElement getAppsSavedAppCommentArea() {
        return appsSavedAppCommentArea;
    }

    public Button getAppsSavedAppCommentButton() {
        return appsSavedAppCommentButton;
    }

    public boolean isRunJobDisplayed() {
        return isElementPresent(getRunJobLink());
    }

    public Link getAppsSavedAppReadmeTabLink() {
        return appsSavedAppReadmeTabLink;
    }

    public WebElement getAppsSavedAppReadmePreviewWE() {
        return appsSavedAppReadmePreviewWE;
    }

    public String getReadMeText() {
        return getAppsSavedAppReadmePreviewWE().getText();
    }

    public WebElement getRunJobLink() {
        String xpath = AppsLocators.APPS_SAVED_APP_JOB_LINK_TEMPLATE.replace("{JOB_NAME}", getAppJobName());
        return getDriver().findElement(By.xpath(xpath));
    }

    public int getAppRevision() {
        String revision = getAppsSavedAppRevisionWE().getText();
        return Integer.parseInt(revision);
    }

    public AppsEditAppPage editSavedApp() {
        log.info("edit app");
        getAppsSavedAppEditButtonLink().click();
        return new AppsEditAppPage(getDriver());
    }

    public AppsEditAndRunAppPage runAppFromRelevantPage() {
        log.info("run app");
        getAppsSavedAppRunAppButton().click();
        return new AppsEditAndRunAppPage(getDriver());
    }

    public AppsJobPage openJobFromSavedAppPage() {
        log.info("open job");
        getRunJobLink().click();
        return new AppsJobPage(getDriver());
    }

    public AppsSavedAppPage openReadmeTab() {
        log.info("open ReadMe tab");
        getAppsSavedAppReadmeTabLink().click();
        waitUntilDisplayed(getAppsSavedAppReadmePreviewWE());
        return new AppsSavedAppPage(getDriver());
    }

    public AppsSavedAppPage openCommentsTab() {
        log.info("open Comments tab");
        getAppsSavedAppCommentTabLink().click();
        waitUntilDisplayed(getAppsSavedAppCommentArea());
        return new AppsSavedAppPage(getDriver());
    }

    public AppsSavedAppPage writeComment() {
        log.info("write a comment");
        getAppsSavedAppCommentArea().sendKeys(getAppCommentText());
        getAppsSavedAppCommentButton().click();
        return new AppsSavedAppPage(getDriver());
    }

    public String getInstanceValue() {
        return getAppsSavedAppInstanceValue().getText();
    }

    public boolean isInstanceValueDisplayed() {
        return getAppsSavedAppInstanceValue().isDisplayed();
    }

}
