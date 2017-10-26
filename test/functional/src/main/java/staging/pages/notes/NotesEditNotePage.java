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

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_EDITOR_AREA)
    private WebElement notesEditNoteEditorWE;

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_EDIT_TAB)
    private WebElement notesEditNoteEditTabWE;

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

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_BACK_BUTTON)
    private Link notesBackButton;

    @FindBy(xpath = CommonLocators.NOTES_PAGE_ICON)
    private Link notesPageIcon;

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_EDITOR_VISIBLE_DIV)
    private WebElement notesEditNoteVisibleEditor;

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_PREVIEW_TAB_LINK)
    private Link notesEditNotePreviewTabLink;

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_PREVIEW_AREA)
    private WebElement notesEditNotePreviewAreaWE;

    public NotesEditNotePage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(NotesLocators.NOTES_EDIT_NOTE_EDITOR_VISIBLE_DIV), 10);
    }

    public Users getUser() {
        return Users.getTestUser();
    }

    public WebElement getNotesEditNoteEditorWE() {
        return notesEditNoteEditorWE;
    }

    public TextInput getNotesTitleEl() {
        return notesTitle;
    }

    public WebElement getNotesOrgEl() {
        return notesOrg;
    }

    public WebElement getNotesAddedByEl() {
        return notesAddedBy;
    }

    public WebElement getNotesCreatedEl() {
        return notesCreated;
    }

    public Link getNotesSaveButton() {
        return notesSaveButton;
    }

    public Link getNotesBackButton() {
        return notesBackButton;
    }

    public Link getNotesPageIcon() {
        return notesPageIcon;
    }

    public WebElement getNotesEditNoteEditTabWE() {
        return notesEditNoteEditTabWE;
    }

    public Link getNotesEditNotePreviewTabLink() {
        return notesEditNotePreviewTabLink;
    }

    public WebElement getNotesEditNoteVisibleEditorEl() {
        return notesEditNoteVisibleEditor;
    }

    public WebElement getNotesEditNotePreviewAreaWE() {
        return notesEditNotePreviewAreaWE;
    }

    public boolean isEditorDisplayed() {
        return isElementPresent(getNotesEditNoteVisibleEditorEl());
    }

    public String getEnteredTitleText() {
        return getNotesTitleEl().getEnteredText();
    }

    public String getEnteredBodyText() {
        return getNotesEditNoteVisibleEditorEl().getText();
    }

    public String getExpectedDefaultTitle() {
        return getUser().getApplUserFullName() + "'s untitled note";
    }

    public String getActOrgText() {
        return getNotesOrgEl().getText();
    }

    public String getExpOrgText() {
        return getUser().getApplUserOrg();
    }

    public String getActAddedByText() {
        return getNotesAddedByEl().getText();
    }

    public String getExpAddedByText() {
        return getUser().getApplUsername();
    }

    public String getActCreatedText() {
        return getNotesCreatedEl().getText();
    }

    public String getExpCreatedText() {
        return getNoteCreateTimeUTC().substring(0, 16);
    }

    public String getExpectedEditedNoteTitleText() {
        return getGeneratedNoteTitle();
    }

    public String getExpectedNoteRichText() {
        return getNewNoteRichText();
    }

    public String getExpectedNoteRowText() {
        return getNewNoteRowText();
    }

    public void fillNewNoteTextArea() {
        getNotesEditNoteEditorWE().sendKeys(getNewNoteRowText());
    }

    public void fillNewNoteTitleField() {
        getNotesTitleEl().clear();
        getNotesTitleEl().sendKeys(getGeneratedNoteTitle());
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
        getNotesTitleEl().clear();
        getNotesTitleEl().sendKeys(getGeneratedNoteToDeleteTitle());
        getNotesEditNoteEditorWE().sendKeys(getNewNoteRowText());
        getNotesSaveButton().click();
        return new NotesEditNotePage(getDriver());
    }

    public NotesEditNotePage fillAndSaveNoteToEdit() {
        log.info("fill and save a note form");
        getNotesTitleEl().clear();
        getNotesTitleEl().sendKeys(getGeneratedNoteToEditTitle());
        getNotesEditNoteEditorWE().sendKeys(getGeneratedNoteToEditRowBody());
        getNotesSaveButton().click();
        return new NotesEditNotePage(getDriver());
    }

    public NotesEditNotePage editNoteWithNewDataAndSave() {
        log.info("edit and save the note");

        setIsNoteTitleEditedFlag(true);
        setIsNoteBodyEditedFlag(true);

        getNotesTitleEl().clear();
        getNotesTitleEl().sendKeys(getGeneratedNoteTitle());

        getNotesEditNoteEditorWE().clear();
        getNotesEditNoteEditorWE().sendKeys(getNewNoteRowText());

        getNotesSaveButton().click();
        return new NotesEditNotePage(getDriver());
    }

    public void editNoteButNotSave() {
        log.info("edit note");

        getNotesTitleEl().clear();
        getNotesTitleEl().sendKeys(getAdditionalEditPartString() + getGeneratedNoteToEditTitle());

        getNotesEditNoteEditorWE().clear();
        getNotesEditNoteEditorWE().sendKeys(getAdditionalEditPartString() + getGeneratedNoteToEditRowBody());
    }

    public NotesEditNotePage openPreviewTab() {
        log.info("open preview tab");
        getNotesEditNotePreviewTabLink().click();
        waitUntilDisplayed(getNotesEditNotePreviewAreaWE());
        return new NotesEditNotePage(getDriver());
    }

    public String getNotePreviewBodyText() {
        return getNotesEditNotePreviewAreaWE().getText();
    }

    public NotesSavedNotePage clickBack() {
        log.info("click Back");
        notesBackButton.click();
        return new NotesSavedNotePage(getDriver());
    }
}
