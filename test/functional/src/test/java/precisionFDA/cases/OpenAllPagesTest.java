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

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Open all pages test suite")
public class OpenAllPagesTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader("Test Case: Successful Login");

        UserProfile user = TestUserData.getTestUserOne();
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

        NotesPage notesPage = openNotesPage();
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

        NotesPage notesPage = openNotesPage();
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

        NotesPage notesPage = openNotesPage();
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

    @Test(dependsOnMethods = { "successfulLogin" }, enabled = false)
    public void checkNotesNewNotePageCanBeOpen() {
        printTestHeader("Test Case: check that New Note page can be open");

        NotesPage notesPage = openNotesPage();
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

        AppsPage appsPage = openOverviewPage().openAppsPage();

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

        AppsPage appsPage = openOverviewPage().openAppsPage();
        AppsRelevantPage appsRelevantPage = appsPage.openAppsRelevantPage();

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

        AppsPage appsPage = openOverviewPage().openAppsPage();
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

        AppsPage appsPage = openOverviewPage().openAppsPage();
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

        AppsPage appsPage = openOverviewPage().openAppsPage();
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

        AppsPage appsPage = openOverviewPage().openAppsPage();
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

        AppsPage appsPage = openOverviewPage().openAppsPage();
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

        AppsPage appsPage = openOverviewPage().openAppsPage();
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

        AppsPage appsPage = openOverviewPage().openAppsPage();
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

        AppsPage appsPage = openOverviewPage().openAppsPage();
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

        ExpertsPage expertsPage = openExpertsPage();

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

        DiscsPage discsPage = openDiscsPage();

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

        DiscsPage discsPage = openDiscsPage();
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

        ProfilePage profilePage = openProfilePage();

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

        PublicProfilePage publicProfilePage = openPublicProfilePage();

        assertThat(
                publicProfilePage.isJoinedTagDisplayed())
                .as("'Joined' tag is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = { "successfulLogin" })
    public void checkLicensePageCanBeOpen() {
        printTestHeader("Test Case: check that License page can be open");

        LicensesPage licensesPage = openLicensePage();

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

        GuidelinesPage guidelinesPage = openGuidelinesPage();

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

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkDocsPageCanBeOpen() {
        printTestHeader("Test Case: open Docs page");

        DocsPage docsPage = openDocsPage();

        assertThat(
                docsPage.isDocsListTitleDisplayed())
                .as("'Documentation' list title is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkDocsIntroductionPage() {
        printTestHeader("Test Case: check Docs Introduction page");

        DocsPage docsPage = openOverviewPage().openDocsPage();

        assertThat(
                docsPage.isIntroLinkDisplayed())
                .as("Link to Docs Introduction page is displayed")
                .isTrue();

        docsPage = docsPage.clickIntroLink();

        assertThat(
                docsPage.isIntroTitleDisplayed())
                .as("Introduction page title is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkDocsFilesPage() {
        printTestHeader("Test Case: check Docs Files page");

        DocsPage docsPage = openOverviewPage().openDocsPage();

        assertThat(
                docsPage.isFilesLinkDisplayed())
                .as("Link to Docs Files page is displayed")
                .isTrue();

        docsPage = docsPage.clickFilesLink();

        SoftAssert.assertThat(
                docsPage.isFilesTitleDisplayed())
                .as("Docs Files page title is displayed")
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

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkDocsComparisonsPage() {
        printTestHeader("Test Case: check Docs Comparisons page");

        DocsPage docsPage = openOverviewPage().openDocsPage();

        assertThat(
                docsPage.isCompsLinkDisplayed())
                .as("Link to Docs Comparisons page is displayed")
                .isTrue();

        docsPage = docsPage.clickCompsLink();

        SoftAssert.assertThat(
                docsPage.isDocsCompsTitleDisplayed())
                .as("Docs Comparisons page title is displayed")
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

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkDocsAppsPage() {
        printTestHeader("Test Case: check Docs Apps page");

        DocsPage docsPage = openOverviewPage().openDocsPage();

        assertThat(
                docsPage.isAppsLinkDisplayed())
                .as("Link to Docs Apps page is displayed")
                .isTrue();

        docsPage = docsPage.clickAppsLink();

        SoftAssert.assertThat(
                docsPage.isDocsAppsTitleDisplayed())
                .as("Docs Apps page title is displayed")
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

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkDocsCreatingAppsPage() {
        printTestHeader("Test Case: check Docs Creating Apps page");

        DocsPage docsPage = openOverviewPage().openDocsPage();

        assertThat(
                docsPage.isCreatingAppsLinkDisplayed())
                .as("Link to Docs Creating Apps page is displayed")
                .isTrue();

        docsPage = docsPage.clickCreatingAppsLink();

        SoftAssert.assertThat(
                docsPage.isDocsCreatingAppsTitleDisplayed())
                .as("Docs Creating Apps page title is displayed")
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

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkDocsNotesPage() {
        printTestHeader("Test Case: check Docs Notes page");

        DocsPage docsPage = openOverviewPage().openDocsPage();

        assertThat(
                docsPage.isNotesLinkDisplayed())
                .as("Link to Docs Notes page is displayed")
                .isTrue();

        docsPage = docsPage.clickNotesLink();

        SoftAssert.assertThat(
                docsPage.isDocsNotesTitleDisplayed())
                .as("Docs Notes page title is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isNotesEditingLinkDisplayed())
                .as("Editing notes link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isNotesIdeasLinkDisplayed())
                .as("Ideas for using notes link is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkDocsDiscussionsPage() {
        printTestHeader("Test Case: check Docs Discussions page");

        DocsPage docsPage = openOverviewPage().openDocsPage();

        assertThat(
                docsPage.isDiscsLinkDisplayed())
                .as("Link to Docs Discussions page is displayed")
                .isTrue();

        docsPage = docsPage.clickDiscussionsLink();

        SoftAssert.assertThat(
                docsPage.isDocsDiscussionsTitleDisplayed())
                .as("Docs Discussions page title is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isDiscsCreatingLinkDisplayed())
                .as("Creating a discussion link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isDiscsAnswerLinkDisplayed())
                .as("Writing an answer link is displayed")
                .isTrue();

        SoftAssert.assertThat(
                docsPage.isDiscsCommentingLinkDisplayed())
                .as("Commenting & upvoting link is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkDocsTrackingPage() {
        printTestHeader("Test Case: check Docs Tracking page");

        DocsPage docsPage = openOverviewPage().openDocsPage();

        assertThat(
                docsPage.isTrackingLinkDisplayed())
                .as("Link to Docs Tracking page is displayed")
                .isTrue();

        docsPage = docsPage.clickTrackingLink();

        assertThat(
                docsPage.isDocsTrackingTitleDisplayed())
                .as("Docs Tracking page title is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkDocsPublishingPage() {
        printTestHeader("Test Case: check Docs Publishing page");

        DocsPage docsPage = openOverviewPage().openDocsPage();

        assertThat(
                docsPage.isPublishingLinkDisplayed())
                .as("Link to Docs Publishing page is displayed")
                .isTrue();

        docsPage = docsPage.clickPublishingLink();

        assertThat(
                docsPage.isDocsPublishingTitleDisplayed())
                .as("Docs Publishing page title is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkDocsLicensesPage() {
        printTestHeader("Test Case: check Docs Licenses page");

        DocsPage docsPage = openOverviewPage().openDocsPage();

        assertThat(
                docsPage.isLicensesLinkDisplayed())
                .as("Link to Docs Licenses page is displayed")
                .isTrue();

        docsPage = docsPage.clickLicensesLink();

        assertThat(
                docsPage.isDocsLicensesTitleDisplayed())
                .as("Docs Licenses page title is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkDocsVideoTutorialsPage() {
        printTestHeader("Test Case: check Docs VideoTutorials page");

        DocsPage docsPage = openOverviewPage().openDocsPage();

        assertThat(
                docsPage.isVideoTutorialsLinkDisplayed())
                .as("Link to Docs VideoTutorials page is displayed")
                .isTrue();

        docsPage = docsPage.clickVideoTutorialsLink();

        assertThat(
                docsPage.isDocsVideoTutorialsTitleDisplayed())
                .as("Docs VideoTutorials page title is displayed")
                .isTrue();
    }

}