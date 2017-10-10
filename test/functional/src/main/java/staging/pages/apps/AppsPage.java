package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.AppsLocators;
import staging.pages.AbstractPage;

public class AppsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AppsLocators.APPS_JOBS_LIST)
    private WebElement appsJobsList;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_LINK)
    private Link appsRelevantLink;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_ACTIVATED_LINK)
    private Link appsRelevantActivatedLink;

    @FindBy(xpath = AppsLocators.APPS_FEATURED_LINK)
    private Link appsFeaturedLink;

    @FindBy(xpath = AppsLocators.APPS_FEATURED_ACTIVATED_LINK)
    private Link appsFeaturedActivatedLink;

    @FindBy(xpath = AppsLocators.APPS_EXPLORE_LINK)
    private Link appsExploreLink;

    @FindBy(xpath = AppsLocators.APPS_MANAGE_ASSETS_LINK)
    private Link appsManageAssetsLink;

    public AppsPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_RELEVANT_LINK));
    }

    public AppsRelevantPage openAppsRelevantPage() {
        log.info("open apps.Relevant Page");
        appsRelevantLink.click();
        return new AppsRelevantPage(getDriver());
    }

    public AppsFeaturedPage openAppsFeaturedPage() {
        log.info("open apps.Featured Page");
        appsFeaturedLink.click();
        return new AppsFeaturedPage(getDriver());
    }

    public AppsExplorePage openAppsExplorePage() {
        log.info("open apps.Explore Page");
        appsExploreLink.click();
        return new AppsExplorePage(getDriver());
    }

    public AppsManageAssetsPage openAppsManageAssetsPage() {
        log.info("open apps.ManageAssets Page");
        appsManageAssetsLink.click();
        return new AppsManageAssetsPage(getDriver());
    }

    public Link getAppsRelevantLink() {
        return appsRelevantLink;
    }

}
