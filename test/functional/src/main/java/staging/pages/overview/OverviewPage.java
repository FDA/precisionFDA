package staging.pages.overview;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import staging.locators.CommonLocators;
import staging.locators.OverviewLocators;
import staging.pages.AbstractPage;

public class OverviewPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = OverviewLocators.OVERVIEW_WELCOME_TEXT)
    private WebElement overviewWelcomeText;

    public OverviewPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(CommonLocators.COMMON_NAV_PANEL), 30);
        waitForPageToLoadAndVerifyBy(By.xpath(CommonLocators.USER_AVATAR_IMG), 5);
    }

    public WebElement getOverviewWelcomeText() {
        return overviewWelcomeText;
    }

    public boolean isWelcomeTextDisplayed() {
        return isElementPresent(getOverviewWelcomeText());
    }

}
