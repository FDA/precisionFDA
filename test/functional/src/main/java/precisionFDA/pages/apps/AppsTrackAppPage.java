package precisionFDA.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import precisionFDA.locators.AppsLocators;
import precisionFDA.model.AppProfile;
import precisionFDA.pages.AbstractPage;

public class AppsTrackAppPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    public AppsTrackAppPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_TRACK_PAGE_MAIN_DIV));
    }

    public boolean isAppBlockDisplayed(AppProfile appProfile) {
        String xpath = AppsLocators.APPS_TRACK_PAGE_APP_BLOCK.replace("{APP_TITLE}", appProfile.getCurRevTitleText());
        WebElement el = getDriver().findElement(By.xpath(xpath));
        return el.isDisplayed();
    }

}