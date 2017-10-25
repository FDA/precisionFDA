package staging.cases;

import org.testng.annotations.Test;
import staging.model.Users;
import staging.pages.CommonPage;
import staging.pages.notes.NotesEditNotePage;
import staging.pages.notes.NotesPage;
import staging.pages.notes.NotesSavedNotePage;

import static org.assertj.core.api.Assertions.assertThat;

public class NotesManagementTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader("Test Case: Successful Login");

        Users user = Users.getTestUser();
        openStartPage();
        CommonPage commonPage = correctLoginToFDA(user);

        SoftAssert.assertThat(
                commonPage.isNavigationPanelDisplayed())
                .as("navigation panel is displayed")
                .isTrue();

        SoftAssert.assertThat(
                commonPage.isCorrectUserNameDisplayed(user))
                .as("logged username is displayed")
                .isTrue();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void verifyDataOnNewNotePage() {
        printTestHeader("Test Case: check that user data is displayed correctly by default on New Note page");

        CommonPage commonPage = openCommonPage();
        NotesEditNotePage notesEditNotePage = commonPage.openNotesPage().openNotesNewNotePage();

        SoftAssert.assertThat(
                notesEditNotePage.getEnteredTitle())
                .as("entered by default Title")
                .isEqualTo(notesEditNotePage.getExpectedDefaultTitle());

        SoftAssert.assertThat(
                notesEditNotePage.getActOrg())
                .as("Org")
                .isEqualTo(notesEditNotePage.getExpOrg());

        SoftAssert.assertThat(
                notesEditNotePage.getActAddedBy())
                .as("Added By")
                .isEqualTo(notesEditNotePage.getExpAddedBy());

        SoftAssert.assertThat(
                notesEditNotePage.getActCreated())
                .as("Created")
                .contains(notesEditNotePage.getExpCreated());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin"}, priority = 0)
    public void createAndSaveNote() {
        printTestHeader("Test Case: create and save new note");

        CommonPage commonPage = openCommonPage();
        NotesEditNotePage notesEditNotePage = commonPage.openNotesPage().openNotesNewNotePage();

        notesEditNotePage.fillNoteTitleField();
        notesEditNotePage.fillNoteTextArea();
        notesEditNotePage = notesEditNotePage.saveNote();
        NotesPage notesPage = notesEditNotePage.openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed())
                .as("Link to created note is displayed")
                .isTrue();

        /*
        assertThat(
                notesPage.getFirstNoteTitleText())
                .as("Created Note Title")
                .contains(notesEditNotePage.getExpectedEditedNoteTitle());


        SoftAssert.assertThat(
                notesPage.getFirstNoteUserName())
                .as("Created Note Username")
                .isEqualTo(notesEditNotePage.getExpectedUsername());

        SoftAssert.assertThat(
                notesPage.getFirstNoteUserOrg())
                .as("Created Note Org")
                .isEqualTo(notesEditNotePage.getCurrentOrg());

        SoftAssert.assertThat(
                notesPage.getFirstNoteCreatedText())
                .as("Date/time created")
                .contains(notesEditNotePage.getExpCreated());

        SoftAssert.assertAll();
        */
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void deleteNote() {
        printTestHeader("Test Case: verify that a note can be deleted");

        CommonPage commonPage = openCommonPage();
        NotesEditNotePage notesEditNotePage = commonPage.openNotesPage().openNotesNewNotePage();

        notesEditNotePage = notesEditNotePage.fillAndSaveNoteToDelete();
        NotesPage notesPage = notesEditNotePage.openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedToDeleteNoteDisplayed())
                .as("Link to just created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedToDeleteNote();
        notesPage = savedNotePage.deleteNote();

        assertThat(
                notesPage.isNotesSuccessMessageDisplayed())
                .as("success alert is displayed")
                .isTrue();

        SoftAssert.assertThat(
                notesPage.getNotesSuccessMessageText())
                .as("success alert message")
                .contains(notesPage.getExpectedNoteToDeleteTitleText());

        SoftAssert.assertThat(
                notesPage.isLinkToCreatedToDeleteNoteDisplayed())
                .as("deleted note is displayed on list")
                .isFalse();

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveNote"})
    public void openCreatedNoteAndVerify() {
        printTestHeader("Test Case: open and verify values of previously created note");

        CommonPage commonPage = openCommonPage();
        NotesPage notesPage = commonPage.openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed())
                .as("Link to created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote();

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteTitleText())
                .as("Note Title")
                .isEqualTo(savedNotePage.getExpectedNoteEditedTitleText());

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteOrgText())
                .as("Note Org")
                .isEqualTo(savedNotePage.getExpOrgText());

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteAddedByText())
                .as("Note Added By")
                .isEqualTo(savedNotePage.getExpAddedByText());

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteCreatedText())
                .as("Note Created")
                .contains(savedNotePage.getExpCreatedText());

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteBodyText())
                .as("Note Body Text")
                .contains(savedNotePage.getExpNoteBodyText());

        SoftAssert.assertAll();
    }
}