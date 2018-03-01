package precisionFDA.pages.notes;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.data.TestCommonData;
import precisionFDA.data.TestUserData;
import precisionFDA.locators.NotesLocators;
import precisionFDA.model.NoteProfile;
import precisionFDA.model.UserProfile;
import precisionFDA.pages.AbstractPage;

import static precisionFDA.data.TestNotesData.getNoteCommentText;

public class NotesSavedNotePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = NotesLocators.NOTES_SAVED_NOTE_TITLE)
    private WebElement notesSavedNoteTitle;

    @FindBy(xpath = NotesLocators.NOTES_SAVED_NOTE_ORG)
    private WebElement notesSavedNoteOrg;

    @FindBy(xpath = NotesLocators.NOTES_SAVED_NOTE_CREATED)
    private WebElement notesSavedNoteCreated;

    @FindBy(xpath = NotesLocators.NOTES_SAVED_NOTE_ADDED_BY)
    private WebElement notesSavedNoteAddedBy;

    @FindBy(xpath = NotesLocators.NOTES_SAVED_NOTE_BODY_TEXT)
    private WebElement notesSavedNoteBodyWE;

    @FindBy(xpath = NotesLocators.NOTES_SAVED_NOTE_EDIT_DD)
    private WebElement notesSavedNoteEditDD;

    @FindBy(xpath = NotesLocators.NOTES_SAVED_NOTE_DD_DELETE)
    private Link notesSavedNoteDeleteItem;

    @FindBy(xpath = NotesLocators.NOTES_SAVED_NOTE_EDIT_BUTTON)
    private Link notesSavedNoteEditButton;

    @FindBy(xpath = NotesLocators.NOTES_SAVED_NOTE_COMMENT_AREA)
    private WebElement notesSavedNoteCommentAreaWE;

    @FindBy(xpath = NotesLocators.NOTES_SAVED_NOTE_COMMENT_SUBMIT_BUTTON)
    private Button notesSavedNoteCommentSubmitButton;

    @FindBy(xpath = NotesLocators.NOTES_SAVED_NOTE_FIRST_COMMENT)
    private WebElement notesSavedNoteFirstCommentWE;

    @FindBy(xpath = NotesLocators.NOTES_SUBMITTED_COMMENT_TIME)
    private WebElement notesSubmittedCommentTimeWE;

    public NotesSavedNotePage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(NotesLocators.NOTES_SAVED_NOTE_BODY_TEXT));
    }

    public UserProfile getUser() {
        return TestUserData.getTestUserOne();
    }

    //----------

    public WebElement getSavedNoteTitleWE() {
        return notesSavedNoteTitle;
    }

    public String getSavedNoteTitleText() {
        return getSavedNoteTitleWE().getText();
    }

    //----------

    public WebElement getSavedNoteAddedByWE() {
        return notesSavedNoteAddedBy;
    }

    public String getExpAddedByText() {
        return getUser().getApplUsername();
    }

    public String getSavedNoteAddedByText() {
        return getSavedNoteAddedByWE().getText();
    }

    //----------

    public WebElement getSavedNoteCreatedWE() {
        return notesSavedNoteCreated;
    }

    public String getSavedNoteCreatedText() {
        return getSavedNoteCreatedWE().getText();
    }

    //----------

    public WebElement getSavedNoteOrgWE() {
        return notesSavedNoteOrg;
    }

    public String getSavedNoteOrgText() {
        return getSavedNoteOrgWE().getText();
    }

    public String getExpOrgText() {
        return getUser().getApplUserOrg();
    }

    //----------

    public WebElement getNotesSavedNoteBodyWE() {
        return notesSavedNoteBodyWE;
    }

    public String getSavedNoteBodyText() {
        return getNotesSavedNoteBodyWE().getText();
    }

    //----------

    public WebElement getNotesSavedNoteEditDD() {
        return notesSavedNoteEditDD;
    }

    public Link getNotesSavedNoteDeleteItem() {
        return notesSavedNoteDeleteItem;
    }

    //----------

    public Link getNotesSavedNoteEditButton() {
        return notesSavedNoteEditButton;
    }

    //----------

    public WebElement getNotesSavedNoteCommentAreaWE() {
        return notesSavedNoteCommentAreaWE;
    }

    public Button getNotesSavedNoteCommentSubmitButton() {
        return notesSavedNoteCommentSubmitButton;
    }

    public WebElement getNotesSavedNoteFirstCommentWE() {
        return notesSavedNoteFirstCommentWE;
    }

    public String getNotesSavedNoteFirstCommentText() {
        return getNotesSavedNoteFirstCommentWE().getText();
    }

    public WebElement getNotesSubmittedCommentTimeWE() {
        return notesSubmittedCommentTimeWE;
    }

    public String getSubmittedCommentTimeText() {
        return getNotesSubmittedCommentTimeWE().getText();
    }

    //----------

    public NotesPage deleteNote() {
        log.info("delete note");
        getNotesSavedNoteEditDD().click();
        waitUntilDisplayed(By.xpath(NotesLocators.NOTES_SAVED_NOTE_DD_DELETE));
        getNotesSavedNoteDeleteItem().click();
        alertAccept(1, 100);
        return new NotesPage(getDriver());
    }

    public NotesEditNotePage openNoteForEdit() {
        log.info("open Note to edit");
        getNotesSavedNoteEditButton().click();
        return new NotesEditNotePage(getDriver());
    }

    public NotesSavedNotePage leaveComment() {
        log.info("write and save comment");
        getNotesSavedNoteCommentAreaWE().sendKeys(getNoteCommentText());
        getNotesSavedNoteCommentSubmitButton().click();
        return new NotesSavedNotePage(getDriver());
    }

    public NotesSavedNotePage leaveCommentSaveTime(NoteProfile noteProfile) {
        log.info("write and save comment");
        getNotesSavedNoteCommentAreaWE().sendKeys(getNoteCommentText());
        getNotesSavedNoteCommentSubmitButton().click();
        noteProfile.setCommentCreatedText(TestCommonData.getCurrentTimezone());
        return new NotesSavedNotePage(getDriver());
    }

    public String getExpectedCommentText() {
        return getNoteCommentText();
    }

}
