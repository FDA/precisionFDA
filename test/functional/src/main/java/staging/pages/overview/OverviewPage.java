package staging.pages.overview;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.blocks.ProfileDropBlock;
import staging.locators.CommonLocators;
import staging.locators.OverviewLocators;
import staging.pages.AbstractPage;
import staging.pages.StartPage;

public class OverviewPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    private ProfileDropBlock profileDropBlock;

    @FindBy(xpath = OverviewLocators.OVERVIEW_WELCOME_TEXT)
    private WebElement overviewWelcomeText;

    @FindBy(xpath = CommonLocators.COMMON_NAV_PANEL)
    private WebElement commonNavigationPanel;

    @FindBy(xpath = CommonLocators.LOGGED_USERNAME_LINK)
    private Link loggedUsernameLink;

    public OverviewPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(CommonLocators.COMMON_NAV_PANEL), 30);
        // waitForPageToLoadAndVerifyBy(By.xpath(CommonLocators.USER_AVATAR_IMG), 5);
    }

    protected ProfileDropBlock getProfileDropBlock() {
        return profileDropBlock;
    }

    public Link getUsernameLink() {
        return loggedUsernameLink;
    }

    public WebElement getNavigationPanelWE() {
        return commonNavigationPanel;
    }

    public WebElement getOverviewWelcomeText() {
        return overviewWelcomeText;
    }

    public boolean isWelcomeTextDisplayed() {
        return isElementPresent(getOverviewWelcomeText());
    }

    public boolean isNavigationPanelDisplayed() {
        return isElementPresent(getNavigationPanelWE());
    }

    public String getUsernameLinkText() {
        return getUsernameLink().getText();
    }

    public void openProfileDropdown() {
        sleep(1000);
        getUsernameLink().click();
        waitUntilDisplayed(getProfileDropBlock(), 15);
    }

    public StartPage logout() {
        log.info("logout");
        openProfileDropdown();
        getProfileDropBlock().logout();
        return new StartPage(getDriver());
    }

}
