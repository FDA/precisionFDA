package precisionFDA.pages.platform;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import precisionFDA.locators.PlatformLocators;
import precisionFDA.pages.AbstractPage;

public class LoginPlatformPage extends AbstractPage {

    public LoginPlatformPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(PlatformLocators.LOGIN_USERNAME_INPUT), 10);
        waitForPageToLoadAndVerifyBy(By.xpath(PlatformLocators.LOGIN_PASSWORD_INPUT), 1);
        waitForPageToLoadAndVerifyBy(By.xpath(PlatformLocators.LOGIN_SUBMIT_BUTTON), 1);
    }

}