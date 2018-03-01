package precisionFDA.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.AppsLocators;
import precisionFDA.pages.AbstractPage;

public class AppsManageCreateAssetsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AppsLocators.APPS_MANAGE_CREATE_ASSETS_GENERATE_KEY_LINK)
    private Link appsManageCreateAssetsGenerateKeyLink;

    public AppsManageCreateAssetsPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_MANAGE_CREATE_ASSETS_GENERATE_KEY_LINK));
    }

    public Link getAppsManageCreateAssetsGenerateKeyLink() {
        return appsManageCreateAssetsGenerateKeyLink;
    }

    public boolean isGenerateKeyLinkDisplayed() {
        return isElementPresent(getAppsManageCreateAssetsGenerateKeyLink());
    }
}
