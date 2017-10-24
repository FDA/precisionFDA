package staging.pages.notes;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.locators.NotesLocators;
import staging.model.Users;
import staging.pages.AbstractPage;

import static staging.data.TestVariables.getNoteCreateTimeUTC;
import static staging.utils.Utils.areTheyEqual;
import static staging.utils.Utils.doesContain;

public class NotesNewNotePage extends AbstractPage {

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
        return areTheyEqual(titleValue, expectedValue);
    }

    public boolean isOrgCorrect(Users user) {
        String orgValue = notesOrg.getText();
        String expectedValue = user.getApplUserOrg();
        return areTheyEqual(orgValue, expectedValue);
    }

    public boolean isAddedByCorrect(Users user) {
        String addedByValue = notesAddedBy.getText();
        String expectedValue = user.getApplUsername();
        return areTheyEqual(addedByValue, expectedValue);
    }

    public boolean isCreatedDateCorrect() {
        String createdValue = notesCreated.getText();
        String expectedValue = getNoteCreateTimeUTC().substring(0, 16);
        return doesContain(createdValue, expectedValue);
    }

    public String getEnteredTitle() {
        return notesTitle.getEnteredText();
    }

    public String getExpectedTitle(Users user) {
        return user.getApplUserFullName() + "'s untitled note";
    }

}
