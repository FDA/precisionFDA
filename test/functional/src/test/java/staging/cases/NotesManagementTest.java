package staging.cases;

import org.testng.annotations.Test;
import staging.model.Users;
import staging.pages.CommonPage;
import staging.pages.notes.NotesNewNotePage;
import static org.testng.Assert.assertTrue;

public class NotesManagementTest extends AbstractTest {

    @Test
    public void successfulLogin() {
        printTestHeader("Test Case: Successful Login");

        Users user = Users.getTestUser();

        openStartPage();
        CommonPage commonPage = correctLoginToFDA(user);

        assertTrue(commonPage.isNavigationPanelDisplayed(), "navigation panel is displayed");
        assertTrue(commonPage.isCorrectUserNameDisplayed(user), "logged username is displayed");
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void verifyDataOnNewNotePage() {
        printTestHeader("Test Case: check that user data is displayed correctly on New Note page");

        Users user = Users.getTestUser();

        CommonPage commonPage = openCommonPage();
        NotesNewNotePage notesNewNotePage = commonPage.openNotesPage().openNotesNewNotePage();

        assertTrue(notesNewNotePage.isDefaultTitleCorrect(user), "new note title default value is correct one");
        assertTrue(notesNewNotePage.isOrgCorrect(user), "new note organization value is correct one");
        assertTrue(notesNewNotePage.isAddedByCorrect(user), "new note Added By value is correct one");
        assertTrue(notesNewNotePage.isCreatedDateCorrect(), "new note Created value has correct date, hours and minutes");
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void checkNoteAutoSave() {

    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void createAndSaveNote() {

    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void editNote() {


    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void deleteNote() {


    }

}