package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestUserData;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.dashboard.ActivityReportsPage;
import precisionFDA.pages.dashboard.AdminDashboardPage;
import precisionFDA.pages.dashboard.UsersAndUsagePage;
import precisionFDA.pages.overview.OverviewPage;
import ru.yandex.qatools.htmlelements.annotations.Name;
import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.utils.Utils.*;

@Name("Admin dashboard test suite")
public class OpenDashboardPagesTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader(" -- Successful Login as admin -- ");

        UserProfile user = TestUserData.getAdminUser();

        OverviewPage overviewPage = openLoginPrecisionPage().correctLogin(user).grantAccess();

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
    public void adminDashboardPage() {
        printTestHeader("Test Case: open admin dashboard page");

        AdminDashboardPage dashboardPage = openOverviewPage().openAdminDashboardPage();

        assertThat(
                dashboardPage.isActiveUsersLinkDisplayed())
                .as("Active Users button is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void siteActivityReportPage() {
        printTestHeader("Test Case: site activity report page");

        AdminDashboardPage dashboardPage = openOverviewPage().openAdminDashboardPage();

        assertThat(
                dashboardPage.isActivityReportsLinkDisplayed())
                .as("Activity Reports button is displayed")
                .isTrue();

        ActivityReportsPage reportsPage = dashboardPage.clickActivityReports();

        assertThat(
                reportsPage.isAlertDangerDisplayed())
                .as("Alert danger is displayed")
                .isFalse();

        assertThat(
                reportsPage.isFromDateInputDisplayed())
                .as("From Date Input is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void usersAndUsagePage() {
        printTestHeader("Test Case: Users&Usage page");

        AdminDashboardPage dashboardPage = openOverviewPage().openAdminDashboardPage();

        assertThat(
                dashboardPage.isUsersAndUsageLinkDisplayed())
                .as("Users&Usage button is displayed")
                .isTrue();

        UsersAndUsagePage usersAndUsagePage = dashboardPage.clickUsersAndUsageLink();

        if (!usersAndUsagePage.isNoRecordsFoundDisplayed()) {
            assertThat(
                    usersAndUsagePage.isUsersAndUsageExportCSVDisplayed())
                    .as("Users&Usage export to CSV is displayed")
                    .isTrue();
        }
        else {
            assertThat(
                    usersAndUsagePage.isUsersAndUsageExportCSVDisplayed())
                    .as("Users&Usage export to CSV is NOT displayed because No Records Found")
                    .isFalse();
        }
    }

}