package precisionFDA.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.AppsLocators;
import precisionFDA.pages.AbstractPage;

public class AppsManageAssetsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AppsLocators.APPS_MANAGE_MY_ASSETS_LINK)
    private Link appsManageMyAssetsLink;

    @FindBy(xpath = AppsLocators.APPS_MANAGE_FEATURED_LINK)
    private Link appsManageFeaturedLink;

    @FindBy(xpath = AppsLocators.APPS_MANAGE_EXPLORE_LINK)
    private Link appsManageExploreLink;

    @FindBy(xpath = AppsLocators.APPS_MANAGE_CREATE_ASSETS_LINK)
    private Link appsManageCreateAssetsLink;

    public AppsManageAssetsPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_MANAGE_MY_ASSETS_LINK));
    }

    public Link getAppsManageCreateAssetsLink() {
        return appsManageCreateAssetsLink;
    }

    public AppsManageMyAssetsPage openMyAssetsPage() {
        log.info("open ManageAssets.MyAssets page");
        appsManageMyAssetsLink.click();
        return new AppsManageMyAssetsPage(getDriver());
    }

    public AppsManageFeaturedPage openFeaturedPage() {
        log.info("open ManageAssets.Featured page");
        appsManageFeaturedLink.click();
        return new AppsManageFeaturedPage(getDriver());
    }

    public AppsManageExplorePage openExplorePage() {
        log.info("open ManageAssets.Explore page");
        appsManageExploreLink.click();
        return new AppsManageExplorePage(getDriver());
    }

    public AppsManageCreateAssetsPage openCreateAssetsPage() {
        log.info("open ManageAssets.CreateAssets page");
        appsManageCreateAssetsLink.click();
        return new AppsManageCreateAssetsPage(getDriver());
    }

    public boolean isCreateAssetsDisplayed() {
        return isElementPresent(getAppsManageCreateAssetsLink());
    }


}
