package precisionFDA.pages.comps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.CompsLocators;
import precisionFDA.pages.AbstractPage;

public class CompsExplorePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = CompsLocators.COMPS_EXPLORE_ACTIVATED_LINK)
    private Link compsExploreActivatedLink;

    public CompsExplorePage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(CompsLocators.COMPS_RUN_COMPARISON_LINK));
    }

    public Link getCompsExploreActivatedLink() {
        return compsExploreActivatedLink;
    }

    public boolean isExploreLinkActivated() {
        return isElementPresent(getCompsExploreActivatedLink());
    }

}
