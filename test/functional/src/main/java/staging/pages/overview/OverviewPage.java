package staging.pages.overview;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.blocks.ProfileDropBlock;
import staging.locators.CommonLocators;
import staging.locators.OverviewLocators;
import staging.pages.AbstractPage;
import staging.pages.StartPage;
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
import staging.pages.profile.ProfilePage;
import staging.pages.profile.PublicProfilePage;

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
        waitForPageToLoadAndVerifyBy(By.xpath(CommonLocators.COMMON_NAV_PANEL), 30);
        // waitForPageToLoadAndVerifyBy(By.xpath(CommonLocators.USER_AVATAR_IMG), 5);
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

    public AboutHowPage openDocsPage() {
        return getCommonPage().openDocsPage();
    }

}
