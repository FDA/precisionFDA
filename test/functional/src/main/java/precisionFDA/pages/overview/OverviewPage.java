package precisionFDA.pages.overview;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.FilesLocators;
import precisionFDA.pages.dashboard.AdminDashboardPage;
import precisionFDA.pages.docs.DocsPage;
import precisionFDA.pages.spaces.SpacesPage;
import precisionFDA.pages.wf.WorkflowsPage;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.blocks.ProfileDropBlock;
import precisionFDA.locators.CommonLocators;
import precisionFDA.locators.OverviewLocators;
import precisionFDA.pages.AbstractPage;
import precisionFDA.pages.StartPage;
import precisionFDA.pages.about.AboutPage;
import precisionFDA.pages.apps.AppsPage;
import precisionFDA.pages.challs.ChallsPage;
import precisionFDA.pages.comps.CompsPage;
import precisionFDA.pages.discs.DiscsPage;
import precisionFDA.pages.experts.ExpertsPage;
import precisionFDA.pages.files.FilesPage;
import precisionFDA.pages.guidelines.GuidelinesPage;
import precisionFDA.pages.licenses.LicensesPage;
import precisionFDA.pages.notes.NotesPage;
import precisionFDA.pages.profile.ProfilePage;
import precisionFDA.pages.profile.PublicProfilePage;

import static precisionFDA.utils.Utils.sleep;

public class OverviewPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    private ProfileDropBlock profileDropBlock;

    @FindBy(xpath = OverviewLocators.OVERVIEW_WELCOME_TEXT)
    private WebElement overviewWelcomeText;

    @FindBy(xpath = CommonLocators.COMMON_NAV_PANEL)
    private WebElement commonNavigationPanel;

    @FindBy(xpath = CommonLocators.LOGGED_USERNAME_LINK)
    private Link loggedUsernameLink;

    public OverviewPage(final WebDriver driver) {
        super(driver);
        // waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(CommonLocators.COMMON_NAV_PANEL), 30);
        waitForPageToLoadAndVerifyBy(By.xpath(CommonLocators.APPS_PAGE_ICON), 5);
    }

    protected ProfileDropBlock getProfileDropBlock() {
        return profileDropBlock;
    }

    public Link getUsernameLink() {
        return loggedUsernameLink;
    }

    public WebElement getNavigationPanelWE() {
        return commonNavigationPanel;
    }

    public WebElement getOverviewWelcomeText() {
        return overviewWelcomeText;
    }

    public boolean isWelcomeTextDisplayed() {
        return isElementPresent(getOverviewWelcomeText());
    }

    public boolean isNavigationPanelDisplayed() {
        return isElementPresent(getNavigationPanelWE());
    }

    public String getUsernameLinkText() {
        return getUsernameLink().getText();
    }

    public void openProfileDropdown() {
        sleep(1000);
        getUsernameLink().click();
        waitUntilDisplayed(getProfileDropBlock(), 15);
    }

    public StartPage logout() {
        log.info("logout");
        openProfileDropdown();
        getProfileDropBlock().logout();
        return new StartPage(getDriver());
    }

    public NotesPage openNotesPage() {
        return getCommonPage().openNotesPage();
    }

    public AppsPage openAppsPage() {
        return getCommonPage().openAppsPage();
    }

    public CompsPage openCompsPage() {
        return getCommonPage().openCompsPage();
    }

    public FilesPage openFilesPage() {
        return getCommonPage().openFilesPage();
    }

    public ExpertsPage openExpertsPage() {
        return getCommonPage().openExpertsPage();
    }

    public ChallsPage openChallsPage() {
        return getCommonPage().openChallsPage();
    }

    public DiscsPage openDiscsPage() {
        return getCommonPage().openDiscsPage();
    }

    public ProfilePage openProfilePage() {
        return getCommonPage().openProfilePage();
    }

    public PublicProfilePage openPublicProfilePage() {
        return getCommonPage().openPublicProfilePage();
    }

    public LicensesPage openLicensePage() {
        return getCommonPage().openLicensePage();
    }

    public AboutPage openAboutPage() {
        return getCommonPage().openAboutPage();
    }

    public GuidelinesPage openGuidelinesPage() {
        return getCommonPage().openGuidelinesPage();
    }

    public AdminDashboardPage openAdminDashboardPage() {
        return getCommonPage().openAdminDashboardPage();
    }

    public DocsPage openDocsPage() {
        return getCommonPage().openDocsPage();
    }

    public SpacesPage openSpacesPage() {
        return getCommonPage().openSpacesPage();
    }

    public WorkflowsPage openWorkflowsPage() {
        return getCommonPage().openWorkflowsPage();
    }

}
