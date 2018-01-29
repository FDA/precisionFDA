package precisionFDA.pages.files;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.FilesLocators;
import precisionFDA.pages.AbstractPage;

public class FilesExplorePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = FilesLocators.FILES_EXPLORE_ACTIVATED_LINK)
    private Link filesExploreActivatedLink;

    public FilesExplorePage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_EXPLORE_ACTIVATED_LINK));
    }

    public Link getFilesExploreActivatedLink() {
        return filesExploreActivatedLink;
    }

    public boolean isExploreLinkActivated() {
        return isElementPresent(getFilesExploreActivatedLink());
    }
}
