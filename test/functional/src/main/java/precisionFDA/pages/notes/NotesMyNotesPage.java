package precisionFDA.pages.notes;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.NotesLocators;
import precisionFDA.pages.AbstractPage;

public class NotesMyNotesPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = NotesLocators.NOTES_MY_NOTES_ACTIVATED_LINK)
    private Link notesMyNotesActivatedLink;

    public NotesMyNotesPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(NotesLocators.NOTES_NEW_NOTE_LINK));
    }

    public Link getNotesMyNotesActivatedLink() {
        return notesMyNotesActivatedLink;
    }

    public boolean isMyNotesLinkActivated() {
        return isElementPresent(getNotesMyNotesActivatedLink());
    }


}
