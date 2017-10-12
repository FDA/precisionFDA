package staging.pages.experts;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.ExpertsLocators;
import staging.locators.NotesLocators;
import staging.pages.AbstractPage;
import staging.pages.notes.NotesExplorePage;
import staging.pages.notes.NotesFeaturedPage;
import staging.pages.notes.NotesMyNotesPage;
import staging.pages.notes.NotesNewNotePage;

public class ExpertsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ExpertsLocators.EXPERTS_MAIN_DIV)
    private Link notesMyNotesLink;

    @FindBy(xpath = ExpertsLocators.EXPERTS_ACTIVATED_ICON)
    private Link expertsActivatedLink;


    public ExpertsPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(ExpertsLocators.EXPERTS_MAIN_DIV));
    }

    public Link getExpertsActivatedLink() {
        return expertsActivatedLink;
    }


}
