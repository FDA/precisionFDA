package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.data.TestRunData;
import staging.data.TestUserData;
import staging.locators.AppsLocators;
import staging.model.AppProfile;
import staging.model.User;
import staging.pages.AbstractPage;

import static staging.data.TestAppData.getAppCommentText;

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

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_REVISIONS_BUTTON)
    private WebElement appsRevisionsButton;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_FIRST_REVISION)
    private WebElement appsSavedFirstRevision;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_REVISION_PAGE_TITLE)
    private WebElement appsSavedRevisionPageTitle;

    @FindBy(xpath = AppsLocators.APPS_SUBMITTED_COMMENT_TIME)
    private WebElement appsSubmittedCommentTimeWE;

    @FindBy(xpath = AppsLocators.APPS_REVISION_TITLE_LABEL)
    private WebElement appsRevisionTitleLabeWE;

    @FindBy(xpath = AppsLocators.APPS_SAVED_INPUT_LABEL_VALUE)
    private WebElement appSavedInputLabelWE;

    @FindBy(xpath = AppsLocators.APPS_SAVED_INPUT_HELP_VALUE)
    private WebElement appSavedInputHelpWE;

    @FindBy(xpath = AppsLocators.APPS_SAVED_INPUT_DEFAULT_VALUE)
    private WebElement appSavedInputDefaultWE;

    @FindBy(xpath = AppsLocators.APPS_SAVED_OUTPUT_LABEL_VALUE)
    private WebElement appSavedOutputLabelWE;

    @FindBy(xpath = AppsLocators.APPS_SAVED_OUTPUT_HELP_VALUE)
    private WebElement appSavedOutputHelpWE;

    public WebElement getAppSavedInputLabelWE() {
        return appSavedInputLabelWE;
    }

    public WebElement getAppSavedInputHelpWE() {
        return appSavedInputHelpWE;
    }

    public WebElement getAppSavedInputDefaultWE() {
        return appSavedInputDefaultWE;
    }

    public WebElement getAppSavedOutputLabelWE() {
        return appSavedOutputLabelWE;
    }

    public WebElement getAppSavedOutputHelpWE() {
        return appSavedOutputHelpWE;
    }

    public String getAppSavedInputLabelText() {
        return getAppSavedInputLabelWE().getText();
    }

    public String getAppSavedInputHelpText() {
        return getAppSavedInputHelpWE().getText();
    }

    public String getAppSavedInputDefaultText() {
        return getAppSavedInputDefaultWE().getText();
    }

    public String getAppSavedOutputLabelText() {
        return getAppSavedOutputLabelWE().getText();
    }

    public String getAppSavedOutputHelpText() {
        return getAppSavedOutputHelpWE().getText();
    }

    public AppsSavedAppPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_SAVED_APP_RUN_APP_BUTTON));
    }

    User getUser() {
        return TestUserData.getTestUser();
    }

    public WebElement getAppsRevisionTitleLabeWE() {
        return appsRevisionTitleLabeWE;
    }

    public WebElement getAppsSubmittedCommentTimeWE() {
        return appsSubmittedCommentTimeWE;
    }

    public WebElement getAppsRelevantSelectedAppName() {
        return appsRelevantSelectedAppName;
    }

    public WebElement getAppsSavedRevisionPageTitle() {
        return appsSavedRevisionPageTitle;
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

    public String getActSelectedAppName() {
        return getAppsRelevantSelectedAppName().getText();
    }

    public String getExpSelectedAppOrg() {
        return getUser().getApplUserOrg();
    }

    public String getActSelectedAppOrg() {
        return getAppsRelevantSelectedAppOrg().getText();
    }

    public String getExpSelectedAppAddedBy() {
        return getUser().getApplUsername();
    }

    public String getActSelectedAppAddedBy() {
        return getAppsRelevantSelectedAppAddedBy().getText();
    }

    public String getActSelectedAppCreated() {
        return getAppsRelevantSelectedAppCreated().getText();
    }

    public String getActSelectedAppTitle() {
        return getAppsRelevantSelectedAppTitle().getText();
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

    public boolean isRunJobDisplayed(AppProfile appProfile) {
        return isElementPresent(getRunJobLink(appProfile));
    }

    public Link getAppsSavedAppReadmeTabLink() {
        return appsSavedAppReadmeTabLink;
    }

    public WebElement getAppsSavedAppReadmePreviewWE() {
        return appsSavedAppReadmePreviewWE;
    }

    public WebElement getAppsRevisionsButton() {
        return appsRevisionsButton;
    }

    public WebElement getAppsSavedFirstRevision() {
        return appsSavedFirstRevision;
    }

    public String getAppsSavedRevisionPageTitleText() {
        return getAppsSavedRevisionPageTitle().getText();
    }

    public String getReadMeText() {
        return getAppsSavedAppReadmePreviewWE().getText();
    }

    public String getAppsSubmittedCommentTimeText() {
        return getAppsSubmittedCommentTimeWE().getText();
    }

    public WebElement getRunJobLink(AppProfile appProfile) {
        String xpath = AppsLocators.APPS_SAVED_APP_JOB_LINK_TEMPLATE.replace("{JOB_NAME}", appProfile.getJobNameText());
        return getDriver().findElement(By.xpath(xpath));
    }

    public int getAppRevision() {
        String revision = getAppsSavedAppRevisionWE().getText();
        return Integer.parseInt(revision);
    }

    public AppsEditAppPage clickEdit() {
        log.info("click edit");
        getAppsSavedAppEditButtonLink().click();
        return new AppsEditAppPage(getDriver());
    }

    public AppsEditAndRunJobPage clickRunAppOnAppPage() {
        log.info("click Run App on the app page");
        getAppsSavedAppRunAppButton().click();
        return new AppsEditAndRunJobPage(getDriver());
    }

    public AppsJobPage openJobFromSavedAppPage(AppProfile appProfile) {
        log.info("open job");
        getRunJobLink(appProfile).click();
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

    public AppsSavedAppPage leaveComment() {
        log.info("leave a comment");
        getAppsSavedAppCommentArea().sendKeys(getAppCommentText());
        getAppsSavedAppCommentButton().click();
        return new AppsSavedAppPage(getDriver());
    }

    public AppsSavedAppPage leaveCommentSaveTime(AppProfile appProfile) {
        log.info("leave a comment");
        getAppsSavedAppCommentArea().sendKeys(getAppCommentText());
        getAppsSavedAppCommentButton().click();
        appProfile.setAppCommentCreatedText(TestRunData.getCurrentTimezone());
        return new AppsSavedAppPage(getDriver());
    }

    public String getExpectedCommentText() {
        return getAppCommentText();
    }

    public String getInstanceValue() {
        return getAppsSavedAppInstanceValue().getText();
    }

    public boolean isInstanceValueDisplayed() {
        return getAppsSavedAppInstanceValue().isDisplayed();
    }

    public AppsSavedAppPage openFirstRevision() {
        getAppsRevisionsButton().click();
        waitUntilDisplayed(getAppsSavedFirstRevision());
        getAppsSavedFirstRevision().click();
        waitUntilDisplayed(getAppsRevisionTitleLabeWE());
        return new AppsSavedAppPage(getDriver());
    }

}
