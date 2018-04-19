package precisionFDA.pages.platform;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.PlatformLocators;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.pages.AbstractPage;

public class MainPlatformPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = PlatformLocators.USER_DD_LINK)
    private Link userDD;

    @FindBy(xpath = PlatformLocators.LOGOUT_DD_ITEM_LINK)
    private Link logoutItem;

    public MainPlatformPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(PlatformLocators.PROJECTS_LINK), 30);
        waitForPageToLoadAndVerifyBy(By.xpath(PlatformLocators.USER_DD_LINK), 2);
    }

    public Link getUserDD() {
        return userDD;
    }

    public Link getLogoutItem() {
        return logoutItem;
    }

    public LoginPlatformPage logout() {
        log.info("logout from Platform");
        getUserDD().click();
        waitUntilClickable(getLogoutItem());
        getLogoutItem().click();
        return new LoginPlatformPage(getDriver());
    }

}