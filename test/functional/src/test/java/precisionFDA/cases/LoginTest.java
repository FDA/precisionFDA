package precisionFDA.cases;

import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.utils.Utils.printTestHeader;

import precisionFDA.data.TestUserData;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.StartPage;
import precisionFDA.pages.login.LoginPrecisionPage;
import precisionFDA.pages.overview.OverviewPage;

@Name("Login test suite")
public class LoginTest extends AbstractTest {

    @Test
    public void successfulLoginLogoutPrecisionFDA() {
        printTestHeader("Test Case: Successful Login to Precision FDA and logout");

        logoutFromPlatform();

        UserProfile user = TestUserData.getTestUserOne();

        StartPage startPage = openStartPage();
        LoginPrecisionPage loginPrecisionPage = startPage.clickLogin();

        OverviewPage overviewPage = loginPrecisionPage.correctLogin(user).grantAccess();

        assertThat(
                overviewPage.isNavigationPanelDisplayed())
                .as("navigation panel is displayed")
                .isTrue();

        assertThat(
                overviewPage.getUsernameLinkText())
                .as("logged username")
                .isEqualTo(user.getApplUserFullName());

        startPage = overviewPage.logout();

        SoftAssert.assertThat(
                startPage.isNavigationPanelDisplayed())
                .as("Top Navigation Panel is displayed")
                .isFalse();

        SoftAssert.assertThat(
                startPage.getMessageAreaText())
                .as("success message")
                .contains("You were successfully logged out");

        SoftAssert.assertThat(
                startPage.isLoginLinkDisplayed())
                .as("Login button is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test
    public void loginWithWrongPassword() {
        printTestHeader("Test Case: test login with wrong password");

        logoutFromPlatform();

        UserProfile user = TestUserData.getWrongUser();

        LoginPrecisionPage loginPrecisionPage = openLoginPrecisionPage().wrongLogin(user);

        SoftAssert.assertThat(
                loginPrecisionPage.isNavigationPanelDisplayed())
                .as("Top Navigation Panel is displayed")
                .isFalse();

        SoftAssert.assertThat(
                loginPrecisionPage.getLoginWrongCredsMessageText())
                .as("error message")
                .contains("Invalid username or password");

        SoftAssert.assertAll();
    }

}
