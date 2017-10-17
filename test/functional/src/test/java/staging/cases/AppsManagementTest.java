package staging.cases;

import org.apache.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.Test;
import staging.pages.CommonPage;
import staging.pages.apps.ApplCreateAppPage;
import staging.pages.apps.AppsEditAppPage;
import staging.pages.apps.AppsRelevantPage;
import staging.pages.apps.AppsSavedAppPage;

public class AppsManagementTest extends AbstractTest {

    private final Logger log = Logger.getLogger(this.getClass());

    @Test(dependsOnMethods = {"successfulLogin"}, priority = 0)
    public void createAndSaveSimpleApp() {
        logTestHeader("Test Case: create and save simple app with custom name, title and script text");

        CommonPage commonPage = openCommonPage();
        ApplCreateAppPage applCreateAppPage = commonPage.openAppsPage().openCreateAppPage();
        AppsSavedAppPage appsSavedAppPage = applCreateAppPage.fillCreateAppForm().clickCreate();

        log.info("verify if Name of created app is correct");
        Assert.assertTrue(appsSavedAppPage.isSelectedAppNameCorrect());

        log.info("verify if Title of created app is correct");
        Assert.assertTrue(appsSavedAppPage.isSelectedAppTitleCorrect());

        log.info("verify if Org of created app is correct");
        Assert.assertTrue(appsSavedAppPage.isSelectedAppOrgCorrect());

        log.info("verify if Added By of created app is correct");
        Assert.assertTrue(appsSavedAppPage.isSelectedAppAddedByCorrect());

        log.info("verify Created value has correct date, hours and minutes");
        Assert.assertTrue(appsSavedAppPage.isCreatedDateCorrect());
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveSimpleApp"})
    public void checkSavedAppCanBeOpen() {
        logTestHeader("Test Case: check Saved App can be open from My App list");

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl();

        log.info("verify if Name of created app is correct");
        Assert.assertTrue(appsSavedAppPage.isSelectedAppNameCorrect());

        log.info("verify if Org of created app is correct");
        Assert.assertTrue(appsSavedAppPage.isSelectedAppOrgCorrect());

        log.info("verify if Added By of created app is correct");
        Assert.assertTrue(appsSavedAppPage.isSelectedAppAddedByCorrect());

        log.info("verify Created value has correct date, hours and minutes");
        Assert.assertTrue(appsSavedAppPage.isCreatedDateCorrect());
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveSimpleApp"})
    public void checkRevisionIncremented() {
        logTestHeader("Test Case: check that revision version is incremented by 1");

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl();

        int revisionBefore = appsSavedAppPage.getAppRevision();

        AppsEditAppPage appsEditAppPage = appsSavedAppPage.editSavedApp();
        appsSavedAppPage = appsEditAppPage.saveRevision();

        int revisionAfter = appsSavedAppPage.getAppRevision();

        log.info("verify if Revision version is incremented");
        Assert.assertTrue(revisionBefore + 1 == revisionAfter,
                "[revision before = " + revisionBefore + " + 1] == [revision after = " + revisionAfter + "]");
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveSimpleApp"})
    public void checkValuesNotChangedAfterIdleEdit() {
        logTestHeader("Test Case: check App values are not changed if click Edit then Save without any changes");

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();
        AppsSavedAppPage appsSavedAppPage = appsRelevantPage.openSavedAppl();
        AppsEditAppPage appsEditAppPage = appsSavedAppPage.editSavedApp();
        appsSavedAppPage = appsEditAppPage.saveRevision();

        log.info("verify if Name of created app is correct");
        Assert.assertTrue(appsSavedAppPage.isSelectedAppNameCorrect());

        log.info("verify if Title of created app is correct");
        Assert.assertTrue(appsSavedAppPage.isSelectedAppTitleCorrect());

        log.info("verify if Org of created app is correct");
        Assert.assertTrue(appsSavedAppPage.isSelectedAppOrgCorrect());

        log.info("verify if Added By of created app is correct");
        Assert.assertTrue(appsSavedAppPage.isSelectedAppAddedByCorrect());

        log.info("verify Created value has correct date, hours and minutes");
        Assert.assertTrue(appsSavedAppPage.isCreatedDateCorrect());
    }

}