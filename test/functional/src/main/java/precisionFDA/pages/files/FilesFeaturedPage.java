package precisionFDA.pages.files;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;

import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.FilesLocators;
import precisionFDA.pages.AbstractPage;

public class FilesFeaturedPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = FilesLocators.FILES_FEATURED_ACTIVATED_LINK)
    private Link filesFeaturedActivatedLink;

    public FilesFeaturedPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_FEATURED_ACTIVATED_LINK));
    }

    public Link getFilesFeaturedActivatedLink() {
        return filesFeaturedActivatedLink;
    }

    public boolean isFeaturedLinkActivated() {
        return isElementPresent(getFilesFeaturedActivatedLink());
    }
}
