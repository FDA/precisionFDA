package precisionFDA.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;

import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.AppsLocators;
import precisionFDA.pages.AbstractPage;

public class AppsExplorePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AppsLocators.APPS_EXPLORE_ACTIVATED_LINK)
    private Link appsExploreActivatedLink;

    public AppsExplorePage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_MAIN_DIV));
    }

    public Link getAppsExploreActivatedLink() {
        return appsExploreActivatedLink;
    }

    public boolean isExploreLinkActivated() {
        return isElementPresent(getAppsExploreActivatedLink());
    }
}
