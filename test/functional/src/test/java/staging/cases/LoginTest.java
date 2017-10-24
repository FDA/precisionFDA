package staging.cases;

import org.testng.annotations.Test;
import staging.model.Users;
import staging.pages.CommonPage;
import staging.pages.StartPage;
import staging.pages.login.LoginPage;

public class LoginTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader("Test Case: Successful Login");

        Users user = Users.getTestUser();

        reopenBrowser();
        openStartPage();
        CommonPage commonPage = correctLoginToFDA(user);

        SoftAssert.assertThat(
                commonPage.isNavigationPanelDisplayed())
                .as("navigation panel is displayed")
                .isTrue();

        SoftAssert.assertThat(
                commonPage.isCorrectUserNameDisplayed(user))
                .as("logged username is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test
    public void checkLogoutFeature() {
        printTestHeader("Test Case: check that logout works");

        Users user = Users.getTestUser();

        reopenBrowser();
        openStartPage();
        CommonPage commonPage = correctLoginToFDA(user);
        StartPage startPage = commonPage.logout();

        SoftAssert.assertThat(
                startPage.isNavigationPanelDisplayed())
                .as("Top Navigation Panel")
                .isFalse();

        SoftAssert.assertThat(
                startPage.isLogoutMessageDisplayed())
                .as("'You were successfully logged out' message")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test
    public void loginWithWrongPassword() {
        printTestHeader("Test Case: test login with wrong password");

        Users user = Users.getWrongUser();

        reopenBrowser();
        openStartPage();
        LoginPage loginPage = wrongLoginToFDA(user);

        SoftAssert.assertThat(
                loginPage.isNavigationPanelDisplayed())
                .as("Top Navigation Panel")
                .isFalse();

        SoftAssert.assertThat(
                loginPage.isWrongCredsMessageDisplayed())
                .as("'Invalid username or password' message")
                .isTrue();

        SoftAssert.assertAll();
    }

}
