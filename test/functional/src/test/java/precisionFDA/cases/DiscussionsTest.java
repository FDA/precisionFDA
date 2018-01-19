package precisionFDA.cases;

import org.testng.annotations.Test;
import precisionFDA.data.TestUserData;
import precisionFDA.model.DiscProfile;
import precisionFDA.model.FileProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.discs.CreatedDiscPage;
import precisionFDA.pages.discs.DiscsEditDiscPage;
import precisionFDA.pages.discs.DiscsPage;
import precisionFDA.pages.files.FilesAddFilesPage;
import precisionFDA.pages.files.FilesPage;
import precisionFDA.pages.overview.OverviewPage;
import ru.yandex.qatools.htmlelements.annotations.Name;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestDiscsData.getEditDiscProfile;
import static precisionFDA.data.TestDiscsData.getMainDiscProfile;
import static precisionFDA.data.TestFilesData.getDiscAttachFile;
import static precisionFDA.utils.Utils.*;

@Name("Discussions test suite")
public class DiscussionsTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader(" -- Successful Login -- ");

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

    @Test(priority = 1, dependsOnMethods = {"successfulLogin"})
    public void createDiscussion() {
        printTestHeader("Test Case: create new discussion");

        DiscProfile mainDiscProfile = getMainDiscProfile();
        FileProfile discFile = getDiscAttachFile();

        FilesPage filesPage = openFilesPage();
        FilesAddFilesPage filesAddFilesPage = filesPage.openFilesAddFilesPage();
        filesAddFilesPage = filesAddFilesPage.browseFileToUpload(discFile.getFileName());
        filesAddFilesPage.uploadAllFiles();

        DiscsPage discsPage = openOverviewPage().openDiscsPage();
        DiscsEditDiscPage editDiscPage = discsPage.openNewDiscPage();
        editDiscPage.fillDiscForm(mainDiscProfile);
        editDiscPage = editDiscPage.attachFile(discFile.getFileName());

        assertThat(
                editDiscPage.isAttachedFileDisplayed(discFile.getFileName()))
                .as("Link to attached file is displayed")
                .isTrue();

        editDiscPage = editDiscPage.clickSave();

        discsPage = editDiscPage.openDiscsPage();

        assertThat(
                discsPage.isLinkToDiscussionDisplayed(mainDiscProfile.getDiscName()))
                .as("Link to created discussion is displayed")
                .isTrue();
    }

    @Test(priority = 2, dependsOnMethods = {"successfulLogin", "createDiscussion"})
    public void verifyCreatedDiscussion() {
        printTestHeader("Test Case: verify created discussion");

        DiscProfile mainDiscProfile = getMainDiscProfile();

        DiscsPage discsPage = openOverviewPage().openDiscsPage();

        assertThat(
                discsPage.isLinkToDiscussionDisplayed(mainDiscProfile.getDiscName()))
                .as("Link to created discussion is displayed")
                .isTrue();

        CreatedDiscPage createdDiscPage = discsPage.openCreatedDisc(mainDiscProfile.getDiscName());

        SoftAssert.assertThat(
                createdDiscPage.isSavedTitleCorrect(mainDiscProfile))
                .as("Title of created discussion is correct one")
                .isTrue();

        SoftAssert.assertThat(
                createdDiscPage.isSavedContentCorrect(mainDiscProfile))
                .as("Content of created discussion is correct one")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(priority = 3, dependsOnMethods = {"successfulLogin", "createDiscussion"})
    public void editDiscussion() {
        printTestHeader("Test Case: edit discussion");

        DiscProfile mainDiscProfile = getMainDiscProfile();
        DiscProfile editDiscProfile = getEditDiscProfile();
        FileProfile discFile = getDiscAttachFile();

        DiscsPage discsPage = openOverviewPage().openDiscsPage();

        assertThat(
                discsPage.isLinkToDiscussionDisplayed(mainDiscProfile.getDiscName()))
                .as("Link to created discussion is displayed")
                .isTrue();

        CreatedDiscPage createdDiscPage = discsPage.openCreatedDisc(mainDiscProfile.getDiscName());
        DiscsEditDiscPage editDiscPage = createdDiscPage.clickEdit();

        editDiscPage.fillDiscForm(editDiscProfile);
        editDiscPage = editDiscPage.clickSave();

        discsPage = editDiscPage.openDiscsPage();

        assertThat(
                discsPage.isLinkToDiscussionDisplayed(editDiscProfile.getDiscName()))
                .as("Link to edited discussion is displayed")
                .isTrue();

        createdDiscPage = discsPage.openCreatedDisc(editDiscProfile.getDiscName());

        SoftAssert.assertThat(
                createdDiscPage.isSavedTitleCorrect(editDiscProfile))
                .as("Title of edited discussion is correct one")
                .isTrue();

        SoftAssert.assertThat(
                createdDiscPage.isSavedContentCorrect(editDiscProfile))
                .as("Content of edited discussion is correct one")
                .isTrue();

        SoftAssert.assertThat(
                editDiscPage.isAttachedFileDisplayed(discFile.getFileName()))
                .as("Link to attached file is displayed after edit")
                .isTrue();

        SoftAssert.assertAll();
    }

}