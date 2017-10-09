package staging.cases;

import org.apache.log4j.Logger;
import org.testng.annotations.Test;
import staging.pages.*;

import static org.testng.Assert.assertTrue;

public class OpenAllPagesTest extends AbstractTest {

    private final Logger log = Logger.getLogger(this.getClass());

    @Test
    public void successfulLogin() {
        logTestHeader("Test Case: Successful Login");

        MainPage mainPage = openMainPage();
        PrecisionFDAPage precisionFDAPage = CommonActions.loginToFDA(mainPage);

        log.info("check navigation panel is displayed");
        assertTrue(precisionFDAPage.getNavigationPanelWE().isDisplayed());

        log.info("check correct username is displayed");
        assertTrue(precisionFDAPage.getUsernameLink().getText().equals("Automation Test"));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        AppsPage appsPage = precisionFDAPage.openAppsPage();

        log.info("check Relevant apps link is displayed");
        assertTrue(appsPage.getAppsRelevantLink().isDisplayed());

        log.info("check title contains 'Apps'");
        assertTrue(getPageTitle().contains("Apps"));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsRelevantPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps Relevant page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        AppsRelevantPage appsRelevantPage = precisionFDAPage.openAppsPage().openAppsRelevantPage();

        log.info("check jobs list area is displayed");
        assertTrue(appsRelevantPage.getAppsJobsListWE().isDisplayed());

        log.info("check the clicked link is activated");
        assertTrue(appsRelevantPage.getAppsRelevantActivatedLink().isDisplayed());

        log.info("check title contains 'Apps'");
        assertTrue(getPageTitle().contains("Apps"));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps Featured page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        AppsFeaturedPage appsFeaturedPage = precisionFDAPage.openAppsPage().openAppsFeaturedPage();

        log.info("check the clicked link is activated");
        assertTrue(appsFeaturedPage.getAppsFeaturedActivatedLink().isDisplayed());

        log.info("check title contains 'Apps'");
        assertTrue(getPageTitle().contains("Apps"));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Apps Explore page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        AppsExplorePage appsExplorePage = precisionFDAPage.openAppsPage().openAppsExplorePage();

        log.info("check the clicked link is activated");
        assertTrue(appsExplorePage.getAppsExploreActivatedLink().isDisplayed());

        log.info("check title contains 'Apps'");
        assertTrue(getPageTitle().contains("Apps"));

        log.info("--PASSED--");
    }





}
