package staging.pages.login;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.locators.LoginLocators;
import staging.pages.AbstractPage;

public class LoginPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = LoginLocators.LOGIN_LOGIN_FORM)
    private WebElement loginLoginForm;

    @FindBy(xpath = LoginLocators.LOGIN_USERNAME_INPUT)
    private TextInput loginUsernameInput;

    @FindBy(xpath = LoginLocators.LOGIN_PASSWORD_INPUT)
    private TextInput loginPasswordInput;

    @FindBy(xpath = LoginLocators.LOGIN_SUBMIT_BUTTON)
    private Button loginSubmitButton;

    public LoginPage(final WebDriver driver) {
        super(driver);
        waitUntilJSReady();
        waitForPageToLoadAndVerifyBy(By.xpath(LoginLocators.LOGIN_PASSWORD_INPUT), 60);
    }

    public GrantAccessLoginPage loginToPrecisionFDA(String FDAUsername, String FDAPassword) {
        log.info("login to PrecisionFDA page");
        loginUsernameInput.sendKeys(FDAUsername);
        loginPasswordInput.sendKeys(FDAPassword);
        loginSubmitButton.click();
        return new GrantAccessLoginPage(getDriver());
    }


}
