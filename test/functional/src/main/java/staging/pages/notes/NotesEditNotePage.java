package staging.pages.notes;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;
import staging.locators.CommonLocators;
import staging.locators.NotesLocators;
import staging.model.Users;
import staging.pages.AbstractPage;

import static staging.data.TestVariables.*;

public class NotesEditNotePage extends AbstractPage {

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

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_SAVE_BUTTON)
    private Link notesSaveButton;

    @FindBy(xpath = CommonLocators.NOTES_PAGE_ICON)
    private Link notesPageIcon;

    public NotesEditNotePage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(NotesLocators.NOTES_NEW_NOTE_EDIT_TAB));
    }

    public Users getUser() {
        return Users.getTestUser();
    }

    public WebElement getNotesNewNoteEditorWE() {
        return notesNewNoteEditorWE;
    }

    public TextInput getNotesTitle() {
        return notesTitle;
    }

    public WebElement getNotesOrg() {
        return notesOrg;
    }

    public WebElement getNotesAddedBy() {
        return notesAddedBy;
    }

    public WebElement getNotesCreated() {
        return notesCreated;
    }

    public Link getNotesSaveButton() {
        return notesSaveButton;
    }

    public Link getNotesPageIcon() {
        return notesPageIcon;
    }

    public WebElement getNotesNewNoteEditTabWE() {
        return notesNewNoteEditTabWE;
    }

    public boolean isEditorDisplayed() {
        return getNotesNewNoteEditorWE().isDisplayed();
    }

    public String getEnteredTitle() {
        return getNotesTitle().getEnteredText();
    }

    public String getExpectedDefaultTitle() {
        return getUser().getApplUserFullName() + "'s untitled note";
    }

    public String getActOrg() {
        return getNotesOrg().getText();
    }

    public String getExpOrg() {
        return getUser().getApplUserOrg();
    }

    public String getActAddedBy() {
        return getNotesAddedBy().getText();
    }

    public String getExpAddedBy() {
        return getUser().getApplUsername();
    }

    public String getActCreated() {
        return getNotesCreated().getText();
    }

    public String getExpCreated() {
        return getNoteCreateTimeUTC().substring(0, 16);
    }

    public String getExpectedEditedNoteTitle() {
        return getGeneratedNoteTitle();
    }

    public String getExpectedNoteRichText() {
        return getNewNoteRichText();
    }

    public void fillNoteTextArea() {
        getNotesNewNoteEditorWE().sendKeys(getNewNoteRowText());
    }

    public void fillNoteTitleField() {
        getNotesTitle().clear();
        getNotesTitle().sendKeys(getGeneratedNoteTitle());
    }

    public NotesEditNotePage saveNote() {
        log.info("save note");
        getNotesSaveButton().click();
        return new NotesEditNotePage(getDriver());
    }

    public NotesPage openNotesPage() {
        log.info("opening Notes page");
        notesPageIcon.click();
        return new NotesPage(getDriver());
    }

    public String getExpectedUsername() {
        return getUser().getApplUsername();
    }

    public String getCurrentOrg() {
        return getUser().getApplUserOrg();
    }

    public NotesEditNotePage fillAndSaveNoteToDelete() {
        log.info("fill and save a note form");
        getNotesTitle().clear();
        getNotesTitle().sendKeys(getGeneratedNoteToDeleteTitle());
        getNotesNewNoteEditorWE().sendKeys(getNewNoteRowText());
        getNotesSaveButton().click();
        return new NotesEditNotePage(getDriver());
    }
}
