package staging.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.MainLocators;
import staging.pages.login.LoginPage;

public class MainPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = MainLocators.MAIN_LOGIN_LINK)
    private Link mainLoginLink;

    public MainPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(MainLocators.MAIN_LOGIN_LINK), 30);
    }

    public LoginPage openLoginPage(String basicAuthUser, String basicAuthPassword) {
        log.info("open Login page");

        String url = "https://" + basicAuthUser +
                ":" + basicAuthPassword + "" +
                "@staging.dnanexus.com/login?scope=%7B%22full%22%3A+true%7D&redirect_uri=" +
                "https%3A%2F%2F52.90.134.199%2Freturn_from_login&client_id=precision_fda";

        getDriver().get(url);

        return new LoginPage(getDriver());
    }

}
