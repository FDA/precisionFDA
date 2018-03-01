package precisionFDA.pages.discs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.DiscsLocators;
import precisionFDA.model.DiscProfile;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Link;

import static precisionFDA.utils.Utils.sleep;

public class CreatedDiscPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = DiscsLocators.DISCS_START_DISCS_LINK)
    private Link discsStartDiscLink;

    @FindBy(xpath = DiscsLocators.DISC_SAVED_PAGE_TITLE)
    private WebElement title;

    @FindBy(xpath = DiscsLocators.DISC_SAVED_PAGE_CONTENT)
    private WebElement content;

    @FindBy(xpath = DiscsLocators.EDIT_DISC_BUTTON_LINK)
    private Link editDiscLink;

    public CreatedDiscPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(DiscsLocators.EDIT_DISC_BUTTON_LINK));
    }

    public Link getEditDiscLink() {
        return editDiscLink;
    }

    public WebElement getTitleWE() {
        return title;
    }

    public WebElement getContentWE() {
        return content;
    }

    public String getTitleText() {
        String title = getTitleWE().getText().trim();
        log.info("Title: " + title);
        return title;
    }

    public String getContentText() {
        String content = getContentWE().getText().trim();
        log.info("Content: " + content);
        return content;
    }

    public boolean isSavedTitleCorrect(DiscProfile discProfile) {
        String actual = getTitleText();
        String expected = discProfile.getDiscName();
        boolean isCorrect = false;
        if (actual.equals(expected)) {
            log.info("title is correct one: " + actual);
            isCorrect = true;
        }
        else {
            log.warn("title is NOT correct one: actual is [" + actual + "] but expected is [" + expected + "]");
        }
        return isCorrect;
    }

    public boolean isSavedContentCorrect(DiscProfile discProfile) {
        String actual = getContentText();
        String expected = discProfile.getDiscRichDescr();
        boolean isCorrect = false;
        if (actual.equals(expected)) {
            log.info("content is correct one");
            isCorrect = true;
        }
        else {
            log.warn("content is NOT correct one: actual is [" + actual + "] but expected is [" + expected + "]");
        }
        return isCorrect;
    }

    public DiscsEditDiscPage clickEdit() {
        log.info("click Edit discussion");
        isElementPresent(getEditDiscLink(), 5);
        sleep(1000);
        getEditDiscLink().click();
        return new DiscsEditDiscPage(getDriver());
    }


}
