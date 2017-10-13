package staging.pages.files;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.FilesLocators;
import staging.pages.AbstractPage;

public class FilesPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = FilesLocators.FILES_MY_FILES_LINK)
    private Link filesMyFilesLink;

    @FindBy(xpath = FilesLocators.FILES_FEATURED_LINK)
    private Link filesFeaturedLink;

    @FindBy(xpath = FilesLocators.FILES_EXPLORE_LINK)
    private Link filesExploreLink;

    @FindBy(xpath = FilesLocators.FILES_ADD_FILES_LINK)
    private Link filesAddFilesLink;

    public FilesPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_MY_FILES_LINK));
    }

    public Link getFilesMyFilesLink() {
        return filesMyFilesLink;
    }

    public FilesMyFilesPage openFilesMyFilesPage() {
        log.info("open Files.MyFiles page");
        filesMyFilesLink.click();
        return new FilesMyFilesPage(getDriver());
    }

    public FilesFeaturedPage openFilesFeaturedPage() {
        log.info("open Files.Featured page");
        filesFeaturedLink.click();
        return new FilesFeaturedPage(getDriver());
    }

    public FilesExplorePage openFilesExplorePage() {
        log.info("open Files.Explore page");
        filesExploreLink.click();
        return new FilesExplorePage(getDriver());
    }

    public FilesAddFilesPage openFilesAddFilesPage() {
        log.info("opening Files.AddFiles page");
        filesAddFilesLink.click();
        return new FilesAddFilesPage(getDriver());
    }

    public boolean isMyFilesLinkDisplayed() {
        return isElementPresent(getFilesMyFilesLink());
    }


}
