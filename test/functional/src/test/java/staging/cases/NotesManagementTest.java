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
        printTestHeader("Test Case: check that correct data is displayed by default on a New Note form");

        CommonPage commonPage = openCommonPage();
        NotesEditNotePage notesEditNotePage = commonPage.openNotesPage().openNotesNewNotePage();

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

        SoftAssert.assertThat(
                notesEditNotePage.getActCreatedText())
                .as("Created")
                .contains(notesEditNotePage.getExpCreatedText());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin"}, priority = 0)
    public void createAndSaveNote() {
        printTestHeader("Test Case: create and save new note");

        CommonPage commonPage = openCommonPage();
        NotesEditNotePage notesEditNotePage = commonPage.openNotesPage().openNotesNewNotePage();

        notesEditNotePage.fillNewNoteTitleField();
        notesEditNotePage.fillNewNoteTextArea();
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
                .contains(notesEditNotePage.getExpectedEditedNoteTitleText());


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
                .contains(notesEditNotePage.getExpCreatedText());

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

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveNote"})
    public void editAndSaveCreatedNote() {
        printTestHeader("Test Case: edit and save previously created note, verify changes");

        CommonPage commonPage = openCommonPage();
        NotesPage notesPage = commonPage.openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed())
                .as("Link to created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote();

        assertThat(
                savedNotePage.getSavedNoteTitleText())
                .as("Note Title")
                .isEqualTo(savedNotePage.getExpectedNoteEditedTitleText());

        NotesEditNotePage notesEditNotePage = savedNotePage.openNoteForEdit();

        notesEditNotePage.editNoteWithNewDataAndSave();
        notesPage = notesEditNotePage.openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed())
                .as("updated note title is displayed on list")
                .isTrue();

        savedNotePage = notesPage.openCreatedNote();

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteTitleText())
                .as("Updated Note Title")
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
                .as("Updated Note Body Text")
                .contains(savedNotePage.getExpNoteBodyText());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveNote"})
    public void verifyEditFormHasPreviouslySavedData() {
        printTestHeader("Test Case: check that a note edit form contains correct previously saved values");

        CommonPage commonPage = openCommonPage();
        NotesPage notesPage = commonPage.openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed())
                .as("Link to created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote();
        NotesEditNotePage notesEditNotePage = savedNotePage.openNoteForEdit();

        SoftAssert.assertThat(
                notesEditNotePage.getEnteredTitleText())
                .as("saved note title")
                .isEqualTo(notesEditNotePage.getExpectedEditedNoteTitleText());

        SoftAssert.assertThat(
                notesEditNotePage.getEnteredBodyText())
                .as("saved note body")
                .contains(notesEditNotePage.getExpectedNoteRowText());

        SoftAssert.assertThat(
                notesEditNotePage.getActOrgText())
                .as("Org")
                .isEqualTo(notesEditNotePage.getExpOrgText());

        SoftAssert.assertThat(
                notesEditNotePage.getActAddedByText())
                .as("Added By")
                .isEqualTo(notesEditNotePage.getExpAddedByText());

        SoftAssert.assertThat(
                notesEditNotePage.getActCreatedText())
                .as("Created")
                .contains(notesEditNotePage.getExpCreatedText());

        SoftAssert.assertAll();
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveNote"})
    public void verifyPreviewTab() {
        printTestHeader("Test Case: verify Preview tab");

        CommonPage commonPage = openCommonPage();
        NotesPage notesPage = commonPage.openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed())
                .as("Link to created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote();
        NotesEditNotePage notesEditNotePage = savedNotePage.openNoteForEdit();
        notesEditNotePage = notesEditNotePage.openPreviewTab();

        assertThat(
                notesEditNotePage.getNotePreviewBodyText())
                .as("note body text on preview tab")
                .contains(notesEditNotePage.getExpectedNoteRichText());
    }

    @Test(dependsOnMethods = {"successfulLogin", "createAndSaveNote"})
    public void leaveComment() {
        printTestHeader("Test Case: write a comment for a note");

        CommonPage commonPage = openCommonPage();
        NotesPage notesPage = commonPage.openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedNoteDisplayed())
                .as("Link to created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedNote();
        savedNotePage = savedNotePage.leaveComment();

        assertThat(
                savedNotePage.getNotesSavedNoteFirstCommentText())
                .as("submitted comment")
                .isEqualTo(savedNotePage.getExpectedCommentText());
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void verifyNoteIsNotChangedIfPressBack() {
        printTestHeader("Test Case: verify that a note is not changed after edit and pressing Back");

        CommonPage commonPage = openCommonPage();
        NotesEditNotePage notesEditNotePage = commonPage.openNotesPage().openNotesNewNotePage();

        notesEditNotePage = notesEditNotePage.fillAndSaveNoteToEdit();
        NotesPage notesPage = notesEditNotePage.openNotesPage();

        assertThat(
                notesPage.isLinkToCreatedToEditNoteDisplayed())
                .as("Link to just created note is displayed")
                .isTrue();

        NotesSavedNotePage savedNotePage = notesPage.openCreatedToEditNote();
        notesEditNotePage = savedNotePage.openNoteForEdit();

        notesEditNotePage.editNoteButNotSave();
        savedNotePage = notesEditNotePage.clickBack();

        SoftAssert.assertThat(
                savedNotePage.getSavedNoteTitleText())
                .as("Not changed Title")
                .isEqualTo(savedNotePage.getExpectedNoteToEditTitle());

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
                .as("Not changed Body Text")
                .contains(savedNotePage.getExpectedNoteToEditBody());

        SoftAssert.assertAll();
    }
}