package staging.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.blocks.ProfileDropBlock;

import staging.locators.CommonLocators;
import staging.model.Users;
import staging.pages.guidelines.guidelinesPage;
import staging.pages.about.AboutHowPage;
import staging.pages.about.AboutPage;
import staging.pages.apps.AppsPage;
import staging.pages.challs.ChallsPage;
import staging.pages.comps.CompsPage;
import staging.pages.discs.DiscsPage;
import staging.pages.experts.ExpertsPage;
import staging.pages.files.FilesPage;
import staging.pages.licenses.LicensesPage;
import staging.pages.notes.NotesPage;
import staging.pages.overview.OverviewPage;
import staging.pages.profile.ProfilePage;
import staging.pages.profile.PublicProfilePage;

public class CommonPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    private ProfileDropBlock profileDropBlock;

    @FindBy(xpath = CommonLocators.COMMON_NAV_PANEL)
    private WebElement commonNavigationPanel;

    @FindBy(xpath = CommonLocators.LOGGED_USERNAME_LINK)
    private Link loggedUsernameLink;

    @FindBy(xpath = CommonLocators.APPS_PAGE_ICON)
    private Link appsPageIcon;

    @FindBy(xpath = CommonLocators.COMPS_PAGE_ICON)
    private Link compsPageIcon;

    @FindBy(xpath = CommonLocators.FILES_PAGE_ICON)
    private Link filesPageIcon;

    @FindBy(xpath = CommonLocators.NOTES_PAGE_ICON)
    private Link notesPageIcon;

    @FindBy(xpath = CommonLocators.EXPERTS_PAGE_ICON)
    private Link expertsPageIcon;

    @FindBy(xpath = CommonLocators.CHALLS_PAGE_ICON)
    private Link challsPageIcon;

    @FindBy(xpath = CommonLocators.DISCS_PAGE_ICON)
    private Link discsPageIcon;

    @FindBy(xpath = CommonLocators.OVERVIEW_PAGE_ICON)
    private Link overviewPageIcon;

    @FindBy(xpath = CommonLocators.USER_AVATAR_IMG)
    private Link userAvatarImgLink;


    public CommonPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(CommonLocators.COMMON_NAV_PANEL), 30);
        waitForPageToLoadAndVerifyBy(By.xpath(CommonLocators.USER_AVATAR_IMG), 30);
    }

    public WebElement getNavigationPanelWE() {
        return commonNavigationPanel;
    }

    public Link getUsernameLink() {
        return loggedUsernameLink;
    }

    public AppsPage openAppsPage() {
        log.info("open Apps page");
        appsPageIcon.click();
        return new AppsPage(getDriver());
    }

    public CompsPage openCompsPage() {
        log.info("opening Comparisons page");
        compsPageIcon.click();
        return new CompsPage(getDriver());
    }

    public FilesPage openFilesPage() {
        log.info("opening Files page");
        filesPageIcon.click();
        return new FilesPage(getDriver());
    }

    public NotesPage openNotesPage() {
        log.info("opening Notes page");
        notesPageIcon.click();
        return new NotesPage(getDriver());
    }

    public ExpertsPage openExpertsPage() {
        log.info("opening Experts page");
        expertsPageIcon.click();
        return new ExpertsPage(getDriver());
    }

    public ChallsPage openChallsPage() {
        log.info("opening Challenges page");
        challsPageIcon.click();
        return new ChallsPage(getDriver());
    }

    public DiscsPage openDiscsPage() {
        log.info("opening Discussions page");
        discsPageIcon.click();
        return new DiscsPage(getDriver());
    }

    public OverviewPage openOverviewPage() {
        log.info("opening Overview page");
        overviewPageIcon.click();
        return new OverviewPage(getDriver());
    }

    public ProfilePage openProfilePage() {
        log.info("opening Profile page");
        openProfileDropdown();
        profileDropBlock.openProfilePage();
        return new ProfilePage(getDriver());
    }

    public CommonPage openProfileDropdown() {
        sleep(1000);
        loggedUsernameLink.click();
        waitUntilDisplayed(profileDropBlock, 15);
        return new CommonPage(getDriver());
    }

    public PublicProfilePage openPublicProfilePage() {
        log.info("opening Public Profile page");
        openProfileDropdown();
        profileDropBlock.openPublicProfilePage();
        return new PublicProfilePage(getDriver());
    }

    public LicensesPage openLicensePage() {
        log.info("opening License page");
        openProfileDropdown();
        profileDropBlock.openLicensesPage();
        return new LicensesPage(getDriver());
    }

    public AboutPage openAboutPage() {
        log.info("opening About page");
        openProfileDropdown();
        profileDropBlock.openAboutPage();
        return new AboutPage(getDriver());
    }

    public guidelinesPage openGuidelinesPage() {
        log.info("opening guidelines page");
        openProfileDropdown();
        profileDropBlock.openGuidelinesPage();
        return new guidelinesPage(getDriver());
    }

    public AboutHowPage openDocsPage() {
        log.info("opening Docs page");
        openProfileDropdown();
        profileDropBlock.openDocsPage();
        return new AboutHowPage(getDriver());
    }

    public StartPage logout() {
        log.info("logout");
        openProfileDropdown();
        profileDropBlock.logout();
        return new StartPage(getDriver());
    }

    public boolean isNavigationPanelDisplayed() {
        return isElementPresent(getNavigationPanelWE());
    }

    public boolean isCorrectUserNameDisplayed(Users user) {
        return getUsernameLink().getText().equals(user.getApplUserFullName());
    }

}
