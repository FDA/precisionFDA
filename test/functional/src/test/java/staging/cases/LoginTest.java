package staging.cases;

import org.assertj.core.api.Assert;
import org.assertj.core.api.Assertions;
import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import static org.assertj.core.api.Assertions.assertThat;
import staging.model.User;
import staging.pages.StartPage;
import staging.pages.login.LoginPage;
import staging.pages.overview.OverviewPage;

@Name("Login test suite")
public class LoginTest extends AbstractTest {

    @Test
    public void successfulLoginLogout() {
        printTestHeader("Test Case: Successful Login and logout");

        User user = User.getTestUser();

        OverviewPage overviewPage = openLoginPage(user).correctLogin(user).grantAccess();

        assertThat(
                overviewPage.isNavigationPanelDisplayed())
                .as("navigation panel is displayed")
                .isTrue();

        assertThat(
                overviewPage.getUsernameLinkText())
                .as("logged username")
                .isEqualTo(user.getApplUserFullName());

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
    }

    @Test
    public void loginWithWrongPassword() {
        printTestHeader("Test Case: test login with wrong password");

        User user = User.getWrongUser();

        LoginPage loginPage = openLoginPage(user).wrongLogin(user);

        SoftAssert.assertThat(
                loginPage.isNavigationPanelDisplayed())
                .as("Top Navigation Panel is displayed")
                .isFalse();

        SoftAssert.assertThat(
                loginPage.getLoginWrongCredsMessageText())
                .as("error message")
                .contains("Invalid username or password");

        SoftAssert.assertAll();
    }

}
