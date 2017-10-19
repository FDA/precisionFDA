package staging.cases;

import org.apache.log4j.Logger;
import org.testng.Assert;
import org.testng.annotations.Test;
import staging.model.Users;
import staging.pages.CommonPage;
import staging.pages.notes.NotesNewNotePage;

import static org.testng.Assert.assertTrue;

public class NotesManagementTest extends AbstractTest {

    private final Logger log = Logger.getLogger(this.getClass());

    @Test
    public void successfulLogin() {
        logTestHeader("Test Case: Successful Login");

        Users user = Users.getTestUser();

        openStartPage();
        CommonPage commonPage = correctLoginToFDA(user);

        log.info("check navigation panel is displayed");
        assertTrue(commonPage.isNavigationPanelDisplayed());

        log.info("check correct username is displayed");
        assertTrue(commonPage.isCorrectUserNameDisplayed(user));
    }

    @Test(dependsOnMethods = {"successfulLogin"})
    public void verifyDataOnNewNotePage() {
        logTestHeader("Test Case: check that user data is displayed correctly on New Note page");

        Users user = Users.getTestUser();

        CommonPage commonPage = openCommonPage();
        NotesNewNotePage notesNewNotePage = commonPage.openNotesPage().openNotesNewNotePage();

        log.info("verify new note title default value is correct one");
        Assert.assertTrue(notesNewNotePage.isDefaultTitleCorrect(user));

        log.info("verify new note organization value is correct one");
        Assert.assertTrue(notesNewNotePage.isOrgCorrect(user));

        log.info("verify new note Added By value is correct one");
        Assert.assertTrue(notesNewNotePage.isAddedByCorrect(user));

        log.info("verify new note Created value has correct date, hours and minutes");
        Assert.assertTrue(notesNewNotePage.isCreatedDateCorrect());

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