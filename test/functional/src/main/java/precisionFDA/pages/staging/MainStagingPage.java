package precisionFDA.pages.staging;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.MainStagingLocators;
import precisionFDA.pages.AbstractPage;

public class MainStagingPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = MainStagingLocators.USER_DD_LINK)
    private Link userDD;

    @FindBy(xpath = MainStagingLocators.LOGOUT_DD_ITEM_LINK)
    private Link logoutItem;

    public MainStagingPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(MainStagingLocators.PROJECTS_LINK), 60);
    }

    public Link getUserDD() {
        return userDD;
    }

    public Link getLogoutItem() {
        return logoutItem;
    }

    public LoginStagingPage logout() {
        log.info("logout from Staging");
        getUserDD().click();
        waitUntilClickable(getLogoutItem());
        getLogoutItem().click();
        return new LoginStagingPage(getDriver());
    }

}