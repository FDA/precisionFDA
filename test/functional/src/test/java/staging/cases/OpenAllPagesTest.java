package staging.cases;

import org.apache.log4j.Logger;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;
import staging.data.PageTitles;
import staging.pages.apps.*;
import staging.pages.*;
import staging.pages.challs.ChallsPage;
import staging.pages.comps.*;
import staging.pages.discs.DiscsNewDiscPage;
import staging.pages.discs.DiscsPage;
import staging.pages.experts.ExpertsPage;
import staging.pages.files.*;
import staging.pages.notes.*;
import staging.pages.overview.OverviewPage;
import tools.TestResultListener;

import static org.testng.Assert.assertTrue;

@Listeners(TestResultListener.class)
public class OpenAllPagesTest extends AbstractTest {

    private final Logger log = Logger.getLogger("TEST");

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesNewNotePageCanBeOpen() {
        logTestHeader("Test Case: check that Notes.NewNote page can be open");

        CommonPage commonPage = openCommonPage();
        NotesNewNotePage notesNewNotePage = commonPage.openNotesPage().openNotesNewNotePage();

        log.info("check Edit Area is displayed");
        assertTrue(notesNewNotePage.getNotesNewNoteEditorWE().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_EDIT_NOTE));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesPageCanBeOpen() {
        logTestHeader("Test Case: check that Notes page can be open");

        CommonPage commonPage = openCommonPage();
        NotesPage notesPage = commonPage.openNotesPage();

        log.info("check My Notes link is displayed");
        assertTrue(notesPage.getNotesMyNotesLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_NOTES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesMyNotesPageCanBeOpen() {
        logTestHeader("Test Case: check that Notes.MyNotes page can be open");

        CommonPage commonPage = openCommonPage();
        NotesMyNotesPage notesMyNotesPage = commonPage.openNotesPage().openNotesMyNotesPage();

        log.info("check My Notes link is activated");
        assertTrue(notesMyNotesPage.getNotesMyNotesActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_NOTES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Notes.Featured page can be open");

        CommonPage commonPage = openCommonPage();
        NotesFeaturedPage notesFeaturedPage = commonPage.openNotesPage().openNotesFeaturedPage();

        log.info("check Featured link is activated");
        assertTrue(notesFeaturedPage.getNotesFeaturedActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_NOTES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Notes.Explore page can be open");

        CommonPage commonPage = openCommonPage();
        NotesExplorePage notesExplorePage = commonPage.openNotesPage().openNotesExplorePage();

        log.info("check Explore link is activated");
        assertTrue(notesExplorePage.getNotesExploreActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_NOTES));
    }


    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps page can be open");

        CommonPage commonPage = openCommonPage();
        AppsPage appsPage = commonPage.openAppsPage();

        log.info("check Relevant apps link is displayed");
        assertTrue(appsPage.getAppsRelevantLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_APPS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsRelevantPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Relevant page can be open");

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();

        log.info("check jobs list area is displayed");
        assertTrue(appsRelevantPage.getAppsJobsListWE().isDisplayed());

        log.info("check the clicked link is activated");
        assertTrue(appsRelevantPage.getAppsRelevantActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_APPS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Featured page can be open");

        CommonPage commonPage = openCommonPage();
        AppsFeaturedPage appsFeaturedPage = commonPage.openAppsPage().openAppsFeaturedPage();

        log.info("check the clicked link is activated");
        assertTrue(appsFeaturedPage.getAppsFeaturedActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_APPS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Explore page can be open");

        CommonPage commonPage = openCommonPage();
        AppsExplorePage appsExplorePage = commonPage.openAppsPage().openAppsExplorePage();

        log.info("check the clicked link is activated");
        assertTrue(appsExplorePage.getAppsExploreActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_APPS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageAssetsPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.ManageAssets page can be open");

        CommonPage commonPage = openCommonPage();
        AppsManageAssetsPage appsManageAssetsPage = commonPage.openAppsPage().openAppsManageAssetsPage();

        log.info("check 'Create Assets' button is displayed");
        assertTrue(appsManageAssetsPage.getAppsManageCreateAssetsLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_ASSETS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageMyAssetsPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Manage.MyAssets page can be open");

        CommonPage commonPage = openCommonPage();
        AppsManageAssetsPage appsManageAssetsPage = commonPage.openAppsPage().openAppsManageAssetsPage();
        AppsManageMyAssetsPage appsManageMyAssetsPage = appsManageAssetsPage.openMyAssetsPage();

        log.info("check the clicked link is activated");
        assertTrue(appsManageMyAssetsPage.getAppsManageMyAssetsActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_ASSETS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Manage.Featured page can be open");

        CommonPage commonPage = openCommonPage();
        AppsManageAssetsPage appsManageAssetsPage = commonPage.openAppsPage().openAppsManageAssetsPage();
        AppsManageFeaturedPage appsManageFeaturedPage = appsManageAssetsPage.openFeaturedPage();

        log.info("check the clicked link is activated");
        assertTrue(appsManageFeaturedPage.getAppsManageFeaturedActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_ASSETS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Manage.Explore page can be open");

        CommonPage commonPage = openCommonPage();
        AppsManageAssetsPage appsManageAssetsPage = commonPage.openAppsPage().openAppsManageAssetsPage();
        AppsManageExplorePage appsManageExplorePage = appsManageAssetsPage.openExplorePage();

        log.info("check the clicked link is activated");
        assertTrue(appsManageExplorePage.getAppsManageExploreActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_ASSETS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageCreateAssetsPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Manage.CreateAssets page can be open");

        CommonPage commonPage = openCommonPage();
        AppsManageAssetsPage appsManageAssetsPage = commonPage.openAppsPage().openAppsManageAssetsPage();
        AppsManageCreateAssetsPage appsManageCreateAssetsPage = appsManageAssetsPage.openCreateAssetsPage();

        log.info("check the Step 4 is displayed");
        assertTrue(appsManageCreateAssetsPage.getAppsManageCreateAssetsGenerateKeyLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_ADD_ASSETS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkComparisonsPageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons page can be open");
        
        CommonPage commonPage = openCommonPage();
        CompsPage compsPage = commonPage.openCompsPage();

        log.info("check My Comparisons link is displayed");
        assertTrue(compsPage.getCompsMyCompsLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_COMPARISONS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsMyCompsPageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons.MyComparisons page can be open");

        CommonPage commonPage = openCommonPage();
        CompsMyCompsPage compsMyCompsPage = commonPage.openCompsPage().openCompsMyCompsPage();

        log.info("check My Comparisons link is activated");
        assertTrue(compsMyCompsPage.getCompsMyCompsActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_COMPARISONS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons.Featured page can be open");

        CommonPage commonPage = openCommonPage();
        CompsFeaturedPage compsFeaturedPage = commonPage.openCompsPage().openCompsFeaturedPage();

        log.info("check Featured link is activated");
        assertTrue(compsFeaturedPage.getCompsFeaturedActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_COMPARISONS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons.Explore page can be open");

        CommonPage commonPage = openCommonPage();
        CompsExplorePage compsExplorePage = commonPage.openCompsPage().openCompsExplorePage();

        log.info("check Explore link is activated");
        assertTrue(compsExplorePage.getCompsExploreActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_COMPARISONS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsRunComparisonPageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons.RunComparison page can be open");

        CommonPage commonPage = openCommonPage();
        CompsRunComparisonPage compsRunComparisonPage = commonPage.openCompsPage().openCompsRunComparisonPage();

        log.info("check the circle 'with' is displayed");
        assertTrue(compsRunComparisonPage.getCompsRunCompCircleWithWE().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_COMPARATOR));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesPageCanBeOpen() {
        logTestHeader("Test Case: check that Files page can be open");

        CommonPage commonPage = openCommonPage();
        FilesPage filesPage = commonPage.openFilesPage();

        log.info("check My Files link is displayed");
        assertTrue(filesPage.getFilesMyFilesLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_FILES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesMyFilesPageCanBeOpen() {
        logTestHeader("Test Case: check that Files.MyFiles page can be open");

        CommonPage commonPage = openCommonPage();
        FilesMyFilesPage filesMyFilesPage = commonPage.openFilesPage().openFilesMyFilesPage();

        log.info("check My Files link is activated");
        assertTrue(filesMyFilesPage.getFilesMyFilesActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_FILES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Files.Featured page can be open");

        CommonPage commonPage = openCommonPage();
        FilesFeaturedPage filesFeaturedPage = commonPage.openFilesPage().openFilesFeaturedPage();

        log.info("check Featured link is activated");
        assertTrue(filesFeaturedPage.getFilesFeaturedActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_FILES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Files.Explore page can be open");

        CommonPage commonPage = openCommonPage();
        FilesExplorePage filesExplorePage = commonPage.openFilesPage().openFilesExplorePage();

        log.info("check Explore link is activated");
        assertTrue(filesExplorePage.getFilesExploreActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_FILES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesAddFilesPageCanBeOpen() {
        logTestHeader("Test Case: check that Files.AddFiles page can be open");

        CommonPage commonPage = openCommonPage();
        FilesAddFilesPage filesAddFilesPage = commonPage.openFilesPage().openFilesAddFilesPage();

        log.info("check Browse Files button is displayed");
        assertTrue(filesAddFilesPage.getFilesBrowseFilesInput().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_UPLOAD_FILES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkExpertsPageCanBeOpen() {
        logTestHeader("Test Case: check that Experts page can be open");

        CommonPage commonPage = openCommonPage();
        ExpertsPage expertsPage = commonPage.openExpertsPage();

        log.info("check Experts icon is activated");
        assertTrue(expertsPage.getExpertsActivatedLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_EXPERTS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkChallengesPageCanBeOpen() {
        logTestHeader("Test Case: check that Challenges page can be open");

        CommonPage commonPage = openCommonPage();
        ChallsPage challsPage = commonPage.openChallsPage();

        log.info("check Challenges icon is activated");
        assertTrue(challsPage.getChallsActivatedIconLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_CHALLS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkDiscussionsPageCanBeOpen() {
        logTestHeader("Test Case: check that Discussions page can be open");

        CommonPage commonPage = openCommonPage();
        DiscsPage discsPage = commonPage.openDiscsPage();

        log.info("check Start Discussion button is displayed");
        assertTrue(discsPage.getDiscsStartDiscLink().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_DISCS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkDiscussionsNewDiscPageCanBeOpen() {
        logTestHeader("Test Case: check that Discussions.NewDiscussion page can be open");

        CommonPage commonPage = openCommonPage();
        DiscsNewDiscPage discsNewDiscPage = commonPage.openDiscsPage().openNewDiscPage();

        log.info("check New Discussion Editor is displayed");
        assertTrue(discsNewDiscPage.getDiscsNewDiscEditorWE().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_EDIT_DISC));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkOverviewPageCanBeOpen() {
        logTestHeader("Test Case: check that Overview page can be open");

        CommonPage commonPage = openCommonPage();
        OverviewPage overviewPage = commonPage.openOverviewPage();

        log.info("check Welcome Text is displayed");
        assertTrue(overviewPage.getOverviewWelcomeText().isDisplayed());

        log.info("check page title");
        assertTrue(getPageTitle().contains(PageTitles.PAGE_TITLE_OVERVIEW));
    }



}
