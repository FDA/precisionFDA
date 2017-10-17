package staging.cases;

import org.apache.log4j.Logger;
import org.testng.annotations.Listeners;
import org.testng.annotations.Test;
import staging.data.PageTitles;
import staging.pages.guidelines.guidelinesPage;
import staging.pages.about.*;
import staging.pages.apps.*;
import staging.pages.*;
import staging.pages.challs.ChallsPage;
import staging.pages.comps.*;
import staging.pages.discs.DiscsNewDiscPage;
import staging.pages.discs.DiscsPage;
import staging.pages.experts.ExpertsPage;
import staging.pages.files.*;
import staging.pages.licenses.LicensesPage;
import staging.pages.notes.*;
import staging.pages.overview.OverviewPage;
import staging.pages.profile.ProfilePage;
import staging.pages.profile.PublicProfilePage;
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
        assertTrue(notesNewNotePage.isEditorDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_EDIT_NOTE));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesPageCanBeOpen() {
        logTestHeader("Test Case: check that Notes page can be open");

        CommonPage commonPage = openCommonPage();
        NotesPage notesPage = commonPage.openNotesPage();

        log.info("check My Notes link is displayed");
        assertTrue(notesPage.isMyNotesLinkDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_NOTES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesMyNotesPageCanBeOpen() {
        logTestHeader("Test Case: check that Notes.MyNotes page can be open");

        CommonPage commonPage = openCommonPage();
        NotesMyNotesPage notesMyNotesPage = commonPage.openNotesPage().openNotesMyNotesPage();

        log.info("check My Notes link is activated");
        assertTrue(notesMyNotesPage.isMyNotesLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_NOTES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Notes.Featured page can be open");

        CommonPage commonPage = openCommonPage();
        NotesFeaturedPage notesFeaturedPage = commonPage.openNotesPage().openNotesFeaturedPage();

        log.info("check Featured link is activated");
        assertTrue(notesFeaturedPage.isFeaturedLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_NOTES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Notes.Explore page can be open");

        CommonPage commonPage = openCommonPage();
        NotesExplorePage notesExplorePage = commonPage.openNotesPage().openNotesExplorePage();

        log.info("check Explore link is activated");
        assertTrue(notesExplorePage.isExploreLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_NOTES));
    }


    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps page can be open");

        CommonPage commonPage = openCommonPage();
        AppsPage appsPage = commonPage.openAppsPage();

        log.info("check Relevant apps link is displayed");
        assertTrue(appsPage.isRelevantAppsLinkDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_APPS));
    }

    //disabled. under testing in AppsManagementTest suite
    @Test(dependsOnMethods = { "successfulLogin" }, enabled = false)
    public void checkAppsCreateAppPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.CreateApp page can be open");

        CommonPage commonPage = openCommonPage();
        ApplCreateAppPage applCreateAppPage = commonPage.openAppsPage().openCreateAppPage();

        log.info("check New App Name Input is displayed");
        assertTrue(applCreateAppPage.isNewAppNameInputDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_APPS_CREATE_NEW));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsRelevantPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Relevant page can be open");

        CommonPage commonPage = openCommonPage();
        AppsRelevantPage appsRelevantPage = commonPage.openAppsPage().openAppsRelevantPage();

        log.info("check jobs list area is displayed");
        assertTrue(appsRelevantPage.isJobsListDisplayed());

        log.info("check the Relevant link is activated");
        assertTrue(appsRelevantPage.isRelevantLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_APPS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Featured page can be open");

        CommonPage commonPage = openCommonPage();
        AppsFeaturedPage appsFeaturedPage = commonPage.openAppsPage().openAppsFeaturedPage();

        log.info("check the Featured link is activated");
        assertTrue(appsFeaturedPage.isFeaturedLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_APPS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Explore page can be open");

        CommonPage commonPage = openCommonPage();
        AppsExplorePage appsExplorePage = commonPage.openAppsPage().openAppsExplorePage();

        log.info("check the Explore link is activated");
        assertTrue(appsExplorePage.isExploreLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_APPS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageAssetsPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.ManageAssets page can be open");

        CommonPage commonPage = openCommonPage();
        AppsManageAssetsPage appsManageAssetsPage = commonPage.openAppsPage().openAppsManageAssetsPage();

        log.info("check 'Create Assets' button is displayed");
        assertTrue(appsManageAssetsPage.isCreateAssetsDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_ASSETS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageMyAssetsPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Manage.MyAssets page can be open");

        CommonPage commonPage = openCommonPage();
        AppsManageAssetsPage appsManageAssetsPage = commonPage.openAppsPage().openAppsManageAssetsPage();
        AppsManageMyAssetsPage appsManageMyAssetsPage = appsManageAssetsPage.openMyAssetsPage();

        log.info("check the Manage My Assets link is activated");
        assertTrue(appsManageMyAssetsPage.isManageMyAssetsAcivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_ASSETS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Manage.Featured page can be open");

        CommonPage commonPage = openCommonPage();
        AppsManageAssetsPage appsManageAssetsPage = commonPage.openAppsPage().openAppsManageAssetsPage();
        AppsManageFeaturedPage appsManageFeaturedPage = appsManageAssetsPage.openFeaturedPage();

        log.info("check the Manage Featured link is activated");
        assertTrue(appsManageFeaturedPage.isFeaturedManageLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_ASSETS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Manage.Explore page can be open");

        CommonPage commonPage = openCommonPage();
        AppsManageAssetsPage appsManageAssetsPage = commonPage.openAppsPage().openAppsManageAssetsPage();
        AppsManageExplorePage appsManageExplorePage = appsManageAssetsPage.openExplorePage();

        log.info("check the Manage Explore link is activated");
        assertTrue(appsManageExplorePage.isManageExploreLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_ASSETS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageCreateAssetsPageCanBeOpen() {
        logTestHeader("Test Case: check that Apps.Manage.CreateAssets page can be open");

        CommonPage commonPage = openCommonPage();
        AppsManageAssetsPage appsManageAssetsPage = commonPage.openAppsPage().openAppsManageAssetsPage();
        AppsManageCreateAssetsPage appsManageCreateAssetsPage = appsManageAssetsPage.openCreateAssetsPage();

        log.info("check the Step 4 is displayed");
        assertTrue(appsManageCreateAssetsPage.isGenerateKeyLinkDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_ADD_ASSETS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkComparisonsPageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons page can be open");
        
        CommonPage commonPage = openCommonPage();
        CompsPage compsPage = commonPage.openCompsPage();

        log.info("check My Comparisons link is displayed");
        assertTrue(compsPage.isMyCompsLinkDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_COMPARISONS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsMyCompsPageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons.MyComparisons page can be open");

        CommonPage commonPage = openCommonPage();
        CompsMyCompsPage compsMyCompsPage = commonPage.openCompsPage().openCompsMyCompsPage();

        log.info("check My Comparisons link is activated");
        assertTrue(compsMyCompsPage.isMyCompsLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_COMPARISONS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons.Featured page can be open");

        CommonPage commonPage = openCommonPage();
        CompsFeaturedPage compsFeaturedPage = commonPage.openCompsPage().openCompsFeaturedPage();

        log.info("check Featured link is activated");
        assertTrue(compsFeaturedPage.isFeaturedLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_COMPARISONS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons.Explore page can be open");

        CommonPage commonPage = openCommonPage();
        CompsExplorePage compsExplorePage = commonPage.openCompsPage().openCompsExplorePage();

        log.info("check Explore link is activated");
        assertTrue(compsExplorePage.isExploreLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_COMPARISONS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsRunComparisonPageCanBeOpen() {
        logTestHeader("Test Case: check that Comparisons.RunComparison page can be open");

        CommonPage commonPage = openCommonPage();
        CompsRunComparisonPage compsRunComparisonPage = commonPage.openCompsPage().openCompsRunComparisonPage();

        log.info("check the circle 'with' is displayed");
        assertTrue(compsRunComparisonPage.isCircleWithDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_COMPARATOR));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesPageCanBeOpen() {
        logTestHeader("Test Case: check that Files page can be open");

        CommonPage commonPage = openCommonPage();
        FilesPage filesPage = commonPage.openFilesPage();

        log.info("check My Files link is displayed");
        assertTrue(filesPage.isMyFilesLinkDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_FILES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesMyFilesPageCanBeOpen() {
        logTestHeader("Test Case: check that Files.MyFiles page can be open");

        CommonPage commonPage = openCommonPage();
        FilesMyFilesPage filesMyFilesPage = commonPage.openFilesPage().openFilesMyFilesPage();

        log.info("check My Files link is activated");
        assertTrue(filesMyFilesPage.isMyFilesLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_FILES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesFeaturedPageCanBeOpen() {
        logTestHeader("Test Case: check that Files.Featured page can be open");

        CommonPage commonPage = openCommonPage();
        FilesFeaturedPage filesFeaturedPage = commonPage.openFilesPage().openFilesFeaturedPage();

        log.info("check Featured link is activated");
        assertTrue(filesFeaturedPage.isFeaturedLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_FILES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesExplorePageCanBeOpen() {
        logTestHeader("Test Case: check that Files.Explore page can be open");

        CommonPage commonPage = openCommonPage();
        FilesExplorePage filesExplorePage = commonPage.openFilesPage().openFilesExplorePage();

        log.info("check Explore link is activated");
        assertTrue(filesExplorePage.isExploreLinkActivated());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_FILES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesAddFilesPageCanBeOpen() {
        logTestHeader("Test Case: check that Files.AddFiles page can be open");

        CommonPage commonPage = openCommonPage();
        FilesAddFilesPage filesAddFilesPage = commonPage.openFilesPage().openFilesAddFilesPage();

        log.info("check Browse Files button is displayed");
        assertTrue(filesAddFilesPage.isBrowseFilesButtonDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_UPLOAD_FILES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkExpertsPageCanBeOpen() {
        logTestHeader("Test Case: check that Experts page can be open");

        CommonPage commonPage = openCommonPage();
        ExpertsPage expertsPage = commonPage.openExpertsPage();

        log.info("check Experts icon is activated");
        assertTrue(expertsPage.isExpertsIconDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_EXPERTS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkChallengesPageCanBeOpen() {
        logTestHeader("Test Case: check that Challenges page can be open");

        CommonPage commonPage = openCommonPage();
        ChallsPage challsPage = commonPage.openChallsPage();

        log.info("check Challenges icon is activated");
        assertTrue(challsPage.isChallengesIconDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_CHALLS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkDiscussionsPageCanBeOpen() {
        logTestHeader("Test Case: check that Discussions page can be open");

        CommonPage commonPage = openCommonPage();
        DiscsPage discsPage = commonPage.openDiscsPage();

        log.info("check Start Discussion button is displayed");
        assertTrue(discsPage.isStartDiscsButtonDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_DISCS));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkDiscussionsNewDiscPageCanBeOpen() {
        logTestHeader("Test Case: check that Discussions.NewDiscussion page can be open");

        CommonPage commonPage = openCommonPage();
        DiscsNewDiscPage discsNewDiscPage = commonPage.openDiscsPage().openNewDiscPage();

        log.info("check New Discussion Editor is displayed");
        assertTrue(discsNewDiscPage.isEditorDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_EDIT_DISC));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkOverviewPageCanBeOpen() {
        logTestHeader("Test Case: check that Overview page can be open");

        CommonPage commonPage = openCommonPage();
        OverviewPage overviewPage = commonPage.openOverviewPage();

        log.info("check Welcome Text is displayed");
        assertTrue(overviewPage.isWelcomeTextDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_OVERVIEW));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkProfilePageCanBeOpen() {
        logTestHeader("Test Case: check that Profile page can be open");

        CommonPage commonPage = openCommonPage();
        ProfilePage profilePage = commonPage.openProfilePage();

        log.info("check About your organization Text is displayed");
        assertTrue(profilePage.isAboutOrgTextDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_PROFILE));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkPublicProfilePageCanBeOpen() {
        logTestHeader("Test Case: check that Public Profile page can be open");

        CommonPage commonPage = openCommonPage();
        PublicProfilePage publicProfilePage = commonPage.openPublicProfilePage();

        log.info("check 'Joined' tag is displayed");
        assertTrue(publicProfilePage.isJoinedTagDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_PUBLIC_PROFILE));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkLicensePageCanBeOpen() {
        logTestHeader("Test Case: check that License page can be open");

        CommonPage commonPage = openCommonPage();
        LicensesPage licensesPage = commonPage.openLicensePage();

        log.info("check Create New License button is displayed");
        assertTrue(licensesPage.isCreateNewLicenseDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_LICENSES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAboutPageCanBeOpen() {
        logTestHeader("Test Case: check that About page can be open");

        CommonPage commonPage = openCommonPage();
        AboutPage aboutPage = commonPage.openAboutPage();

        log.info("check Why? tab is displayed");
        assertTrue(aboutPage.isAboutWhyLinkDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_ABOUT));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAboutWhyPageCanBeOpen() {
        logTestHeader("Test Case: check that About.Why page can be open");

        CommonPage commonPage = openCommonPage();
        AboutWhyPage aboutWhyPage = commonPage.openAboutPage().openAboutWhyPage();

        log.info("check Why? tab is activated");
        assertTrue(aboutWhyPage.isAboutWhyActivatedLinkDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_ABOUT));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAboutWhatPageCanBeOpen() {
        logTestHeader("Test Case: check that About.What page can be open");

        CommonPage commonPage = openCommonPage();
        AboutWhatPage aboutWhatPage = commonPage.openAboutPage().openAboutWhatPage();

        log.info("check What? tab is activated");
        assertTrue(aboutWhatPage.isAboutWhatActivatedLinkDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_ABOUT));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAboutWhoPageCanBeOpen() {
        logTestHeader("Test Case: check that About.Who page can be open");

        CommonPage commonPage = openCommonPage();
        AboutWhoPage aboutWhoPage = commonPage.openAboutPage().openAboutWhoPage();

        log.info("check Who? tab is activated");
        assertTrue(aboutWhoPage.isAboutWhoActivatedLinkDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_ABOUT));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAboutHowPageCanBeOpen() {
        logTestHeader("Test Case: check that About.How page can be open");

        CommonPage commonPage = openCommonPage();
        AboutHowPage aboutHowPage = commonPage.openAboutPage().openAboutHowPage();

        log.info("check 'Introduction' title is displayed");
        assertTrue(aboutHowPage.isAboutIntroTitleDisplayed());
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkGuidelinesPageCanBeOpen() {
        logTestHeader("Test Case: check that guidelines page can be open");

        CommonPage commonPage = openCommonPage();
        guidelinesPage guidelinesPage = commonPage.openGuidelinesPage();

        log.info("check guidelines Carousel is displayed");
        assertTrue(guidelinesPage.isGuidelinesCarouselDisplayed());

        log.info("check page title");
        assertTrue(isPageTitleCorrect(PageTitles.PAGE_TITLE_GUIDELINES));
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkDocsPageCanBeOpen() {
        logTestHeader("Test Case: check that Docs page can be open");

        CommonPage commonPage = openCommonPage();
        AboutHowPage docsPage = commonPage.openDocsPage();

        log.info("check 'Introduction' title is displayed");
        assertTrue(docsPage.isAboutIntroTitleDisplayed());
    }

}
