package staging.pages.notes;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.NotesLocators;
import staging.model.Users;
import staging.pages.AbstractPage;

import static staging.data.TestVariables.*;

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

    public NotesSavedNotePage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(NotesLocators.NOTES_SAVED_NOTE_BODY_TEXT));
    }

    public Users getUser() {
        return Users.getTestUser();
    }

    //----------

    public WebElement getSavedNoteTitleWE() {
        return notesSavedNoteTitle;
    }

    public String getSavedNoteTitleText() {
        return getSavedNoteTitleWE().getText();
    }

    public String getExpectedNoteEditedTitleText() {
        return getGeneratedNoteTitle();
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

    public String getExpCreatedText() {
        return getNoteCreateTimeUTC().substring(0, 16);
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

    public String getExpNoteBodyText() {
        return getNewNoteRichText();
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

    //----------

    public String getExpectedNoteToEditTitle() {
        return getGeneratedNoteToEditTitle();
    }

    public String getExpectedNoteToEditBody() {
        return getGeneratedNoteToEditRichBody();
    }

    //----------

    public NotesPage deleteNote() {
        log.info("delete note");
        getNotesSavedNoteEditDD().click();
        waitUntilDisplayed(By.xpath(NotesLocators.NOTES_SAVED_NOTE_DD_DELETE));
        getNotesSavedNoteDeleteItem().click();
        alertAccept();
        return new NotesPage(getDriver());
    }

    public NotesEditNotePage openNoteForEdit() {
        log.info("open Note edit form");
        getNotesSavedNoteEditButton().click();
        return new NotesEditNotePage(getDriver());
    }

    public NotesSavedNotePage leaveComment() {
        log.info("write and save comment");
        getNotesSavedNoteCommentAreaWE().sendKeys(getNoteCommentText());
        getNotesSavedNoteCommentSubmitButton().click();
        return new NotesSavedNotePage(getDriver());
    }

    public String getExpectedCommentText() {
        return getNoteCommentText();
    }
}
