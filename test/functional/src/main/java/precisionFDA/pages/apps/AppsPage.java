package precisionFDA.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.AppsLocators;
import precisionFDA.pages.AbstractPage;

public class AppsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

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

    @FindBy(xpath = AppsLocators.APPS_CREATE_APP_BUTTON_LINK)
    private Link appsCreateAppButtonLink;

    public AppsPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_CREATE_APP_BUTTON_LINK), 30);
    }

    public Link getAppsCreateAppButtonLink() {
        return appsCreateAppButtonLink;
    }

    public Link getAppsExploreLink() {
        return appsExploreLink;
    }

    public Link getAppsFeaturedLink() {
        return appsFeaturedLink;
    }

    public Link getAppsManageAssetsLink() {
        return appsManageAssetsLink;
    }

    public Link getAppsRelevantLink() {
        return appsRelevantLink;
    }

    public AppsRelevantPage openAppsRelevantPage() {
        log.info("open Apps.Relevant Page");
        Link link = getAppsRelevantLink();
        waitUntilDisplayed(link);
        link.click();
        return new AppsRelevantPage(getDriver());
    }

    public AppsFeaturedPage openAppsFeaturedPage() {
        log.info("open Apps.Featured Page");
        Link link = getAppsFeaturedLink();
        waitUntilDisplayed(link);
        link.click();
        return new AppsFeaturedPage(getDriver());
    }

    public AppsExplorePage openAppsExplorePage() {
        log.info("open Apps.Explore Page");
        Link link = getAppsExploreLink();
        waitUntilDisplayed(link);
        link.click();
        return new AppsExplorePage(getDriver());
    }

    public AppsManageAssetsPage openAppsManageAssetsPage() {
        log.info("open Apps.ManageAssets Page");
        Link link = getAppsManageAssetsLink();
        waitUntilDisplayed(link);
        link.click();
        return new AppsManageAssetsPage(getDriver());
    }

    public AppsEditAppPage openCreateAppPage() {
        log.info("open Apps.CreateApp Page");
        Link link = getAppsCreateAppButtonLink();
        waitUntilClickable(link);
        link.click();
        return new AppsEditAppPage(getDriver());
    }

    public boolean isRelevantAppsLinkDisplayed() {
        return isElementPresent(getAppsRelevantLink());
    }

}
