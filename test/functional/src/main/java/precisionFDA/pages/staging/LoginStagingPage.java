package precisionFDA.pages.staging;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import precisionFDA.locators.LoginStagingLocators;
import precisionFDA.pages.AbstractPage;

public class LoginStagingPage extends AbstractPage {

    public LoginStagingPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(LoginStagingLocators.LOGIN_PASSWORD_INPUT), 180);
    }

}