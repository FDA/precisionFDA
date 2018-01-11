package precisionFDA.pages.notes;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.TextInput;
import precisionFDA.data.TestUserData;
import precisionFDA.locators.CommonLocators;
import precisionFDA.locators.NotesLocators;
import precisionFDA.model.NoteProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.AbstractPage;

import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

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

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_EDITOR_ENTERED_TEXT)
    private WebElement notesEditNoteEnteredText;

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_PREVIEW_TAB_LINK)
    private Link notesEditNotePreviewTabLink;

    @FindBy(xpath = NotesLocators.NOTES_EDIT_NOTE_PREVIEW_AREA)
    private WebElement notesEditNotePreviewAreaWE;

    public NotesEditNotePage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(NotesLocators.NOTES_EDIT_NOTE_EDITOR_VISIBLE_DIV), 10);
    }

    public UserProfile getUser() {
        return TestUserData.getTestUserOne();
    }

    public WebElement getNotesEditNoteEnteredTextWe() {
        return notesEditNoteEnteredText;
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

    public Link getNotesSaveButton() {
        return notesSaveButton;
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

    public WebElement getNotesCreated() {
        return notesCreated;
    }

    public String getCreatedText() {
        return getNotesCreated().getText();
    }

    public boolean isEditorDisplayed() {
        return isElementPresent(getNotesEditNoteVisibleEditorEl());
    }

    public String getEnteredTitleText() {
        return getNotesTitleEl().getEnteredText();
    }

    public String getEnteredBodyText() {
        return getNotesEditNoteEnteredTextWe().getText().replace("\n", "").replace("\r", "");
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

    public NotesPage openNotesPage() {
        log.info("opening Notes page");
        notesPageIcon.click();
        return new NotesPage(getDriver());
    }

    public NotesEditNotePage fillAndSaveNote(NoteProfile noteProfile) {
        fillTitle(noteProfile.getNoteTitleText());
        fillNoteText(noteProfile.getNoteRawText());
        clickSave();
        return new NotesEditNotePage(getDriver());
    }

    public void fillTitle(String title) {
        log.info("fill title");
        getNotesTitleEl().clear();
        getNotesTitleEl().sendKeys(title);
    }

    public void fillNoteText(String rowText) {
        log.info("fill note text");
        getNotesEditNoteEditorWE().clear();
        getNotesEditNoteEditorWE().sendKeys(rowText);
    }

    public NotesEditNotePage clickSave() {
        log.info("click Save");
        getNotesSaveButton().click();
        return new NotesEditNotePage(getDriver());
    }

    public NotesEditNotePage editNoteWithNewDataAndSave(NoteProfile noteProfile) {
        log.info("edit and save the note");

        String salt = getRunTimeLocalUniqueValue();
        String newTitle = noteProfile.getNoteTitleText() + " upd " + salt;
        String newRowBody = noteProfile.getNoteRawText() + " upd " + salt;
        String newRichBody = noteProfile.getNoteRichText() + " upd " + salt;

        noteProfile.setNoteTitleText(newTitle);
        noteProfile.setNoteRawText(newRowBody);
        noteProfile.setNoteRichText(newRichBody);

        getNotesTitleEl().clear();
        getNotesTitleEl().sendKeys(newTitle);

        getNotesEditNoteEditorWE().clear();
        getNotesEditNoteEditorWE().sendKeys(newRowBody);

        getNotesSaveButton().click();
        return new NotesEditNotePage(getDriver());
    }

    public void editNoteTitleWithNewValue(NoteProfile noteProfile) {
        log.info("edit note title with new data");
        getNotesTitleEl().clear();
        getNotesTitleEl().sendKeys(noteProfile.getNoteTitleText() + " upd " + getRunTimeLocalUniqueValue());
    }

    public void editNoteTextWithNewValue(NoteProfile noteProfile) {
        log.info("edit note text with new data");
        getNotesEditNoteEditorWE().clear();
        getNotesEditNoteEditorWE().sendKeys(noteProfile.getNoteRawText() + " upd " + getRunTimeLocalUniqueValue());
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
