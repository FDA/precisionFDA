package precisionFDA.pages.notes;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.data.TestCommonData;
import precisionFDA.locators.NotesLocators;
import precisionFDA.model.NoteProfile;
import precisionFDA.pages.AbstractPage;

import java.util.List;

import static precisionFDA.utils.Utils.sleep;

public class NotesPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = NotesLocators.NOTES_MY_NOTES_LINK)
    private Link notesMyNotesLink;

    @FindBy(xpath = NotesLocators.NOTES_FEATURED_LINK)
    private Link notesFeaturedLink;

    @FindBy(xpath = NotesLocators.NOTES_EXPLORE_LINK)
    private Link notesExploreLink;

    @FindBy(xpath = NotesLocators.NOTES_NEW_NOTE_LINK)
    private Link notesNewNoteLink;

    @FindBy(xpath = NotesLocators.NOTES_LIST_SUCCESS_MESSAGE)
    private WebElement notesSuccessMessageWE;

    @FindBy(xpath = NotesLocators.NOTES_LIST_FIRST_NOTE_CREATED)
    private WebElement firstNoteCreatedWE;

    public NotesPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(NotesLocators.NOTES_NEW_NOTE_LINK), 30);
    }

    public Link getNotesMyNotesLink() {
        return notesMyNotesLink;
    }

    public Link getNotesFeaturedLink() {
        return notesFeaturedLink;
    }

    public Link getNotesExploreLink() {
        return notesExploreLink;
    }

    public Link getNotesNewNoteLink() {
        return notesNewNoteLink;
    }

    public WebElement getFirstNoteCreatedWE() {
        return firstNoteCreatedWE;
    }

    public String getFirstNoteCreatedText() {
        return getFirstNoteCreatedWE().getText();
    }

    public NotesMyNotesPage openNotesMyNotesPage() {
        log.info("open Notes.MyNotes page");
        getNotesMyNotesLink().click();
        return new NotesMyNotesPage(getDriver());
    }

    public NotesFeaturedPage openNotesFeaturedPage() {
        log.info("open Notes.Featured page");
        getNotesFeaturedLink().click();
        return new NotesFeaturedPage(getDriver());
    }

    public NotesExplorePage openNotesExplorePage() {
        log.info("open Notes.Explore page");
        getNotesExploreLink().click();
        return new NotesExplorePage(getDriver());
    }

    public NotesEditNotePage openNewNote() {
        log.info("open Notes.NewNote page");
        sleep(1000);
        getNotesNewNoteLink().click();
        return new NotesEditNotePage(getDriver());
    }

    public NotesEditNotePage openNewNoteSaveTime(NoteProfile noteProfile) {
        log.info("open Notes.NewNote page");
        sleep(1000);
        getNotesNewNoteLink().click();
        noteProfile.setNoteCreatedText(TestCommonData.getCurrentTimezone());
        return new NotesEditNotePage(getDriver());
    }

    public boolean isMyNotesLinkDisplayed() {
        return isElementPresent(getNotesMyNotesLink());
    }

    public WebElement getCreatedNoteLink(NoteProfile noteProfile) {
        WebElement noteLink = null;
        List<WebElement> allLinks = getDriver().findElements(By.xpath(NotesLocators.NOTES_LIST_ANY_NOTE_LINK));
        for (WebElement we : allLinks) {
            if (we.getText().contains(noteProfile.getNoteTitleText())) {
                noteLink = we;
                break;
            }
        }
        return noteLink;
    }

    public boolean isLinkToCreatedNoteDisplayed(NoteProfile noteProfile) {
        WebElement createdNoteLink = getCreatedNoteLink(noteProfile);
        if (createdNoteLink == null) {
            return false;
        }
        else {
            return isElementPresent(createdNoteLink);
        }
    }

    public NotesSavedNotePage openCreatedNote(NoteProfile noteProfile) {
        log.info("open created note");
        getCreatedNoteLink(noteProfile).click();
        return new NotesSavedNotePage(getDriver());
    }

    public WebElement getNotesSuccessMessageWE() {
        return notesSuccessMessageWE;
    }

    public String getNotesSuccessMessageText() {
        return getNotesSuccessMessageWE().getText();
    }

    public boolean isNotesSuccessMessageDisplayed() {
        return isElementPresent(getNotesSuccessMessageWE());
    }



}
