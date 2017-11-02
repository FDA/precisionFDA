package staging.cases;

import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import staging.data.PageTitles;
import staging.model.User;
import staging.pages.guidelines.GuidelinesPage;
import staging.pages.about.*;
import staging.pages.apps.*;
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

@Name("Open all pages test suite")
public class OpenAllPagesTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader("Test Case: Successful Login");

        User user = User.getTestUser();
        OverviewPage overviewPage = openLoginPage(user).correctLogin(user).grantAccess();

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

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesPageCanBeOpen() {
        printTestHeader("Test Case: check that Notes page can be open");

        NotesPage notesPage = getCommonPage().openNotesPage();

        SoftAssert.assertThat(
                notesPage.isMyNotesLinkDisplayed())
                .as("My Notes link")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_NOTES);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesMyNotesPageCanBeOpen() {
        printTestHeader("Test Case: check that Notes.MyNotes page can be open");

        NotesPage notesPage = getCommonPage().openNotesPage();
        NotesMyNotesPage notesMyNotesPage = notesPage.openNotesMyNotesPage();

        SoftAssert.assertThat(
                notesMyNotesPage.isMyNotesLinkActivated())
                .as("My Notes link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_NOTES);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesFeaturedPageCanBeOpen() {
        printTestHeader("Test Case: check that Notes.Featured page can be open");

        NotesPage notesPage = getCommonPage().openNotesPage();
        NotesFeaturedPage notesFeaturedPage = notesPage.openNotesFeaturedPage();

        SoftAssert.assertThat(
                notesFeaturedPage.isFeaturedLinkActivated())
                .as("Featured link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_NOTES);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesExplorePageCanBeOpen() {
        printTestHeader("Test Case: check that Notes.Explore page can be open");

        NotesPage notesPage = getCommonPage().openNotesPage();
        NotesExplorePage notesExplorePage = notesPage.openNotesExplorePage();

        SoftAssert.assertThat(
                notesExplorePage.isExploreLinkActivated())
                .as("Explore link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_NOTES);

        SoftAssert.assertAll();
    }


    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsPageCanBeOpen() {
        printTestHeader("Test Case: check that Apps page can be open");

        AppsPage appsPage = getCommonPage().openAppsPage();

        SoftAssert.assertThat(
                appsPage.isRelevantAppsLinkDisplayed())
                .as("Relevant apps link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_APPS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsRelevantPageCanBeOpen() {
        printTestHeader("Test Case: check that Apps.Relevant page can be open");

        AppsPage appsPage = getCommonPage().openAppsPage();
        AppsRelevantPage appsRelevantPage = appsPage.openAppsRelevantPage();

        SoftAssert.assertThat(
                appsRelevantPage.isJobsListDisplayed())
                        .as("jobs list area is displayed")
                .isTrue();

        SoftAssert.assertThat(
                appsRelevantPage.isRelevantLinkActivated())
                .as("Relevant link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_APPS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsFeaturedPageCanBeOpen() {
        printTestHeader("Test Case: check that Apps.Featured page can be open");

        AppsPage appsPage = getCommonPage().openAppsPage();
        AppsFeaturedPage appsFeaturedPage = appsPage.openAppsFeaturedPage();

        SoftAssert.assertThat(
                appsFeaturedPage.isFeaturedLinkActivated())
                .as("Featured link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_APPS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsExplorePageCanBeOpen() {
        printTestHeader("Test Case: check that Apps.Explore page can be open");

        AppsPage appsPage = getCommonPage().openAppsPage();
        AppsExplorePage appsExplorePage = appsPage.openAppsExplorePage();

        SoftAssert.assertThat(
                appsExplorePage.isExploreLinkActivated())
                .as("Explore link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_APPS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageAssetsPageCanBeOpen() {
            printTestHeader("Test Case: check that Apps.ManageAssets page can be open");

        AppsPage appsPage = getCommonPage().openAppsPage();
        AppsManageAssetsPage appsManageAssetsPage = appsPage.openAppsManageAssetsPage();

        SoftAssert.assertThat(
                appsManageAssetsPage.isCreateAssetsDisplayed())
                .as("'Create Assets' button is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_ASSETS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageMyAssetsPageCanBeOpen() {
        printTestHeader("Test Case: check that Apps.Manage.MyAssets page can be open");

        AppsPage appsPage = getCommonPage().openAppsPage();
        AppsManageAssetsPage appsManageAssetsPage = appsPage.openAppsManageAssetsPage();
        AppsManageMyAssetsPage appsManageMyAssetsPage = appsManageAssetsPage.openMyAssetsPage();

        SoftAssert.assertThat(
                appsManageMyAssetsPage.isManageMyAssetsAcivated())
                .as("Manage My Assets link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_ASSETS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
        public void checkAppsManageFeaturedPageCanBeOpen() {
        printTestHeader("Test Case: check that Apps.Manage.Featured page can be open");

        AppsPage appsPage = getCommonPage().openAppsPage();
        AppsManageAssetsPage appsManageAssetsPage = appsPage.openAppsManageAssetsPage();
        AppsManageFeaturedPage appsManageFeaturedPage = appsManageAssetsPage.openFeaturedPage();

        SoftAssert.assertThat(
                appsManageFeaturedPage.isFeaturedManageLinkActivated())
                .as("Manage Featured link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_ASSETS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageExplorePageCanBeOpen() {
        printTestHeader("Test Case: check that Apps.Manage.Explore page can be open");

        AppsPage appsPage = getCommonPage().openAppsPage();
        AppsManageAssetsPage appsManageAssetsPage = appsPage.openAppsManageAssetsPage();
        AppsManageExplorePage appsManageExplorePage = appsManageAssetsPage.openExplorePage();

        SoftAssert.assertThat(
                appsManageExplorePage.isManageExploreLinkActivated())
                .as("Manage Explore link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_ASSETS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsManageCreateAssetsPageCanBeOpen() {
        printTestHeader("Test Case: check that Apps.Manage.CreateAssets page can be open");

        AppsPage appsPage = getCommonPage().openAppsPage();
        AppsManageAssetsPage appsManageAssetsPage = appsPage.openAppsManageAssetsPage();
        AppsManageCreateAssetsPage appsManageCreateAssetsPage = appsManageAssetsPage.openCreateAssetsPage();

        SoftAssert.assertThat(
                appsManageCreateAssetsPage.isGenerateKeyLinkDisplayed())
                .as("Generate Key button on Step 4 is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_ADD_ASSETS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsPageCanBeOpen() {
        printTestHeader("Test Case: check that Comparisons page can be open");

        CompsPage compsPage = getCommonPage().openCompsPage();

        SoftAssert.assertThat(
                compsPage.isMyCompsLinkDisplayed())
                .as("My Comparisons link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_COMPARISONS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsMyCompsPageCanBeOpen() {
        printTestHeader("Test Case: check that Comparisons.MyComparisons page can be open");

        CompsPage compsPage = getCommonPage().openCompsPage();
        CompsMyCompsPage compsMyCompsPage = compsPage.openCompsMyCompsPage();

        SoftAssert.assertThat(
                compsMyCompsPage.isMyCompsLinkActivated())
                .as("My Comparisons link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_COMPARISONS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsFeaturedPageCanBeOpen() {
        printTestHeader("Test Case: check that Comparisons.Featured page can be open");

        CompsPage compsPage = getCommonPage().openCompsPage();
        CompsFeaturedPage compsFeaturedPage = compsPage.openCompsFeaturedPage();

        SoftAssert.assertThat(
                compsFeaturedPage.isFeaturedLinkActivated())
                .as("Featured link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_COMPARISONS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsExplorePageCanBeOpen() {
        printTestHeader("Test Case: check that Comparisons.Explore page can be open");

        CompsPage compsPage = getCommonPage().openCompsPage();
        CompsExplorePage compsExplorePage = compsPage.openCompsExplorePage();

        SoftAssert.assertThat(
                compsExplorePage.isExploreLinkActivated())
                .as("Explore link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_COMPARISONS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsRunComparisonPageCanBeOpen() {
        printTestHeader("Test Case: check that Comparisons.RunComparison page can be open");

        CompsPage compsPage = getCommonPage().openCompsPage();
        CompsRunComparisonPage compsRunComparisonPage = compsPage.openCompsRunComparisonPage();

        SoftAssert.assertThat(
                compsRunComparisonPage.isCircleWithDisplayed())
                .as("circle 'with' is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_COMPARATOR);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesPageCanBeOpen() {
        printTestHeader("Test Case: check that Files page can be open");

        FilesPage filesPage = getCommonPage().openFilesPage();

        SoftAssert.assertThat(
                filesPage.isMyFilesLinkDisplayed())
                .as("My Files link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_FILES);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesMyFilesPageCanBeOpen() {
        printTestHeader("Test Case: check that Files.MyFiles page can be open");

        FilesPage filesPage = getCommonPage().openFilesPage();
        FilesMyFilesPage filesMyFilesPage = filesPage.openFilesMyFilesPage();

        SoftAssert.assertThat(
                filesMyFilesPage.isMyFilesLinkActivated())
                .as("My Files link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_FILES);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesFeaturedPageCanBeOpen() {
        printTestHeader("Test Case: check that Files.Featured page can be open");

        FilesPage filesPage = getCommonPage().openFilesPage();
        FilesFeaturedPage filesFeaturedPage = filesPage.openFilesFeaturedPage();

        SoftAssert.assertThat(
                filesFeaturedPage.isFeaturedLinkActivated())
                .as("Featured link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_FILES);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesExplorePageCanBeOpen() {
        printTestHeader("Test Case: check that Files.Explore page can be open");

        FilesPage filesPage = getCommonPage().openFilesPage();
        FilesExplorePage filesExplorePage = filesPage.openFilesExplorePage();

        SoftAssert.assertThat(
                filesExplorePage.isExploreLinkActivated())
                .as("Explore link is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_FILES);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkFilesAddFilesPageCanBeOpen() {
        printTestHeader("Test Case: check that Files.AddFiles page can be open");

        FilesPage filesPage = getCommonPage().openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();

        SoftAssert.assertThat(
                filesAddFilesPage.isBrowseFilesButtonDisplayed())
                .as("Browse Files button is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_UPLOAD_FILES);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkExpertsPageCanBeOpen() {
        printTestHeader("Test Case: check that Experts page can be open");

        ExpertsPage expertsPage = getCommonPage().openExpertsPage();

        SoftAssert.assertThat(
                expertsPage.isExpertsIconDisplayed())
                .as("Experts icon is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_EXPERTS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkChallengesPageCanBeOpen() {
        printTestHeader("Test Case: check that Challenges page can be open");

        ChallsPage challsPage = getCommonPage().openChallsPage();

        SoftAssert.assertThat(
                challsPage.isChallengesIconDisplayed())
                .as("Challenges icon is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_CHALLS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkDiscussionsPageCanBeOpen() {
        printTestHeader("Test Case: check that Discussions page can be open");

        DiscsPage discsPage = getCommonPage().openDiscsPage();

        SoftAssert.assertThat(
                discsPage.isStartDiscsButtonDisplayed())
                .as("Start Discussion button is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_DISCS);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkDiscussionsNewDiscPageCanBeOpen() {
        printTestHeader("Test Case: check that Discussions.NewDiscussion page can be open");

        DiscsPage discsPage = getCommonPage().openDiscsPage();
        DiscsNewDiscPage discsNewDiscPage = discsPage.openNewDiscPage();

        SoftAssert.assertThat(
                discsNewDiscPage.isEditorDisplayed())
                .as("New Discussion Editor is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_EDIT_DISC);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkOverviewPageCanBeOpen() {
        printTestHeader("Test Case: check that Overview page can be open");

        OverviewPage overviewPage = getCommonPage().openOverviewPage();

        SoftAssert.assertThat(
                overviewPage.isWelcomeTextDisplayed())
                .as("Welcome Text is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_OVERVIEW);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkProfilePageCanBeOpen() {
        printTestHeader("Test Case: check that Profile page can be open");

        ProfilePage profilePage = getCommonPage().openProfilePage();

        SoftAssert.assertThat(
                profilePage.isAboutOrgTextDisplayed())
                .as("About your organization Text is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_PROFILE);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkPublicProfilePageCanBeOpen() {
        printTestHeader("Test Case: check that Public Profile page can be open");

        PublicProfilePage publicProfilePage = getCommonPage().openPublicProfilePage();

        SoftAssert.assertThat(
                publicProfilePage.isJoinedTagDisplayed())
                .as("'Joined' tag is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_PUBLIC_PROFILE);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkLicensePageCanBeOpen() {
        printTestHeader("Test Case: check that License page can be open");

        LicensesPage licensesPage = getCommonPage().openLicensePage();

        SoftAssert.assertThat(
                licensesPage.isCreateNewLicenseDisplayed())
                .as("Create New License button is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_LICENSES);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAboutPageCanBeOpen() {
        printTestHeader("Test Case: check that About page can be open");

        AboutPage aboutPage = getCommonPage().openAboutPage();

        SoftAssert.assertThat(
                 aboutPage.isAboutWhyLinkDisplayed())
                .as("Why? tab is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_ABOUT);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAboutWhyPageCanBeOpen() {
        printTestHeader("Test Case: check that About.Why page can be open");

        AboutPage aboutPage = getCommonPage().openAboutPage();
        AboutWhyPage aboutWhyPage = aboutPage.openAboutWhyPage();

        SoftAssert.assertThat(
                aboutWhyPage.isAboutWhyActivatedLinkDisplayed())
                .as("Why? tab is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_ABOUT);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAboutWhatPageCanBeOpen() {
        printTestHeader("Test Case: check that About.What page can be open");

        AboutPage aboutPage = getCommonPage().openAboutPage();
        AboutWhatPage aboutWhatPage = aboutPage.openAboutWhatPage();

        SoftAssert.assertThat(
                aboutWhatPage.isAboutWhatActivatedLinkDisplayed())
                .as("What? tab is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_ABOUT);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAboutWhoPageCanBeOpen() {
        printTestHeader("Test Case: check that About.Who page can be open");

        AboutPage aboutPage = getCommonPage().openAboutPage();
        AboutWhoPage aboutWhoPage = aboutPage.openAboutWhoPage();

        SoftAssert.assertThat(
                aboutWhoPage.isAboutWhoActivatedLinkDisplayed())
                .as("Who? tab is activated")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_ABOUT);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAboutHowPageCanBeOpen() {
        printTestHeader("Test Case: check that About.How page can be open");

        AboutPage aboutPage = getCommonPage().openAboutPage();
        AboutHowPage aboutHowPage = aboutPage.openAboutHowPage();

        SoftAssert.assertThat(
                aboutHowPage.isAboutIntroTitleDisplayed())
                .as("'Introduction' title is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkGuidelinesPageCanBeOpen() {
        printTestHeader("Test Case: check that guidelines page can be open");

        GuidelinesPage guidelinesPage = getCommonPage().openGuidelinesPage();

        SoftAssert.assertThat(
                guidelinesPage.isGuidelinesCarouselDisplayed())
                .as("guidelines Carousel is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_GUIDELINES);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkDocsPageCanBeOpen() {
        printTestHeader("Test Case: check that Docs page can be open");

        AboutHowPage docsPage = getCommonPage().openDocsPage();

        SoftAssert.assertThat(
                docsPage.isAboutIntroTitleDisplayed())
                .as("'Introduction' title is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

}
