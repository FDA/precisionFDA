package precisionFDA.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.utils.Utils;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;
import precisionFDA.data.TestCommonData;
import precisionFDA.data.TestUserData;
import precisionFDA.locators.AppsLocators;
import precisionFDA.model.AppProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.AbstractPage;

import static precisionFDA.data.TestAppData.getAppCommentText;
import static precisionFDA.data.TestCommonData.getDockerFileName;
import static precisionFDA.data.TestCommonData.getDockerValidationText;
import static precisionFDA.data.TestCommonData.getPathToDownloadsFolder;
import static precisionFDA.utils.Utils.*;
import static precisionFDA.utils.Utils.getFileSize;

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

    @FindBy(xpath = AppsLocators.APPS_SAVED_EXPORT_BUTTON)
    private Button appSavedExportButton;

    @FindBy(xpath = AppsLocators.APPS_SAVED_EXPORT_DOCKER_LINK)
    private Link appSavedExportDockerLink;

    @FindBy(xpath = AppsLocators.APPS_SAVED_EXPORT_CWLTOOL_LINK)
    private Link appSavedExportCWLToolLink;

    @FindBy(xpath = AppsLocators.APPS_SAVED_EXPORT_WDLTASK_LINK)
    private Link appSavedExportWDLTaskLink;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_ASSIGN_TO_CHALLENGE_BUTTON)
    private Button appSavedAssignToChallengeButton;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_TRACK_BUTTON_LINK)
    private Link appSavedTrackButtonLink;

    public Link getAppsSavedAppEditTagLink() {
        return appsSavedAppEditTagLink;
    }

    public Link getAppSavedTrackButtonLink() {
        return appSavedTrackButtonLink;
    }

    public Button getAppSavedAssignToChallengeButton() {
        return appSavedAssignToChallengeButton;
    }

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

    public Button getAppSavedExportButton() {
        return appSavedExportButton;
    }

    public Link getAppSavedExportDockerLink() {
        return appSavedExportDockerLink;
    }

    public Link getAppSavedExportCWLToolLink() {
        return appSavedExportCWLToolLink;
    }

    public Link getAppSavedExportWDLTaskLink() {
        return appSavedExportWDLTaskLink;
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
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_SAVED_APP_RUN_APP_BUTTON));
    }

    UserProfile getUser() {
        return TestUserData.getTestUserOne();
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
        return isElementPresent(getRunJobLink(appProfile), 2);
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
        appProfile.setAppCommentCreatedText(TestCommonData.getCurrentTimezone());
        return new AppsSavedAppPage(getDriver());
    }

    public String getExpectedCommentText() {
        return getAppCommentText();
    }

    public String getInstanceValue() {
        return getAppsSavedAppInstanceValue().getText();
    }

    public boolean isInstanceValueDisplayed() {
        return isElementPresent(getAppsSavedAppInstanceValue(), 5);
    }

    public AppsSavedAppPage openFirstRevision() {
        getAppsRevisionsButton().click();
        waitUntilDisplayed(getAppsSavedFirstRevision());
        getAppsSavedFirstRevision().click();
        waitUntilDisplayed(getAppsRevisionTitleLabeWE());
        return new AppsSavedAppPage(getDriver());
    }

    public AppsSavedAppPage exportDockerContainer() {
        log.info("export docker file");
        waitUntilClickable(getAppSavedExportButton());
        getAppSavedExportButton().click();
        waitUntilClickable(getAppSavedExportDockerLink());
        getAppSavedExportDockerLink().click();
        alertAccept(10, 500);
        waitUntilDockerFileIsDownloaded();
        return new AppsSavedAppPage(getDriver());
    }

    public AppsSavedAppPage exportCWLTool(AppProfile appProfile) {
        log.info("export CWL Tool file");
        waitUntilClickable(getAppSavedExportButton());
        getAppSavedExportButton().click();
        waitUntilClickable(getAppSavedExportCWLToolLink());
        getAppSavedExportCWLToolLink().click();
        alertAccept(10, 500);
        waitUntilCWLToolFileIsDownloaded(appProfile);
        return new AppsSavedAppPage(getDriver());
    }

    public AppsSavedAppPage exportWDLTask(AppProfile appProfile) {
        log.info("export WDL Task file");
        waitUntilClickable(getAppSavedExportButton());
        getAppSavedExportButton().click();
        waitUntilClickable(getAppSavedExportWDLTaskLink());
        getAppSavedExportWDLTaskLink().click();
        alertAccept(10, 500);
        waitUntilWDLTaskFileIsDownloaded(appProfile);
        return new AppsSavedAppPage(getDriver());
    }

    public void waitUntilDockerFileIsDownloaded() {
        waitUntilFileIsDownloaded(getDockerFileName());
    }

    public void waitUntilCWLToolFileIsDownloaded(AppProfile appProfile) {
        waitUntilFileIsDownloaded(getCWLToolFileName(appProfile));
    }

    public void waitUntilWDLTaskFileIsDownloaded(AppProfile appProfile) {
        waitUntilFileIsDownloaded(getWDLTaskFileName(appProfile));
    }

    public boolean isAssignToChallengeDisplayed() {
        return isElementPresent(getAppSavedAssignToChallengeButton(), 3);
    }

    public AppsSavedAppPage assignToChallenge(String challengeName) {
        log.info("assign to challenge");
        waitUntilClickable(getAppSavedAssignToChallengeButton(), 60);
        getAppSavedAssignToChallengeButton().click();
        WebElement item = getChallengeItem(challengeName);
        waitUntilClickable(item, 30);
        item.click();
        return new AppsSavedAppPage(getDriver());
    }

    public WebElement getChallengeItem(String challengeName) {
        String xpath = AppsLocators.APPS_SAVED_APP_ASSIGN_TO_CHALLENGE_ITEM_TEMPLATE.replace("{CHALLENGE_NAME}", challengeName);
        WebElement el = getDriver().findElement(By.xpath(xpath));
        return el;
    }

    public WebElement getChallengeTagWe(String challengeName) {
        String xpath = AppsLocators.APPS_SAVED_APP_CHALLENGE_TAG_TEMPLATE.replace("{CHALLENGE_NAME}", challengeName);
        WebElement el = getDriver().findElement(By.xpath(xpath));
        return el;
    }

    public boolean isChallengeTagDisplayed(String challengeName) {
        return isElementPresent(getChallengeTagWe(challengeName), 3);
    }

    public AppsTrackAppPage clickTrack() {
        log.info("click Track");
        waitUntilDisplayed(getAppSavedTrackButtonLink(), 2);
        getAppSavedTrackButtonLink().click();
        return new AppsTrackAppPage(getDriver());
    }

    public boolean isDockerFileDownloaded() {
        return isFileDownloaded(getDockerFileName());
    }

    public boolean isCWLToolFileDownloaded(AppProfile appProfile) {
        return isFileDownloaded(getCWLToolFileName(appProfile));
    }

    public boolean isWDLTaskFileDownloaded(AppProfile appProfile) {
        return isFileDownloaded(getWDLTaskFileName(appProfile));
    }

    public boolean isDockerFileNotEmpty() {
        boolean notEmpty = Utils.doesFileContainText(getPathToDownloadsFolder() + getDockerFileName(), getDockerValidationText());
        if (!notEmpty) {
            log.warn("the docker file does not contain text: " + getDockerValidationText());
        }
        return notEmpty;
    }

    public boolean isCWLToolFileNotEmpty(AppProfile appProfile) {
        double num = 500;
        boolean notEmpty = false;
        double size = getFileSize(getPathToDownloadsFolder() + getCWLToolFileName(appProfile));
        if (size < num) {
            log.warn("the downloaded CWL Tool file looks like a wrong one - size of the file is less then " + num);
        }
        else {
            notEmpty = true;
        }
        return notEmpty;
    }

    public boolean isWDLTaskFileNotEmpty(AppProfile appProfile) {
        double num = 500;
        boolean notEmpty = false;
        double size = getFileSize(getPathToDownloadsFolder() + getWDLTaskFileName(appProfile));
        log.info("file size is: " + size);
        if (size < num) {
            log.warn("the downloaded WDL Task file looks like a wrong one - size of the file is less then " + num);
        }
        else {
            notEmpty = true;
        }
        return notEmpty;
    }

}
