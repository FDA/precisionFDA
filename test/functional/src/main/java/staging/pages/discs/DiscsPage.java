package staging.pages.discs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.DiscsLocators;
import staging.pages.AbstractPage;

public class DiscsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = DiscsLocators.DISCS_START_DISCS_LINK)
    private Link discsStartDiscLink;


    public DiscsPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(DiscsLocators.DISCS_START_DISCS_LINK));
    }

    public Link getDiscsStartDiscLink() {
        return discsStartDiscLink;
    }

    public DiscsNewDiscPage openNewDiscPage() {
        log.info("open Discussions.NewDiscussion page");
        discsStartDiscLink.click();
        return new DiscsNewDiscPage(getDriver());
    }

    public boolean isStartDiscsButtonDisplayed() {
        return isElementPresent(getDiscsStartDiscLink());
    }

}
