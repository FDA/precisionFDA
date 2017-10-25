package staging.pages.notes;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.NotesLocators;
import staging.pages.AbstractPage;

import java.util.List;

import static staging.data.TestVariables.*;

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

    @FindBy(xpath = NotesLocators.NOTES_LIST_FIRST_NOTE_TITLE)
    private WebElement notesListFirstNoteTitle;

    @FindBy(xpath = NotesLocators.NOTES_LIST_FIRST_NOTE_USER_DATA)
    private WebElement notesListFirstNoteUserData;

    @FindBy(xpath = NotesLocators.NOTES_LIST_FIRST_NOTE_CREATED)
    private WebElement notesListFirstNoteCreated;

    @FindBy(xpath = NotesLocators.NOTES_LIST_SUCCESS_MESSAGE)
    private WebElement notesSuccessMessageWE;

    public NotesPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(NotesLocators.NOTES_PAGINATION_AREA));
    }

    public Link getNotesMyNotesLink() {
        return notesMyNotesLink;
    }

    public WebElement getNotesListFirstNoteTitle() {
        return notesListFirstNoteTitle;
    }

    public WebElement getNotesListFirstNoteUserData() {
        return notesListFirstNoteUserData;
    }

    public WebElement getNotesListFirstNoteCreated() {
        return notesListFirstNoteCreated;
    }

    public NotesMyNotesPage openNotesMyNotesPage() {
        log.info("open Notes.MyNotes page");
        notesMyNotesLink.click();
        return new NotesMyNotesPage(getDriver());
    }

    public NotesFeaturedPage openNotesFeaturedPage() {
        log.info("open Notes.Featured page");
        notesFeaturedLink.click();
        return new NotesFeaturedPage(getDriver());
    }

    public NotesExplorePage openNotesExplorePage() {
        log.info("open Notes.Explore page");
        notesExploreLink.click();
        return new NotesExplorePage(getDriver());
    }

    public NotesEditNotePage openNotesNewNotePage() {
        log.info("open Notes.NewNote page");
        notesNewNoteLink.click();
        setNoteCreateTimeUTC();
        return new NotesEditNotePage(getDriver());
    }

    public boolean isMyNotesLinkDisplayed() {
        return isElementPresent(getNotesMyNotesLink());
    }

    public String getFirstNoteTitleText() {
        return getNotesListFirstNoteTitle().getText();
    }

    public String getFirstNoteUserDataText() {
        return getNotesListFirstNoteUserData().getText();
    }

    public String getFirstNoteUserName() {
        return getFirstNoteUserDataText().split("/")[1];
    }

    public String getFirstNoteUserOrg() {
        return getFirstNoteUserDataText().split("/")[0];
    }

    public String getFirstNoteCreatedText() {
        return getNotesListFirstNoteCreated().getText();
    }

    public String getExpCreated() {
        return getNoteCreateTimeUTC().substring(0, 16);
    }

    public WebElement getCreatedNoteLink() {
        WebElement noteLink = null;
        List<WebElement> allLinks = getDriver().findElements(By.xpath(NotesLocators.NOTES_LIST_ANY_NOTE_LINK));
        for (WebElement we : allLinks) {
            if (we.getText().contains(getGeneratedNoteTitle())) {
                noteLink = we;
                break;
            }
        }
        return noteLink;
    }

    public WebElement getCreatedToDeleteNoteLink() {
        WebElement noteLink = null;
        List<WebElement> allLinks = getDriver().findElements(By.xpath(NotesLocators.NOTES_LIST_ANY_NOTE_LINK));
        for (WebElement we : allLinks) {
            if (we.getText().contains(getGeneratedNoteToDeleteTitle())) {
                noteLink = we;
                break;
            }
        }
        return noteLink;
    }

    public boolean isLinkToCreatedNoteDisplayed() {
        return isElementPresent(getCreatedNoteLink());
    }

    public boolean isLinkToCreatedToDeleteNoteDisplayed() {
        WebElement link = getCreatedToDeleteNoteLink();
        if (link != null) {
            return isElementPresent(getCreatedToDeleteNoteLink());
        }
        else {
            return false;
        }
    }

    public NotesSavedNotePage openCreatedNote() {
        log.info("open created note");
        getCreatedNoteLink().click();
        return new NotesSavedNotePage(getDriver());
    }

    public NotesSavedNotePage openCreatedToDeleteNote() {
        log.info("open created note");
        getCreatedToDeleteNoteLink().click();
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

    public String getExpectedNoteToDeleteTitleText() {
        return getGeneratedNoteToDeleteTitle();
    }
}
