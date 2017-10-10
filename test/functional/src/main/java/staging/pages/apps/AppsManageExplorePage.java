package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.AppsLocators;
import staging.pages.AbstractPage;

public class AppsManageExplorePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AppsLocators.APPS_MANAGE_MAIN_TOOLBAR)
    private WebElement appsManageMainToolbar;

    @FindBy(xpath = AppsLocators.APPS_MANAGE_EXPLORE_ACTIVATED_LINK)
    private Link appsManageExploreActivatedLink;

    public AppsManageExplorePage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_MANAGE_MAIN_TOOLBAR));
    }

    public Link getAppsManageExploreActivatedLink() {
        return appsManageExploreActivatedLink;
    }

}
