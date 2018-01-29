package precisionFDA.pages.notes;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;

import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.NotesLocators;
import precisionFDA.pages.AbstractPage;

public class NotesExplorePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = NotesLocators.NOTES_EXPLORE_ACTIVATED_LINK)
    private Link notesExploreActivatedLink;

    public NotesExplorePage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(NotesLocators.NOTES_NEW_NOTE_LINK));
    }

    public Link getNotesExploreActivatedLink() {
        return notesExploreActivatedLink;
    }

    public boolean isExploreLinkActivated() {
        return isElementPresent(getNotesExploreActivatedLink());
    }

}
