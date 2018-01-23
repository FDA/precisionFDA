package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.pages.docs.DocsPage;
import ru.yandex.qatools.htmlelements.annotations.Name;
import precisionFDA.data.PageTitles;
import precisionFDA.data.TestUserData;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.guidelines.GuidelinesPage;
import precisionFDA.pages.about.*;
import precisionFDA.pages.apps.*;
import precisionFDA.pages.challs.ChallsPage;
import precisionFDA.pages.comps.*;
import precisionFDA.pages.discs.DiscsEditDiscPage;
import precisionFDA.pages.discs.DiscsPage;
import precisionFDA.pages.experts.ExpertsPage;
import precisionFDA.pages.files.*;
import precisionFDA.pages.licenses.LicensesPage;
import precisionFDA.pages.notes.*;
import precisionFDA.pages.overview.OverviewPage;
import precisionFDA.pages.profile.ProfilePage;
import precisionFDA.pages.profile.PublicProfilePage;

import static precisionFDA.utils.Utils.printTestHeader;

@Name("Open all pages test suite")
public class OpenAllPagesTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader("Test Case: Successful Login");

        UserProfile user = TestUserData.getTestUserOne();
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

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkNotesPageCanBeOpen() {
        printTestHeader("Test Case: check that Notes page can be open");
        
        NotesPage notesPage = openOverviewPage().openNotesPage();

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

        NotesPage notesPage = openOverviewPage().openNotesPage();
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

        NotesPage notesPage = openOverviewPage().openNotesPage();
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

        NotesPage notesPage = openOverviewPage().openNotesPage();
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
    public void checkNotesNewNotePageCanBeOpen() {
        printTestHeader("Test Case: check that New Note page can be open");

        NotesPage notesPage = openOverviewPage().openNotesPage();
        NotesEditNotePage editNotePage = notesPage.openNewNote();

        SoftAssert.assertThat(
                editNotePage.isEditorDisplayed())
                .as("New Note editor is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_EDIT_NOTE);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkAppsPageCanBeOpen() {
        printTestHeader("Test Case: check that Apps page can be open");

        AppsPage appsPage = openAppsPage();

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

        AppsPage appsPage = openAppsPage();
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

        AppsPage appsPage = openAppsPage();
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

        AppsPage appsPage = openAppsPage();
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

        AppsPage appsPage = openAppsPage();
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

        AppsPage appsPage = openAppsPage();
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

        AppsPage appsPage = openAppsPage();
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

        AppsPage appsPage = openAppsPage();
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

        AppsPage appsPage = openAppsPage();
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

    // disabled because of confirmation popup; checked via AppsTests suite
    @Test(dependsOnMethods = { "successfulLogin" }, enabled = false)
    public void checkAppsCreateAppPageCanBeOpen() {
        printTestHeader("Test Case: check that Create App page can be open");

        AppsPage appsPage = openAppsPage();
        AppsEditAppPage editAppPage = appsPage.openCreateAppPage();

        SoftAssert.assertThat(
                editAppPage.isNewAppTitleInputDisplayed())
                .as("Title input is displayed")
                .isTrue();

        SoftAssert.assertThat(
                getPageTitle())
                .as("Page Title")
                .contains(PageTitles.PAGE_TITLE_APPS_CREATE_NEW);

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkCompsPageCanBeOpen() {
        printTestHeader("Test Case: check that Comparisons page can be open");

        CompsPage compsPage = openOverviewPage().openCompsPage();

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

        CompsPage compsPage = openOverviewPage().openCompsPage();
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

        CompsPage compsPage = openOverviewPage().openCompsPage();
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

        CompsPage compsPage = openOverviewPage().openCompsPage();
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

        CompsPage compsPage = openOverviewPage().openCompsPage();
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

        FilesPage filesPage = openFilesPage();

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

        FilesPage filesPage = openOverviewPage().openFilesPage();
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

        FilesPage filesPage = openFilesPage();
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

        FilesPage filesPage = openFilesPage();
        filesPage = filesPage.openFilesExplorePage();

        SoftAssert.assertThat(
                filesPage.isExploreLinkActivated())
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

        FilesPage filesPage = openFilesPage();
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

        ExpertsPage expertsPage = openOverviewPage().openExpertsPage();

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

        ChallsPage challsPage = openChallsPage();

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

        DiscsPage discsPage = openOverviewPage().openDiscsPage();

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

    @Test(dependsOnMethods = { "successfulLogin" }, enabled = false)
    public void checkDiscussionsNewDiscPageCanBeOpen() {
        printTestHeader("Test Case: check that Discussions.NewDiscussion page can be open");

        DiscsPage discsPage = openOverviewPage().openDiscsPage();
        DiscsEditDiscPage discsEditDiscPage = discsPage.openNewDiscPage();

        SoftAssert.assertThat(
                discsEditDiscPage.isEditorDisplayed())
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

        OverviewPage overviewPage = openOverviewPage();

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

        ProfilePage profilePage = openOverviewPage().openProfilePage();

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

        PublicProfilePage publicProfilePage = openOverviewPage().openPublicProfilePage();

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

        LicensesPage licensesPage = openOverviewPage().openLicensePage();

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

        AboutPage aboutPage = openOverviewPage().openAboutPage();

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

        AboutPage aboutPage = openOverviewPage().openAboutPage();
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

        AboutPage aboutPage = openOverviewPage().openAboutPage();
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

        AboutPage aboutPage = openOverviewPage().openAboutPage();
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

        AboutPage aboutPage = openOverviewPage().openAboutPage();
        DocsPage docsPage = aboutPage.openAboutHowPage();

        SoftAssert.assertThat(
                docsPage.isIntroTitleDisplayed())
                .as("'Introduction' title is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkGuidelinesPageCanBeOpen() {
        printTestHeader("Test Case: check that guidelines page can be open");

        GuidelinesPage guidelinesPage = openOverviewPage().openGuidelinesPage();

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

}
