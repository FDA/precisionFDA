package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestUserData;
import precisionFDA.model.AppProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.apps.*;
import precisionFDA.pages.dashboard.AdminDashboardPage;
import precisionFDA.pages.overview.OverviewPage;
import ru.yandex.qatools.htmlelements.annotations.Name;

import static org.assertj.core.api.Assertions.assertThat;
import static org.testng.Assert.assertTrue;
import static precisionFDA.data.TestAppData.*;
import static precisionFDA.data.TestRunData.*;
import static precisionFDA.utils.Utils.*;

@Name("Admin dashboard test suite")
public class AdminDashboardTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader(" -- Successful Login as admin -- ");

        UserProfile user = TestUserData.getAdminUser();

        OverviewPage overviewPage = openLoginPrecisionPage(user).correctLogin(user).grantAccess();

        SoftAssert.assertThat(
                overviewPage.isNavigationPanelDisplayed())
                .as("navigation panel is displayed")
                .isTrue();

        SoftAssert.assertThat(
                overviewPage.getUsernameLinkText())
                .as("logged username")
                .isEqualTo(user.getApplUserFullName());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void downloadActiveUsers() {
        printTestHeader("Test Case: download active users and verify");

        AdminDashboardPage dashboardPage = openOverviewPage().openAdminDashboardPage();

        assertThat(
                dashboardPage.isActiveUsersLinkDisplayed())
                .as("Active Users is displayed")
                .isTrue();

        removeActiveUsersFileFromDownloads();
        dashboardPage.clickActiveUsers();
        dashboardPage.waitUntilActiveUsersFileIsDownloaded();

        assertThat(
                dashboardPage.isActiveUsersFileDownloaded())
                .as("Active Users file is downloaded")
                .isTrue();

        assertThat(
                dashboardPage.isActiveUsersFileCorrect())
                .as("Active Users file is correct one")
                .isTrue();
    }

}