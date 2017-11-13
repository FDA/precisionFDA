package staging.pages.staging;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import staging.locators.LoginStagingLocators;
import staging.pages.AbstractPage;

public class LoginStagingPage extends AbstractPage {

    public LoginStagingPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(LoginStagingLocators.LOGIN_PASSWORD_INPUT), 180);
    }

}