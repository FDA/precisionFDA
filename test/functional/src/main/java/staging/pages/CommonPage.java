package staging.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.blocks.ProfileDropBlock;
import staging.locators.CommonLocators;
import staging.pages.about.AboutHowPage;
import staging.pages.about.AboutPage;
import staging.pages.apps.AppsPage;
import staging.pages.challs.ChallsPage;
import staging.pages.comps.CompsPage;
import staging.pages.discs.DiscsPage;
import staging.pages.experts.ExpertsPage;
import staging.pages.files.FilesPage;
import staging.pages.guidelines.GuidelinesPage;
import staging.pages.licenses.LicensesPage;
import staging.pages.notes.NotesPage;
import staging.pages.overview.OverviewPage;
import staging.pages.profile.ProfilePage;
import staging.pages.profile.PublicProfilePage;

public class CommonPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    public CommonPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(CommonLocators.COMMON_NAV_PANEL));
    }

    private ProfileDropBlock profileDropBlock;

    @FindBy(xpath = CommonLocators.APPS_PAGE_ICON)
    private static Link appsPageIcon;

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

    @FindBy(xpath = CommonLocators.LOGGED_USERNAME_LINK)
    private Link loggedUsernameLink;

    protected ProfileDropBlock getProfileDropBlock() {
        return profileDropBlock;
    }

    public Link getNotesPageIcon() {
        return notesPageIcon;
    }

    public Link getAppsPageIcon() {
        return appsPageIcon;
    }

    public Link getOverviewPageIcon() {
        return overviewPageIcon;
    }

    public Link getCompsPageIcon() {
        return compsPageIcon;
    }

    public Link getChallsPageIcon() {
        return challsPageIcon;
    }

    public Link getDiscsPageIcon() {
        return discsPageIcon;
    }

    public Link getExpertsPageIcon() {
        return expertsPageIcon;
    }

    public Link getFilesPageIcon() {
        return filesPageIcon;
    }

    public Link getUsernameLink() {
        return loggedUsernameLink;
    }

    public AppsPage openAppsPage() {
        log.info("opening Apps page");
        Link link = getAppsPageIcon();
        waitUntilClickable(link);
        link.click();
        return new AppsPage(getDriver());
    }

    public CompsPage openCompsPage() {
        log.info("opening Comparisons page");
        Link link = getCompsPageIcon();
        waitUntilClickable(link);
        link.click();
        return new CompsPage(getDriver());
    }

    public FilesPage openFilesPage() {
        log.info("opening Files page");
        Link link = getFilesPageIcon();
        waitUntilClickable(link);
        link.click();
        return new FilesPage(getDriver());
    }

    public NotesPage openNotesPage() {
        log.info("opening Notes page");
        Link link = getNotesPageIcon();
        waitUntilClickable(link);
        link.click();
        return new NotesPage(getDriver());
    }

    public ExpertsPage openExpertsPage() {
        log.info("opening Experts page");
        Link link = getExpertsPageIcon();
        waitUntilClickable(link);
        link.click();
        return new ExpertsPage(getDriver());
    }

    public ChallsPage openChallsPage() {
        log.info("opening Challenges page");
        Link link = getChallsPageIcon();
        waitUntilClickable(link);
        link.click();
        return new ChallsPage(getDriver());
    }

    public DiscsPage openDiscsPage() {
        log.info("opening Discussions page");
        Link link = getDiscsPageIcon();
        waitUntilClickable(link);
        link.click();
        return new DiscsPage(getDriver());
    }

    public OverviewPage openOverviewPage() {
        log.info("opening Overview page");
        Link link = getOverviewPageIcon();
        waitUntilClickable(link);
        link.click();
        return new OverviewPage(getDriver());
    }

    public ProfilePage openProfilePage() {
        log.info("opening Profile page");
        openProfileDropdown();
        getProfileDropBlock().openProfilePage();
        return new ProfilePage(getDriver());
    }

    public void openProfileDropdown() {
        sleep(1000);
        Link link = getUsernameLink();
        waitUntilClickable(link);
        link.click();
        waitUntilDisplayed(getProfileDropBlock(), 30);
    }

    public PublicProfilePage openPublicProfilePage() {
        log.info("opening Public Profile page");
        openProfileDropdown();
        getProfileDropBlock().openPublicProfilePage();
        return new PublicProfilePage(getDriver());
    }

    public LicensesPage openLicensePage() {
        log.info("opening License page");
        openProfileDropdown();
        getProfileDropBlock().openLicensesPage();
        return new LicensesPage(getDriver());
    }

    public AboutPage openAboutPage() {
        log.info("opening About page");
        openProfileDropdown();
        getProfileDropBlock().openAboutPage();
        return new AboutPage(getDriver());
    }

    public GuidelinesPage openGuidelinesPage() {
        log.info("opening guidelines page");
        openProfileDropdown();
        getProfileDropBlock().openGuidelinesPage();
        return new GuidelinesPage(getDriver());
    }

    public AboutHowPage openDocsPage() {
        log.info("opening Docs page");
        openProfileDropdown();
        getProfileDropBlock().openDocsPage();
        return new AboutHowPage(getDriver());
    }

    public StartPage logout() {
        log.info("logout");
        openProfileDropdown();
        getProfileDropBlock().logout();
        getDriver().manage().deleteAllCookies();
        return new StartPage(getDriver());
    }

}
