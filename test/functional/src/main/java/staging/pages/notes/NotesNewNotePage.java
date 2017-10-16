package staging.pages.notes;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.locators.NotesLocators;
import staging.model.Users;
import staging.pages.AbstractPage;

public class NotesNewNotePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = NotesLocators.NOTES_NEW_NOTE_EDITOR_AREA)
    private WebElement notesNewNoteEditorWE;

    @FindBy(xpath = NotesLocators.NOTES_NEW_NOTE_EDIT_TAB)
    private WebElement notesNewNoteEditTabWE;

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_TITLE)
    private TextInput notesTitle;

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_ORG)
    private WebElement notesOrg;

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_ADDED_BY)
    private WebElement notesAddedBy;

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_CREATED)
    private WebElement notesCreated;

    public NotesNewNotePage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(NotesLocators.NOTES_NEW_NOTE_EDIT_TAB));
    }

    public WebElement getNotesNewNoteEditorWE() {
        return notesNewNoteEditorWE;
    }

    public WebElement getNotesNewNoteEditTabWE() {
        return notesNewNoteEditTabWE;
    }

    public boolean isEditorDisplayed() {
        return isElementPresent(getNotesNewNoteEditorWE());
    }

    public boolean isDefaultTitleCorrect(Users user) {
        String titleValue = notesTitle.getEnteredText();
        String expectedValue = user.getApplUserFullName() + "'s untitled note";
        log.info("entered to title text is: " + titleValue);
        if (titleValue.equals(expectedValue)) {
            return true;
        }
        else {
            log.info("but expected is: " + expectedValue);
            return false;
        }
    }

    public boolean isOrgCorrect(Users user) {
        String orgValue = notesOrg.getText();
        String expectedValue = user.getApplUserOrg();
        log.info("displayed Org: " + orgValue);
        if (orgValue.equals(expectedValue)) {
            return true;
        }
        else {
            log.info("but expected is: " + expectedValue);
            return false;
        }
    }

    public boolean isAddedByCorrect(Users user) {
        String addedByValue = notesAddedBy.getText();
        String expectedValue = user.getApplUsername();
        log.info("displayed Added By is: " + addedByValue);
        if (addedByValue.equals(expectedValue)) {
            return true;
        }
        else {
            log.info("but expected is: " + expectedValue);
            return false;
        }
    }

    public boolean isCreatedDateCorrect() {
        String createdValue = notesCreated.getText();
        String expectedValue = currentRunTime;
        log.info("'Created' is displayed as: " + createdValue);
        log.info("page was opened at: " + expectedValue);
        createdValue = createdValue.substring(0, 16);
        expectedValue = expectedValue.substring(0, 16);
        if (createdValue.equals(expectedValue)) {
            return true;
        }
        else {
            log.info("created [" + createdValue + "] does not equal to expected [" + expectedValue + "]");
            return false;
        }

    }


}
