package staging.pages.overview;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.NotesLocators;
import staging.locators.OverviewLocators;
import staging.pages.AbstractPage;
import staging.pages.notes.NotesExplorePage;
import staging.pages.notes.NotesFeaturedPage;
import staging.pages.notes.NotesMyNotesPage;
import staging.pages.notes.NotesNewNotePage;

public class OverviewPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = OverviewLocators.OVERVIEW_WELCOME_TEXT)
    private WebElement overviewWelcomeText;


    public OverviewPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(OverviewLocators.OVERVIEW_WELCOME_TEXT));
    }

    public WebElement getOverviewWelcomeText() {
        return overviewWelcomeText;
    }


}
