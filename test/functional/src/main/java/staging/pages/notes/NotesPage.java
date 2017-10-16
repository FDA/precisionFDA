package staging.pages.notes;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.NotesLocators;
import staging.pages.AbstractPage;

import static staging.utils.Utils.getCurrentDateTime;

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


    public NotesPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(NotesLocators.NOTES_PAGINATION_AREA));
    }

    public Link getNotesMyNotesLink() {
        return notesMyNotesLink;
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

    public NotesNewNotePage openNotesNewNotePage() {
        log.info("open Notes.NewNote page");
        notesNewNoteLink.click();
        currentRunTime = getCurrentDateTime();
        return new NotesNewNotePage(getDriver());
    }

    public boolean isMyNotesLinkDisplayed() {
        return isElementPresent(getNotesMyNotesLink());
    }

}
