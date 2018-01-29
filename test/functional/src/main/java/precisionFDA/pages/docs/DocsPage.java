package precisionFDA.pages.docs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.DocsLocators;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Link;

public class DocsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = DocsLocators.DOCS_INTRODUCTION_TITLE)
    private WebElement docsIntroTitle;

    @FindBy(xpath = DocsLocators.DOCS_COMPS_TITLE)
    private WebElement docsCompsTitle;

    @FindBy(xpath = DocsLocators.DOCS_TRACKING_TITLE)
    private WebElement docsTrackingTitle;

    @FindBy(xpath = DocsLocators.DOCS_PUBLISHING_TITLE)
    private WebElement docsPublishingTitle;

    @FindBy(xpath = DocsLocators.DOCS_FILES_TITLE)
    private WebElement docsFilesTitle;

    @FindBy(xpath = DocsLocators.DOCS_APPS_TITLE)
    private WebElement docsAppsTitle;

    @FindBy(xpath = DocsLocators.DOCS_LICENSES_TITLE)
    private WebElement docsLicensesTitle;

    @FindBy(xpath = DocsLocators.DOCS_VIDEO_TUTORIALS_TITLE)
    private WebElement docsVideoTutorialsTitle;

    @FindBy(xpath = DocsLocators.DOCS_LIST_TITLE)
    private WebElement docsListTitle;

    @FindBy(xpath = DocsLocators.DOCS_CREATING_APPS_TITLE)
    private WebElement docsCreatingAppsTitle;

    @FindBy(xpath = DocsLocators.DOCS_NOTES_TITLE)
    private WebElement docsNotesTitle;

    @FindBy(xpath = DocsLocators.DOCS_DISCUSSIONS_TITLE)
    private WebElement docsDiscussionsTitle;

    @FindBy(xpath = DocsLocators.DOCS_NOTES_EDITING_LINK)
    private Link notesEditingLink;

    @FindBy(xpath = DocsLocators.DOCS_NOTES_IDEAS_LINK)
    private Link notesIdeasLink;

    @FindBy(xpath = DocsLocators.DOCS_INTRODUCTION_LINK)
    private Link introLink;

    @FindBy(xpath = DocsLocators.DOCS_FILES_LINK)
    private Link filesLink;

    @FindBy(xpath = DocsLocators.DOCS_COMPS_LINK)
    private Link compsLink;

    @FindBy(xpath = DocsLocators.DOCS_APPS_LINK)
    private Link appsLink;

    @FindBy(xpath = DocsLocators.DOCS_CREATING_APPS_LINK)
    private Link creatingAppsLink;

    @FindBy(xpath = DocsLocators.DOCS_NOTES_LINK)
    private Link notesLink;

    @FindBy(xpath = DocsLocators.DOCS_DISCS_LINK)
    private Link discsLink;

    @FindBy(xpath = DocsLocators.DOCS_TRACKING_LINK)
    private Link trackingLink;

    @FindBy(xpath = DocsLocators.DOCS_PUBLISHING_LINK)
    private Link publishingLink;

    @FindBy(xpath = DocsLocators.DOCS_LICENSES_LINK)
    private Link licensesLink;

    @FindBy(xpath = DocsLocators.DOCS_VIDEO_TUTORIALS_LINK)
    private Link videoTutorialsLink;

    @FindBy(xpath = DocsLocators.DOCS_FILES_LISTING_LINK)
    private Link filesListingLink;

    @FindBy(xpath = DocsLocators.DOCS_FILES_UPLOADING_LINK)
    private Link filesUploadingLink;

    @FindBy(xpath = DocsLocators.DOCS_FILES_EXAMINING_LINK)
    private Link filesExaminingLink;

    @FindBy(xpath = DocsLocators.DOCS_FILES_DETAILS_LINK)
    private Link filesDetailsLink;

    @FindBy(xpath = DocsLocators.DOCS_COMPS_NEW_LINK)
    private Link compsNewLink;

    @FindBy(xpath = DocsLocators.DOCS_COMPS_BED_LINK)
    private Link compsBEDLink;

    @FindBy(xpath = DocsLocators.DOCS_COMPS_UNDERSTANDING_LINK)
    private Link compsUnderstandingLink;

    @FindBy(xpath = DocsLocators.DOCS_COMPS_VISUALIZING_LINK)
    private Link compsVisualisingLink;

    @FindBy(xpath = DocsLocators.DOCS_COMPS_IDEAS_LINK)
    private Link compsIdeasLink;

    @FindBy(xpath = DocsLocators.DOCS_APPS_OVERVIEW_LINK)
    private Link appsOvervewLink;

    @FindBy(xpath = DocsLocators.DOCS_APPS_RUNNING_LINK)
    private Link appsRunningLink;

    @FindBy(xpath = DocsLocators.DOCS_APPS_BATCH_LINK)
    private Link appsBatchLink;

    @FindBy(xpath = DocsLocators.DOCS_APPS_EXPORTING_LINK)
    private Link appsExportingLink;

    @FindBy(xpath = DocsLocators.DOCS_APPS_CWL_EXPORT_LINK)
    private Link appsCWLExportLink;

    @FindBy(xpath = DocsLocators.DOCS_APPS_WDL_EXPORT_LINK)
    private Link appsWDLExportLink;

    @FindBy(xpath = DocsLocators.DOCS_APPS_LISTING_LINK)
    private Link appsListingLink;

    @FindBy(xpath = DocsLocators.DOCS_APPS_JOB_DETAILS_LINK)
    private Link appsJobDetailsLink;

    @FindBy(xpath = DocsLocators.DOCS_CR_APPS_ASSETS_LINK)
    private Link crAppsAssetsLink;

    @FindBy(xpath = DocsLocators.DOCS_CR_APPS_BASH_LINK)
    private Link crAppsBashLink;

    @FindBy(xpath = DocsLocators.DOCS_CR_APPS_CONVENTION_LINK)
    private Link crAppsConventionLink;

    @FindBy(xpath = DocsLocators.DOCS_CR_APPS_FORKING_LINK)
    private Link crAppsForkingLink;

    @FindBy(xpath = DocsLocators.DOCS_CR_APPS_INSTANCE_TYPES_LINK)
    private Link crAppsInstanceTypeLink;

    @FindBy(xpath = DocsLocators.DOCS_CR_APPS_IO_SPEC_LINK)
    private Link crAppsIOSpecLink;

    @FindBy(xpath = DocsLocators.DOCS_CR_APPS_OWN_ASSETS_LINK)
    private Link crAppsOwnAssetsLink;

    @FindBy(xpath = DocsLocators.DOCS_CR_APPS_SCRIPT_LINK)
    private Link crAppsScriptLink;

    @FindBy(xpath = DocsLocators.DOCS_CR_APPS_VM_ENV_LINK)
    private Link crAppsVMEnvLink;

    @FindBy(xpath = DocsLocators.DOCS_DISCS_ANSWER_LINK)
    private Link discsAnswerLink;

    @FindBy(xpath = DocsLocators.DOCS_DISCS_COMMENTING_LINK)
    private Link discsCommentingLink;

    @FindBy(xpath = DocsLocators.DOCS_DISCS_CREATING_LINK)
    private Link discsCreatingLink;

    public DocsPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(DocsLocators.DOCS_LIST_TITLE));
    }

    public Link getDiscsAnswerLink() {
        return discsAnswerLink;
    }

    public Link getDiscsCommentingLink() {
        return discsCommentingLink;
    }

    public Link getDiscsCreatingLink() {
        return discsCreatingLink;
    }

    public Link getNotesEditingLink() {
        return notesEditingLink;
    }

    public Link getNotesIdeasLink() {
        return notesIdeasLink;
    }

    public WebElement getDocsCreatingAppsTitle() {
        return docsCreatingAppsTitle;
    }

    public WebElement getDocsAppsTitle() {
        return docsAppsTitle;
    }

    public WebElement getDocsNotesTitle() {
        return docsNotesTitle;
    }

    public WebElement getDocsVideoTutorialsTitle() {
        return docsVideoTutorialsTitle;
    }

    public WebElement getDocsLicensesTitle() {
        return docsLicensesTitle;
    }

    public WebElement getDocsPublishingTitle() {
        return docsPublishingTitle;
    }

    public WebElement getDocsTrackingTitle() {
        return docsTrackingTitle;
    }

    public Link getCrAppsAssetsLink() {
        return crAppsAssetsLink;
    }

    public Link getCrAppsBashLink() {
        return crAppsBashLink;
    }

    public Link getCrAppsConventionLink() {
        return crAppsConventionLink;
    }

    public Link getCrAppsForkingLink() {
        return crAppsForkingLink;
    }

    public Link getCrAppsInstanceTypeLink() {
        return crAppsInstanceTypeLink;
    }

    public Link getCrAppsIOSpecLink() {
        return crAppsIOSpecLink;
    }

    public Link getCrAppsOwnAssetsLink() {
        return crAppsOwnAssetsLink;
    }

    public Link getCrAppsScriptLink() {
        return crAppsScriptLink;
    }

    public Link getCrAppsVMEnvLink() {
        return crAppsVMEnvLink;
    }

    public Link getAppsBatchLink() {
        return appsBatchLink;
    }

    public Link getAppsCWLExportLink() {
        return appsCWLExportLink;
    }

    public Link getAppsOvervewLink() {
        return appsOvervewLink;
    }

    public Link getAppsRunningLink() {
        return appsRunningLink;
    }

    public Link getAppsExportingLink() {
        return appsExportingLink;
    }

    public Link getAppsJobDetailsLink() {
        return appsJobDetailsLink;
    }

    public Link getAppsListingLink() {
        return appsListingLink;
    }

    public Link getAppsWDLExportLink() {
        return appsWDLExportLink;
    }

    public Link getFilesListingLink() {
        return filesListingLink;
    }

    public Link getFilesDetailsLink() {
        return filesDetailsLink;
    }

    public Link getFilesExaminingLink() {
        return filesExaminingLink;
    }

    public Link getFilesUploadingLink() {
        return filesUploadingLink;
    }

    public WebElement getDocsIntroTitle() {
        return docsIntroTitle;
    }

    public WebElement getDocsFilesTitle() {
        return docsFilesTitle;
    }

    public WebElement getDocsDiscussionsTitle() {
        return docsDiscussionsTitle;
    }

    public Link getAppsLink() {
        return appsLink;
    }

    public Link getCompsLink() {
        return compsLink;
    }

    public Link getCreatingAppsLink() {
        return creatingAppsLink;
    }

    public Link getDiscsLink() {
        return discsLink;
    }

    public Link getFilesLink() {
        return filesLink;
    }

    public Link getIntroLink() {
        return introLink;
    }

    public Link getLicensesLink() {
        return licensesLink;
    }

    public Link getNotesLink() {
        return notesLink;
    }

    public Link getPublishingLink() {
        return publishingLink;
    }

    public Link getTrackingLink() {
        return trackingLink;
    }

    public Link getVideoTutorialsLink() {
        return videoTutorialsLink;
    }

    public WebElement getDocsListTitle() {
        return docsListTitle;
    }

    public WebElement getDocsCompsTitle() {
        return docsCompsTitle;
    }

    public Link getCompsNewLink() {
        return compsNewLink;
    }

    public Link getCompsBEDLink() {
        return compsBEDLink;
    }

    public Link getCompsUnderstandingLink() {
        return compsUnderstandingLink;
    }

    public Link getCompsIdeasLink() {
        return compsIdeasLink;
    }

    public Link getCompsVisualisingLink() {
        return compsVisualisingLink;
    }

    public boolean isIntroTitleDisplayed() {
        return isElementPresent(getDocsIntroTitle(), 1);
    }

    public boolean isFilesTitleDisplayed() {
        return isElementPresent(getDocsFilesTitle(), 1);
    }

    public boolean isDocsTrackingTitleDisplayed() {
        return isElementPresent(getDocsTrackingTitle(), 1);
    }

    public boolean isDocsListTitleDisplayed() {
        return isElementPresent(getDocsListTitle());
    }

    public boolean isDocsDiscussionsTitleDisplayed() {
        return isElementPresent(getDocsDiscussionsTitle(), 1);
    }

    public boolean isAppsLinkDisplayed() {
        return isElementPresent(getAppsLink(), 1);
    }

    public boolean isCompsLinkDisplayed() {
        return isElementPresent(getCompsLink(), 1);
    }

    public boolean isCreatingAppsLinkDisplayed() {
        return isElementPresent(getCreatingAppsLink(), 1);
    }

    public boolean isDiscsLinkDisplayed() {
        return isElementPresent(getDiscsLink(), 1);
    }

    public boolean isFilesLinkDisplayed() {
        return isElementPresent(getFilesLink(), 1);
    }

    public boolean isIntroLinkDisplayed() {
        return isElementPresent(getIntroLink(), 1);
    }

    public boolean isLicensesLinkDisplayed() {
        return isElementPresent(getLicensesLink(), 1);
    }

    public boolean isPublishingLinkDisplayed() {
        return isElementPresent(getPublishingLink(), 1);
    }

    public boolean isNotesLinkDisplayed() {
        return isElementPresent(getNotesLink(), 1);
    }

    public boolean isTrackingLinkDisplayed() {
        return isElementPresent(getTrackingLink(), 1);
    }

    public boolean isVideoTutorialsLinkDisplayed() {
        return isElementPresent(getVideoTutorialsLink(), 1);
    }

    public boolean isFilesListingLinkDisplayed() {
        return isElementPresent(getFilesListingLink(), 1);
    }

    public boolean isFilesUploadingLinkDisplayed() {
        return isElementPresent(getFilesUploadingLink(), 1);
    }

    public boolean isFilesExaminingLinkDisplayed() {
        return isElementPresent(getFilesExaminingLink(), 1);
    }

    public boolean isFilesDetailsLinkDisplayed() {
        return isElementPresent(getFilesDetailsLink(), 1);
    }

    public boolean isCompsNewLinkDisplayed() {
        return isElementPresent(getCompsNewLink(), 1);
    }

    public boolean isCompsBEDLinkDisplayed() {
        return isElementPresent(getCompsBEDLink(), 1);
    }

    public boolean isCompsUnderstandingLinkDisplayed() {
        return isElementPresent(getCompsUnderstandingLink(), 1);
    }

    public boolean isCompsVisualizingLinkDisplayed() {
        return isElementPresent(getCompsVisualisingLink(), 1);
    }

    public boolean isCompsIdeasLinkDisplayed() {
        return isElementPresent(getCompsIdeasLink(), 1);
    }

    public boolean isDocsCompsTitleDisplayed() {
        return isElementPresent(getDocsCompsTitle(), 1);
    }

    public boolean isDocsAppsTitleDisplayed() {
        return isElementPresent(getDocsAppsTitle(), 1);
    }

    public boolean isAppsListingLinkDisplayed() {
        return isElementPresent(getAppsListingLink(), 1);
    }

    public boolean isAppsOverviewLinkDisplayed() {
        return isElementPresent(getAppsOvervewLink(), 1);
    }

    public boolean isAppsRunningLinkDisplayed() {
        return isElementPresent(getAppsRunningLink(), 1);
    }

    public boolean isAppsBatchLinkDisplayed() {
        return isElementPresent(getAppsBatchLink(), 1);
    }

    public boolean isAppsExportingLinkDisplayed() {
        return isElementPresent(getAppsExportingLink(), 1);
    }

    public boolean isAppsCWLExportingLinkDisplayed() {
        return isElementPresent(getAppsCWLExportLink(), 1);
    }

    public boolean isAppsWDLExportingLinkDisplayed() {
        return isElementPresent(getAppsWDLExportLink(), 1);
    }

    public boolean isAppsJobDetailsLinkDisplayed() {
        return isElementPresent(getAppsJobDetailsLink(), 1);
    }

    public boolean isDocsCreatingAppsTitleDisplayed() {
        return isElementPresent(getDocsCreatingAppsTitle(), 1);
    }

    public boolean isDocsNotesTitleDisplayed() {
        return isElementPresent(getDocsNotesTitle(), 1);
    }

    public boolean isCrAppsAssetsLinkDisplayed() {
        return isElementPresent(getCrAppsAssetsLink(), 1);
    }

    public boolean isCrAppsBashLinkDisplayed() {
        return isElementPresent(getCrAppsBashLink(), 1);
    }

    public boolean isCrAppsConventionLinkDisplayed() {
        return isElementPresent(getCrAppsConventionLink(), 1);
    }

    public boolean isCrAppsForkingLinkDisplayed() {
        return isElementPresent(getCrAppsForkingLink(), 1);
    }

    public boolean isCrAppsInstanceTypeLinkDisplayed() {
        return isElementPresent(getCrAppsInstanceTypeLink(), 1);
    }

    public boolean isCrAppsIOSpecLinkDisplayed() {
        return isElementPresent(getCrAppsIOSpecLink(), 1);
    }

    public boolean isCrAppsOwnAssetsLinkDisplayed() {
        return isElementPresent(getCrAppsOwnAssetsLink(), 1);
    }

    public boolean isCrAppsScriptLinkDisplayed() {
        return isElementPresent(getCrAppsScriptLink(), 1);
    }

    public boolean isNotesEditingLinkDisplayed() {
        return isElementPresent(getNotesEditingLink(), 1);
    }

    public boolean isNotesIdeasLinkDisplayed() {
        return isElementPresent(getNotesIdeasLink(), 1);
    }

    public boolean isDiscsAnswerLinkDisplayed() {
        return isElementPresent(getDiscsAnswerLink(), 1);
    }

    public boolean isDiscsCommentingLinkDisplayed() {
        return isElementPresent(getDiscsCommentingLink(), 1);
    }

    public boolean isDiscsCreatingLinkDisplayed() {
        return isElementPresent(getDiscsCreatingLink(), 1);
    }

    public boolean isCrAppsVMEnvLinkDisplayed() {
        return isElementPresent(getCrAppsVMEnvLink(), 1);
    }

    public boolean isDocsPublishingTitleDisplayed() {
        return isElementPresent(getDocsPublishingTitle(), 1);
    }

    public boolean isDocsLicensesTitleDisplayed() {
        return isElementPresent(getDocsLicensesTitle(), 1);
    }

    public boolean isDocsVideoTutorialsTitleDisplayed() {
        return isElementPresent(getDocsVideoTutorialsTitle(), 1);
    }

    public DocsPage clickIntroLink() {
        log.info("click Introduction");
        getIntroLink().click();
        return new DocsPage(getDriver());
    }

    public DocsPage clickFilesLink() {
        log.info("click Files");
        getFilesLink().click();
        return new DocsPage(getDriver());
    }

    public DocsPage clickCompsLink() {
        log.info("click Comparisons");
        getCompsLink().click();
        return new DocsPage(getDriver());
    }

    public DocsPage clickAppsLink() {
        log.info("click Apps");
        getAppsLink().click();
        return new DocsPage(getDriver());
    }

    public DocsPage clickCreatingAppsLink() {
        log.info("click Creating Apps");
        getCreatingAppsLink().click();
        return new DocsPage(getDriver());
    }

    public DocsPage clickNotesLink() {
        log.info("click Notes");
        getNotesLink().click();
        return new DocsPage(getDriver());
    }

    public DocsPage clickDiscussionsLink() {
        log.info("click Discussions");
        getDiscsLink().click();
        return new DocsPage(getDriver());
    }

    public DocsPage clickTrackingLink() {
        log.info("click Tracking");
        getTrackingLink().click();
        return new DocsPage(getDriver());
    }

    public DocsPage clickPublishingLink() {
        log.info("click Publishing");
        getPublishingLink().click();
        return new DocsPage(getDriver());
    }

    public DocsPage clickLicensesLink() {
        log.info("click Licenses");
        getLicensesLink().click();
        return new DocsPage(getDriver());
    }

    public DocsPage clickVideoTutorialsLink() {
        log.info("click VideoTutorials");
        getVideoTutorialsLink().click();
        return new DocsPage(getDriver());
    }

}
