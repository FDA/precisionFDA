package staging.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.CommonLocators;
import staging.locators.PrecisionFDALocators;
import staging.pages.apps.AppsPage;
import staging.pages.comps.CompsPage;
import staging.pages.files.FilesAddFilesPage;
import staging.pages.files.FilesPage;
import staging.pages.notes.NotesPage;

public class PrecisionFDAPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = PrecisionFDALocators.FDANavigationPanel)
    private WebElement FDANavigationPanel;

    @FindBy(xpath = PrecisionFDALocators.FDALoggedUsernameLink)
    private Link FDALoggedUsernameLink;

    @FindBy(xpath = CommonLocators.APPS_PAGE_ICON)
    private Link appsPageIcon;

    @FindBy(xpath = CommonLocators.COMPS_PAGE_ICON)
    private Link compsPageIcon;

    @FindBy(xpath = CommonLocators.FILES_PAGE_ICON)
    private Link filesPageIcon;

    @FindBy(xpath = CommonLocators.NOTES_PAGE_ICON)
    private Link notesPageIcon;

    public PrecisionFDAPage(final WebDriver driver) {
        super(driver);
        waitUntilJSReady();
        waitForPageToLoadAndVerifyBy(By.xpath(PrecisionFDALocators.FDANavigationPanel), 30);
    }

    public WebElement getNavigationPanelWE() {
        return FDANavigationPanel;
    }

    public Link getUsernameLink() {
        return FDALoggedUsernameLink;
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


}
