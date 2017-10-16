package staging.cases;

import org.apache.log4j.Logger;
import org.testng.annotations.Test;
import staging.model.Users;
import staging.pages.CommonPage;
import staging.pages.StartPage;
import staging.pages.login.LoginPage;

import static org.testng.Assert.assertTrue;

public class LoginTest extends AbstractTest {

    private final Logger log = Logger.getLogger(this.getClass());

    @Test
    public void successfulLogin() {
        logTestHeader("Test Case: Successful Login");

        Users user = Users.getTestUser();

        reopenBrowser();
        openStartPage();
        CommonPage commonPage = correctLoginToFDA(user);

        log.info("check navigation panel is displayed");
        assertTrue(commonPage.isNavigationPanelDisplayed());

        log.info("check correct username is displayed");
        assertTrue(commonPage.isCorrectUserNameDisplayed(user));
    }

    @Test
    public void checkLogoutFeature() {
        logTestHeader("Test Case: check that logout works");

        Users user = Users.getTestUser();

        reopenBrowser();
        openStartPage();
        CommonPage commonPage = correctLoginToFDA(user);
        StartPage startPage = commonPage.logout();

        log.info("check Top Navigation Panel is NOT displayed");
        assertTrue(startPage.isNavigationPanelNotDisplayed());

        log.info("verify 'You were successfully logged out' is displayed");
        assertTrue(startPage.isLogoutMessageDisplayed());
    }

    @Test
    public void loginWithWrongPassword() {
        logTestHeader("Test Case: test login with wrong password");

        Users user = Users.getWrongUser();

        reopenBrowser();
        openStartPage();
        LoginPage loginPage = wrongLoginToFDA(user);

        log.info("check Top Navigation Panel is NOT displayed");
        assertTrue(loginPage.isNavigationPanelNotDisplayed());

        log.info("check 'Invalid username or password' is displayed");
        assertTrue(loginPage.isWrongCredsMessageDisplayed());
    }

}
