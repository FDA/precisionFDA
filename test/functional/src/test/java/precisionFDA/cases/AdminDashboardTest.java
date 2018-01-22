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
    public void exportActiveUsers() {
        printTestHeader("Test Case: export active users and verify");

        AdminDashboardPage dashboardPage = openOverviewPage().openAdminDashboardPage();

        assertThat(
                dashboardPage.isActiveUsersLinkDisplayed())
                .as("Active Users button is displayed")
                .isTrue();

        removeActiveUsersFileFromDownloads();
        dashboardPage.clickActiveUsers();
        alertAccept(5, 500);
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

    @Test(dependsOnMethods = {"successfulLogin"})
    public void verifyActivityReportingPage() {
        printTestHeader("Test Case: verify all widgets are displayed");

        AdminDashboardPage dashboardPage = openOverviewPage().openAdminDashboardPage();

        assertThat(
                dashboardPage.isActivityReportsLinkDisplayed())
                .as("Activity Reports button is displayed")
                .isTrue();

        ActivityReportsPage reportsPage = dashboardPage.clickActivityReports();

        assertThat(
                reportsPage.areChartsDisplayed())
                .as("All charts are displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void handleWrongPeriodOfActivityReport() {
        printTestHeader("Test Case: try to set wrong date period on the Activity Report page");

        AdminDashboardPage dashboardPage = openOverviewPage().openAdminDashboardPage();
        ActivityReportsPage reportsPage = dashboardPage.clickActivityReports();

        assertThat(
                reportsPage.isFromDateInputDisplayed())
                .as("From Date input is displayed")
                .isTrue();

        assertThat(
                reportsPage.isToDateInputDisplayed())
                .as("To Date input is displayed")
                .isTrue();

        reportsPage.setFromDateAsFirstDayNextMonth();
        reportsPage.clickSubmitDatePeriod();

        assertThat(
                reportsPage.isWrongPeriodErrorDisplayed())
                .as("Wrong Period error is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkDateRangeButtons() {
        printTestHeader("Test Case: verify Date Range buttons are working correctly");

        AdminDashboardPage dashboardPage = openOverviewPage().openAdminDashboardPage();
        ActivityReportsPage reportsPage = dashboardPage.clickActivityReports();

        assertThat(
                reportsPage.isDayDateRangeButtonDisplayed())
                .as("Day Date Range button is displayed")
                .isTrue();

        assertThat(
                reportsPage.isWeekDateRangeButtonDisplayed())
                .as("Week Date Range button is displayed")
                .isTrue();

        assertThat(
                reportsPage.isMonthDateRangeButtonDisplayed())
                .as("Month Date Range button is displayed")
                .isTrue();

        assertThat(
                reportsPage.isYearDateRangeButtonDisplayed())
                .as("Year Date Range button is displayed")
                .isTrue();

        assertThat(
                reportsPage.toDateEqualsToday())
                .as("To Date input has Today date")
                .isTrue();

        reportsPage.clickDayRangeButton();

        assertThat(
                reportsPage.toDateEqualsToday())
                .as("To Date input has Today date")
                .isTrue();

        assertThat(
                reportsPage.fromDateEqualsYesterday())
                .as("From Date input has Yesterday date")
                .isTrue();

        reportsPage.clickWeekRangeButton();

        assertThat(
                reportsPage.toDateEqualsToday())
                .as("To Date input has Today date")
                .isTrue();

        assertThat(
                reportsPage.fromDateEqualsLastSunday())
                .as("From Date input has last Sunday date")
                .isTrue();

        reportsPage.clickMonthRangeButton();

        assertThat(
                reportsPage.toDateEqualsToday())
                .as("To Date input has Today date")
                .isTrue();

        assertThat(
                reportsPage.fromDateEqualsFirstDayOfCurrentMonth())
                .as("From Date input has the first day of the current month")
                .isTrue();

        reportsPage.clickYearRangeButton();

        SoftAssert.assertThat(
                reportsPage.toDateEqualsToday())
                .as("To Date input has Today date")
                .isTrue();

        SoftAssert.assertThat(
                reportsPage.fromDateEqualsFirstDayOfCurrentYear())
                .as("From Date input has the first day of the current year")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void exportUsersAndUsage() {
        printTestHeader("Test Case: export Users&Usage and verify");

        AdminDashboardPage dashboardPage = openOverviewPage().openAdminDashboardPage();

        assertThat(
                dashboardPage.isUsersAndUsageLinkDisplayed())
                .as("Users&Usage button is displayed")
                .isTrue();

        UsersAndUsagePage usersAndUsagePage = dashboardPage.clickUsersAndUsageLink();

        assertThat(
                usersAndUsagePage.isUsersAndUsageExportCSVDisplayed())
                .as("Users&Usage export to CSV is displayed")
                .isTrue();

        removeUsersAndUsageFileFromDownloads();
        usersAndUsagePage.exportToCSV();
        usersAndUsagePage.waitUntilUsersAndUsageFileIsDownloaded();

        assertThat(
                usersAndUsagePage.isUsersAndUsageFileDownloaded())
                .as("Users&Usage file is downloaded")
                .isTrue();

        assertThat(
                usersAndUsagePage.isUsersAndUsageFileCorrect())
                .as("Users&Usage file is correct one")
                .isTrue();
    }

}