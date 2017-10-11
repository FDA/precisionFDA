package staging.cases;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.annotations.Test;
import staging.data.PageTitles;
import staging.pages.apps.*;
import staging.pages.*;
import staging.pages.comps.*;
import staging.pages.files.*;

import static org.junit.Assert.fail;
import static org.testng.Assert.assertTrue;

public class OpenAllPagesTest extends AbstractTest {

    private final Logger log = Logger.getLogger(this.getClass());

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        AppsPage appsPage = precisionFDAPage.openAppsPage();

        log.info("check Relevant apps link is displayed");
        assertTrue(appsPage.getAppsRelevantLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_APPS));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsRelevantPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Relevant page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        AppsRelevantPage appsRelevantPage = precisionFDAPage.openAppsPage().openAppsRelevantPage();

        log.info("check jobs list area is displayed");
        assertTrue(appsRelevantPage.getAppsJobsListWE().isDisplayed());

        log.info("check the clicked link is activated");
        assertTrue(appsRelevantPage.getAppsRelevantActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_APPS));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Featured page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        AppsFeaturedPage appsFeaturedPage = precisionFDAPage.openAppsPage().openAppsFeaturedPage();

        log.info("check the clicked link is activated");
        assertTrue(appsFeaturedPage.getAppsFeaturedActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_APPS));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Explore page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        AppsExplorePage appsExplorePage = precisionFDAPage.openAppsPage().openAppsExplorePage();

        log.info("check the clicked link is activated");
        assertTrue(appsExplorePage.getAppsExploreActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_APPS));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageAssetsPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.ManageAssets page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        AppsManageAssetsPage appsManageAssetsPage = precisionFDAPage.openAppsPage().openAppsManageAssetsPage();

        log.info("check 'Create Assets' button is displayed");
        assertTrue(appsManageAssetsPage.getAppsManageCreateAssetsLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_ASSETS));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageMyAssetsPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Manage.MyAssets page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        AppsManageAssetsPage appsManageAssetsPage = precisionFDAPage.openAppsPage().openAppsManageAssetsPage();
        AppsManageMyAssetsPage appsManageMyAssetsPage = appsManageAssetsPage.openMyAssetsPage();

        log.info("check the clicked link is activated");
        assertTrue(appsManageMyAssetsPage.getAppsManageMyAssetsActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_ASSETS));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Manage.Featured page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        AppsManageAssetsPage appsManageAssetsPage = precisionFDAPage.openAppsPage().openAppsManageAssetsPage();
        AppsManageFeaturedPage appsManageFeaturedPage = appsManageAssetsPage.openFeaturedPage();

        log.info("check the clicked link is activated");
        assertTrue(appsManageFeaturedPage.getAppsManageFeaturedActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_ASSETS));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Manage.Explore page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        AppsManageAssetsPage appsManageAssetsPage = precisionFDAPage.openAppsPage().openAppsManageAssetsPage();
        AppsManageExplorePage appsManageExplorePage = appsManageAssetsPage.openExplorePage();

        log.info("check the clicked link is activated");
        assertTrue(appsManageExplorePage.getAppsManageExploreActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_ASSETS));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageCreateAssetsPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Manage.CreateAssets page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        AppsManageAssetsPage appsManageAssetsPage = precisionFDAPage.openAppsPage().openAppsManageAssetsPage();
        AppsManageCreateAssetsPage appsManageCreateAssetsPage = appsManageAssetsPage.openCreateAssetsPage();

        log.info("check the Step 4 is displayed");
        assertTrue(appsManageCreateAssetsPage.getAppsManageCreateAssetsGenerateKeyLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_ADD_ASSETS));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkComparisonsPageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        CompsPage compsPage = precisionFDAPage.openCompsPage();

        log.info("check My Comparisons link is displayed");
        assertTrue(compsPage.getCompsMyCompsLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_COMPARISONS));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsMyCompsPageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons.MyComparisons page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        CompsMyCompsPage compsMyCompsPage = precisionFDAPage.openCompsPage().openCompsMyCompsPage();

        log.info("check My Comparisons link is activated");
        assertTrue(compsMyCompsPage.getCompsMyCompsActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_COMPARISONS));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons.Featured page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        CompsFeaturedPage compsFeaturedPage = precisionFDAPage.openCompsPage().openCompsFeaturedPage();

        log.info("check Featured link is activated");
        assertTrue(compsFeaturedPage.getCompsFeaturedActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_COMPARISONS));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons.Explore page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        CompsExplorePage compsExplorePage = precisionFDAPage.openCompsPage().openCompsExplorePage();

        log.info("check Explore link is activated");
        assertTrue(compsExplorePage.getCompsExploreActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_COMPARISONS));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsRunComparisonPageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons.RunComparison page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        CompsRunComparisonPage compsRunComparisonPage = precisionFDAPage.openCompsPage().openCompsRunComparisonPage();

        log.info("check the circle 'with' is displayed");
        assertTrue(compsRunComparisonPage.getCompsRunCompCircleWithWE().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_COMPARATOR));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesPageCanBeOpen() {
        logTestHeader("Test Case: check that Files page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        FilesPage filesPage = precisionFDAPage.openFilesPage();

        log.info("check My Files link is displayed");
        assertTrue(filesPage.getFilesMyFilesLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_FILES));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesMyFilesPageCanBeOpen() {
        logTestHeader("Test Case: check that Files.MyFiles page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        FilesMyFilesPage filesMyFilesPage = precisionFDAPage.openFilesPage().openFilesMyFilesPage();

        log.info("check My Files link is activated");
        assertTrue(filesMyFilesPage.getFilesMyFilesActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_FILES));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Files.Featured page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        FilesFeaturedPage filesFeaturedPage = precisionFDAPage.openFilesPage().openFilesFeaturedPage();

        log.info("check Featured link is activated");
        assertTrue(filesFeaturedPage.getFilesFeaturedActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_FILES));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Files.Explore page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        FilesExplorePage filesExplorePage = precisionFDAPage.openFilesPage().openFilesExplorePage();

        log.info("check Explore link is activated");
        assertTrue(filesExplorePage.getFilesExploreActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_FILES));

        log.info("--PASSED--");
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesAddFilesPageCanBeOpen() {
        logTestHeader("Test Case: check that Files.AddFiles page can be open");

        PrecisionFDAPage precisionFDAPage = new PrecisionFDAPage(getDriver());
        FilesAddFilesPage filesAddFilesPage = precisionFDAPage.openFilesPage().openFilesAddFilesPage();

        log.info("check Browse Files button is displayed");
        assertTrue(filesAddFilesPage.getFilesBrowseFilesInput().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_UPLOAD_FILES));

        log.info("--PASSED--");
    }



}
