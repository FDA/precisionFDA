package precisionFDA.pages.challs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.ChallsLocators;
import precisionFDA.pages.AbstractPage;

public class ChallsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ChallsLocators.CHALLS_PREV_CHALLS_TEXT)
    private WebElement challsPrevChallsText;

    @FindBy(xpath = ChallsLocators.CHALLS_ACTIVATED_ICON)
    private Link challsActivatedIconLink;

    public ChallsPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ChallsLocators.CHALLS_PREV_CHALLS_TEXT));
    }

    public WebElement getChallsPrevChallsText() {
        return challsPrevChallsText;
    }

    public Link getChallsActivatedIconLink() {
        return challsActivatedIconLink;
    }

    public boolean isChallengesIconDisplayed() {
        return isElementPresent(getChallsActivatedIconLink());
    }


}
