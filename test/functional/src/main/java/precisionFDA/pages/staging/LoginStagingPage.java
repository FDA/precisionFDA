package precisionFDA.pages.staging;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import precisionFDA.locators.LoginStagingLocators;
import precisionFDA.pages.AbstractPage;

public class LoginStagingPage extends AbstractPage {

    public LoginStagingPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(LoginStagingLocators.LOGIN_USERNAME_INPUT), 10);
        waitForPageToLoadAndVerifyBy(By.xpath(LoginStagingLocators.LOGIN_PASSWORD_INPUT), 10);
        waitForPageToLoadAndVerifyBy(By.xpath(LoginStagingLocators.LOGIN_SUBMIT_BUTTON), 10);
    }

}