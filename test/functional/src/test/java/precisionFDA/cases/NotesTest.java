package precisionFDA.cases;

import org.testng.annotations.Test;
import ru.yandex.qatools.htmlelements.annotations.Name;
import precisionFDA.data.TestUserData;
import precisionFDA.model.NoteProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.notes.NotesEditNotePage;
import precisionFDA.pages.notes.NotesPage;
import precisionFDA.pages.notes.NotesSavedNotePage;
import precisionFDA.pages.overview.OverviewPage;

import static org.assertj.core.api.Assertions.assertThat;
import static precisionFDA.data.TestNotesData.getMainNoteProfile;
import static precisionFDA.data.TestNotesData.getNoteToDelete;
import static precisionFDA.data.TestNotesData.getNoteToEdit;
import static precisionFDA.utils.Utils.printTestHeader;

@Name("Notes Management Test Suite")
public class NotesTest extends AbstractTest {

    @Test
    void precondition() {
        successfulLogin();
    }

    public void successfulLogin() {
        printTestHeader(" -- Login -- ");

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

    @Test(dependsOnMethods = {"precondition"})
    public void verifyDataOnNewNotePage() {
        printTestHeader("Test Case: check that correct data is displayed by default on a New Note form");

        NotesEditNotePage notesEditNotePage = openOverviewPage().openNotesPage().openNewNote();

        SoftAssert.assertThat(
                notesEditNotePage.getEnteredTitleText())
                .as("entered by default Title")
                .isEqualTo(notesEditNotePage.getExpectedDefaultTitle());

        SoftAssert.assertThat(
                notesEditNotePage.getActOrgText())
                .as("Org")
                .isEqualTo(notesEditNotePage.getExpOrgText());

        SoftAssert.assertThat(
                notesEditNotePage.getActAddedByText())
                .as("Added By")
                .isEqualTo(notesEditNotePage.getExpAddedByText());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"precondition"}, priority = 0)
    public void createAndSaveNote() {
        printTestHeader("Test Case: create and save new note");

        NoteProfile noteProfile = getMainNoteProfile();

        NotesPage notesPage = openOverviewPage().openNotesPage();

        NotesEditNotePage notesEditNotePage = notesPage.openNewNote();
        notesEditNotePage.fillAndSaveNote(noteProfile);
        notesPage = notesEditNotePage.openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed(noteProfile))
                .as("Link to created note is displayed")
                .isTrue();
    }

    @Test(dependsOnMethods = {"precondition"})
    public void deleteNote() {
        printTestHeader("Test Case: verify that a note can be deleted");

        NoteProfile noteProfile = getNoteToDelete();

        NotesPage notesPage = openOverviewPage().openNotesPage();

        NotesEditNotePage notesEditNotePage = notesPage.openNewNote();
        notesEditNotePage.fillAndSaveNote(noteProfile);
        notesPage = notesEditNotePage.openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed(noteProfile))
                .as("Link to just created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote(noteProfile);
        notesPage = savedNotePage.deleteNote();

        assertThat(
                notesPage.isNotesSuccessMessageDisplayed())
                .as("success alert is displayed")
                .isTrue();

        SoftAssert.assertThat(
                notesPage.getNotesSuccessMessageText())
                .as("success alert message")
                .contains(noteProfile.getNoteTitleText());

        SoftAssert.assertThat(
                notesPage.isLinkToCreatedNoteDisplayed(noteProfile))
                .as("deleted note is displayed on list")
                .isFalse();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveNote"})
    public void openCreatedNoteAndVerify() {
        printTestHeader("Test Case: open and verify values of previously created note");

        NoteProfile noteProfile = getMainNoteProfile();

        NotesPage notesPage = openOverviewPage().openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed(noteProfile))
                .as("Link to created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote(noteProfile);

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteTitleText())
                .as("Note Title")
                .isEqualTo(noteProfile.getNoteTitleText());

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteOrgText())
                .as("Note Org")
                .isEqualTo(savedNotePage.getExpOrgText());

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteAddedByText())
                .as("Note Added By")
                .isEqualTo(savedNotePage.getExpAddedByText());

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteBodyText())
                .as("Note Body Text")
                .contains(noteProfile.getNoteRichText());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveNote"})
    public void editAndSaveCreatedNote() {
        printTestHeader("Test Case: edit and save previously created note, verify changes");

        NoteProfile noteProfile = getMainNoteProfile();

        NotesPage notesPage = openOverviewPage().openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed(noteProfile))
                .as("Link to created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote(noteProfile);

        assertThat(
                savedNotePage.getSavedNoteTitleText())
                .as("Note Title")
                .isEqualTo(noteProfile.getNoteTitleText());

        NotesEditNotePage notesEditNotePage = savedNotePage.openNoteForEdit();

        notesEditNotePage.editNoteWithNewDataAndSave(noteProfile);
        notesPage = notesEditNotePage.openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed(noteProfile))
                .as("updated note title is displayed on list")
                .isTrue();

        savedNotePage = notesPage.openCreatedNote(noteProfile);

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteTitleText())
                .as("Updated Note Title")
                .isEqualTo(noteProfile.getNoteTitleText());

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteOrgText())
                .as("Note Org")
                .isEqualTo(savedNotePage.getExpOrgText());

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteAddedByText())
                .as("Note Added By")
                .isEqualTo(savedNotePage.getExpAddedByText());

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteBodyText())
                .as("Updated Note Body Text")
                .contains(noteProfile.getNoteRichText());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveNote"})
    public void verifyEditFormHasPreviouslySavedData() {
        printTestHeader("Test Case: check that a note edit form contains correct previously saved values");

        NoteProfile noteProfile = getMainNoteProfile();

        NotesPage notesPage = openOverviewPage().openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed(noteProfile))
                .as("Link to created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote(noteProfile);
        NotesEditNotePage notesEditNotePage = savedNotePage.openNoteForEdit();

        SoftAssert.assertThat(
                notesEditNotePage.getEnteredTitleText())
                .as("saved note title")
                .isEqualTo(noteProfile.getNoteTitleText());

        SoftAssert.assertThat(
                notesEditNotePage.getEnteredBodyText())
                .as("saved note body")
                .contains(noteProfile.getNoteRawText());

        SoftAssert.assertThat(
                notesEditNotePage.getActOrgText())
                .as("Org")
                .isEqualTo(notesEditNotePage.getExpOrgText());

        SoftAssert.assertThat(
                notesEditNotePage.getActAddedByText())
                .as("Added By")
                .isEqualTo(notesEditNotePage.getExpAddedByText());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveNote"})
    public void verifyPreviewTab() {
        printTestHeader("Test Case: verify Preview tab");

        NoteProfile noteProfile = getMainNoteProfile();

        NotesPage notesPage = openOverviewPage().openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed(noteProfile))
                .as("Link to created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote(noteProfile);
        NotesEditNotePage notesEditNotePage = savedNotePage.openNoteForEdit();
        notesEditNotePage = notesEditNotePage.openPreviewTab();

        assertThat(
                notesEditNotePage.getNotePreviewBodyText())
                .as("note body text on preview tab")
                .contains(noteProfile.getNoteRichText());
    }

    @Test(dependsOnMethods = {"precondition", "createAndSaveNote"})
    public void leaveComment() {
        printTestHeader("Test Case: write a comment for a note");

        NoteProfile noteProfile = getMainNoteProfile();

        NotesPage notesPage = openOverviewPage().openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed(noteProfile))
                .as("Link to created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote(noteProfile);
        savedNotePage = savedNotePage.leaveComment();

        assertThat(
                savedNotePage.getNotesSavedNoteFirstCommentText())
                .as("submitted comment")
                .isEqualTo(savedNotePage.getExpectedCommentText());
    }

    @Test(dependsOnMethods = {"precondition"})
    public void verifyNoteIsNotChangedIfPressBack() {
        printTestHeader("Test Case: verify that a note is not changed after edit and pressing Back");

        NoteProfile initProfile = getNoteToEdit();

        NotesPage notesPage = openOverviewPage().openNotesPage();

        NotesEditNotePage notesEditNotePage = notesPage.openNewNote();
        notesEditNotePage.fillAndSaveNote(initProfile);
        notesPage = notesEditNotePage.openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed(initProfile))
                .as("Link to just created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote(initProfile);
        notesEditNotePage = savedNotePage.openNoteForEdit();

        notesEditNotePage.editNoteTitleWithNewValue(initProfile);
        notesEditNotePage.editNoteTextWithNewValue(initProfile);
        savedNotePage = notesEditNotePage.clickBack();

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteTitleText())
                .as("Not changed Title")
                .isEqualTo(initProfile.getNoteTitleText());

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteOrgText())
                .as("Note Org")
                .isEqualTo(savedNotePage.getExpOrgText());

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteAddedByText())
                .as("Note Added By")
                .isEqualTo(savedNotePage.getExpAddedByText());

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteBodyText())
                .as("Not changed Body Text")
                .contains(initProfile.getNoteRichText());

        SoftAssert.assertAll();
    }
}