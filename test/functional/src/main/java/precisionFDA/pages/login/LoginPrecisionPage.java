package precisionFDA.pages.login;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.TextInput;
import precisionFDA.locators.CommonLocators;
import precisionFDA.locators.LoginPrecisionLocators;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.AbstractPage;

public class LoginPrecisionPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = LoginPrecisionLocators.LOGIN_LOGIN_FORM)
    private WebElement loginLoginForm;

    @FindBy(xpath = LoginPrecisionLocators.LOGIN_USERNAME_INPUT)
    private TextInput loginUsernameInput;

    @FindBy(xpath = LoginPrecisionLocators.LOGIN_PASSWORD_INPUT)
    private TextInput loginPasswordInput;

    @FindBy(xpath = LoginPrecisionLocators.LOGIN_SUBMIT_BUTTON)
    private Button loginSubmitButton;

    @FindBy(xpath = CommonLocators.COMMON_NAV_PANEL)
    private WebElement commonNavigationPanel;

    @FindBy(xpath = LoginPrecisionLocators.LOGIN_WRONG_CREDS_MESSAGE)
    private WebElement loginWrongCredsMessage;

    public LoginPrecisionPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(LoginPrecisionLocators.LOGIN_PASSWORD_INPUT), 180);
    }

    public boolean isNavigationPanelDisplayed() {
        return isElementPresent(getNavigationPanelWE(), 2);
    }

    public WebElement getNavigationPanelWE() {
        return commonNavigationPanel;
    }

    public WebElement getLoginWrongCredsMessage() {
        return loginWrongCredsMessage;
    }

    public String getLoginWrongCredsMessageText() {
        return getLoginWrongCredsMessage().getText();
    }

    public GrantAccessLoginPage correctLogin(UserProfile user) {
        log.info("correct login to PrecisionFDA page");
        loginUsernameInput.sendKeys(user.getApplUsername());
        loginPasswordInput.sendKeys(user.getApplPassword());
        loginSubmitButton.click();
        return new GrantAccessLoginPage(getDriver());
    }

    public LoginPrecisionPage wrongLogin(UserProfile user) {
        log.info("wrong login to PrecisionFDA page");
        loginUsernameInput.sendKeys(user.getApplUsername());
        loginPasswordInput.sendKeys(user.getApplPassword());
        loginSubmitButton.click();
        return new LoginPrecisionPage(getDriver());
    }

}