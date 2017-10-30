package staging.cases;

import org.testng.annotations.Test;
import staging.model.User;
import staging.pages.StartPage;
import staging.pages.login.LoginPage;
import staging.pages.overview.OverviewPage;

public class LoginTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader("Test Case: Successful Login");

        User user = User.getTestUser();

        openBrowser();
        OverviewPage overviewPage = correctLoginToFDA(user);

        SoftAssert.assertThat(
                overviewPage.isNavigationPanelDisplayed())
                .as("navigation panel is displayed")
                .isTrue();

        SoftAssert.assertThat(
                overviewPage.getUsernameLinkText())
                .as("logged username")
                .isEqualTo(user.getApplUserFullName());

        SoftAssert.assertAll();
        closeBrowser();
    }

    @Test
    public void checkLogoutFeature() {
        printTestHeader("Test Case: check that logout works");

        User user = User.getTestUser();

        openBrowser();
        OverviewPage overviewPage = correctLoginToFDA(user);
        StartPage startPage = overviewPage.logout();

        SoftAssert.assertThat(
                startPage.isNavigationPanelDisplayed())
                .as("Top Navigation Panel is displayed")
                .isFalse();

        SoftAssert.assertThat(
                startPage.getMessageAreaText())
                .as("success message")
                .contains("You were successfully logged out");

        SoftAssert.assertAll();
        closeBrowser();
    }

    @Test
    public void loginWithWrongPassword() {
        printTestHeader("Test Case: test login with wrong password");

        User user = User.getWrongUser();

        openBrowser();
        LoginPage loginPage = wrongLoginToFDA(user);

        SoftAssert.assertThat(
                loginPage.isNavigationPanelDisplayed())
                .as("Top Navigation Panel is displayed")
                .isFalse();

        SoftAssert.assertThat(
                loginPage.getLoginWrongCredsMessageText())
                .as("error message")
                .contains("Invalid username or password");

        SoftAssert.assertAll();
        closeBrowser();
    }

}
