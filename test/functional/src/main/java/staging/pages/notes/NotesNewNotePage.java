package staging.pages.notes;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.NotesLocators;
import staging.pages.AbstractPage;

public class NotesNewNotePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = NotesLocators.NOTES_NEW_NOTE_EDITOR_AREA)
    private WebElement notesNewNoteEditorWE;

    @FindBy(xpath = NotesLocators.NOTES_NEW_NOTE_EDIT_TAB)
    private WebElement notesNewNoteEditTabWE;

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
        return getNotesNewNoteEditorWE().isDisplayed();
    }


}
