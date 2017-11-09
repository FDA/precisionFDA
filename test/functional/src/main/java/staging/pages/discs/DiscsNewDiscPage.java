package staging.pages.discs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import staging.locators.DiscsLocators;
import staging.locators.NotesLocators;
import staging.pages.AbstractPage;

public class DiscsNewDiscPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = DiscsLocators.DISCS_NEW_DISC_EDITOR_AREA)
    private WebElement discsNewDiscEditorWE;

    public DiscsNewDiscPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(NotesLocators.NOTES_EDIT_NOTE_EDIT_TAB));
    }

    public WebElement getDiscsNewDiscEditorWE() {
        return discsNewDiscEditorWE;
    }

    public boolean isEditorDisplayed() {
        return isElementPresent(getDiscsNewDiscEditorWE());
    }

}
