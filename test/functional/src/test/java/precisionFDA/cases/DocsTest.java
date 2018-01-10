package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestUserData;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.docs.DocsPage;
import precisionFDA.pages.overview.OverviewPage;
import ru.yandex.qatools.htmlelements.annotations.Name;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Docs test suite")
public class DocsTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader(" -- Successful Login -- ");

        UserProfile user = TestUserData.getTestUser();

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
    public void openDocsPage() {
        printTestHeader("Test Case: open Docs page");

        DocsPage docsPage = getCommonPage().openDocsPage();

        assertThat(
                docsPage.isDocsListTitleDisplayed())
                .as("'Documentation' list title is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin", "openDocsPage"})
    public void checkDocsIntroductionPage() {
        printTestHeader("Test Case: check Docs Introduction page");

        DocsPage docsPage = getDocsPage();

        assertThat(
                docsPage.isIntroLinkDisplayed())
                .as("Link to Docs Introduction page is displayed")
                .isTrue();

        docsPage.clickIntroLink();

        assertThat(
                docsPage.isIntroTitleDisplayed())
                .as("Introduction page title is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin", "openDocsPage"})
    public void checkDocsFilesPage() {
        printTestHeader("Test Case: check Docs Files page");

        DocsPage docsPage = getDocsPage();

        assertThat(
                docsPage.isFilesLinkDisplayed())
                .as("Link to Docs Files page is displayed")
                .isTrue();

        docsPage.clickFilesLink();

        SoftAssert.assertThat(
                docsPage.isFilesTitleDisplayed())
                .as("Files page title is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isFilesListingLinkDisplayed())
                .as("Listing Files link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isFilesUploadingLinkDisplayed())
                .as("Uploading Files link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isFilesExaminingLinkDisplayed())
                .as("Examining File Origin link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isFilesDetailsLinkDisplayed())
                .as("File details link is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "openDocsPage"})
    public void checkDocsComparisonsPage() {
        printTestHeader("Test Case: check Docs Comparisons page");

        DocsPage docsPage = getDocsPage();

        assertThat(
                docsPage.isCompsLinkDisplayed())
                .as("Link to Docs Comparisons page is displayed")
                .isTrue();

        docsPage.clickCompsLink();

        SoftAssert.assertThat(
                docsPage.isDocsCompsTitleDisplayed())
                .as("Comparisons page title is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCompsNewLinkDisplayed())
                .as("Creating new comparisons link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCompsBEDLinkDisplayed())
                .as("BED files link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCompsUnderstandingLinkDisplayed())
                .as("Understanding comparisons link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCompsVisualizingLinkDisplayed())
                .as("Visualizing comparisons link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCompsIdeasLinkDisplayed())
                .as("Comparisons ideas link is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "openDocsPage"})
    public void checkDocsAppsPage() {
        printTestHeader("Test Case: check Docs Apps page");

        DocsPage docsPage = getDocsPage();

        assertThat(
                docsPage.isAppsLinkDisplayed())
                .as("Link to Docs Apps page is displayed")
                .isTrue();

        docsPage.clickAppsLink();

        SoftAssert.assertThat(
                docsPage.isDocsAppsTitleDisplayed())
                .as("Apps page title is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isAppsOverviewLinkDisplayed())
                .as("Overview & Terminology link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isAppsListingLinkDisplayed())
                .as("Listing apps link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isAppsRunningLinkDisplayed())
                .as("Running an app link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isAppsBatchLinkDisplayed())
                .as("Batch Running an app link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isAppsExportingLinkDisplayed())
                .as("Exporting an app link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isAppsCWLExportingLinkDisplayed())
                .as("CWL export link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isAppsWDLExportingLinkDisplayed())
                .as("WDL export link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isAppsJobDetailsLinkDisplayed())
                .as("Job details and logs link is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "openDocsPage"})
    public void checkDocsCreatingAppsPage() {
        printTestHeader("Test Case: check Docs Creating Apps page");

        DocsPage docsPage = getDocsPage();

        assertThat(
                docsPage.isCreatingAppsLinkDisplayed())
                .as("Link to Docs Creating Apps page is displayed")
                .isTrue();

        docsPage.clickCreatingAppsLink();

        SoftAssert.assertThat(
                docsPage.isDocsCreatingAppsTitleDisplayed())
                .as("Creating Apps page title is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCrAppsConventionLinkDisplayed())
                .as("App naming conventions link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCrAppsIOSpecLinkDisplayed())
                .as("Input and Output spec link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCrAppsVMEnvLinkDisplayed())
                .as("VM Environment link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCrAppsInstanceTypeLinkDisplayed())
                .as("Available instance types link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCrAppsAssetsLinkDisplayed())
                .as("App assets link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCrAppsOwnAssetsLinkDisplayed())
                .as("Your own assets link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCrAppsScriptLinkDisplayed())
                .as("App script link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCrAppsBashLinkDisplayed())
                .as("Bash tips link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isCrAppsForkingLinkDisplayed())
                .as("Forking an app link is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

}