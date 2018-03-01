package precisionFDA.pages.discs;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.DiscsLocators;
import precisionFDA.pages.AbstractPage;

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

    public DiscsEditDiscPage openNewDiscPage() {
        log.info("open Discussions.NewDiscussion page");
        discsStartDiscLink.click();
        return new DiscsEditDiscPage(getDriver());
    }

    public boolean isStartDiscsButtonDisplayed() {
        return isElementPresent(getDiscsStartDiscLink());
    }

    public boolean isLinkToDiscussionDisplayed(String discName) {
        return isElementPresent(getCreatedDiscLinkBy(discName), 5);
    }

    public By getCreatedDiscLinkBy(String discName) {
        String xpath = DiscsLocators.SAVED_DISC_LINK_TEMPLATE.replace("{DISC_NAME}", discName);
        return By.xpath(xpath);
    }

    public CreatedDiscPage openCreatedDisc(String discName) {
        log.info("open discussion: " + discName);
        getDriver().findElement(getCreatedDiscLinkBy(discName)).click();
        return new CreatedDiscPage(getDriver());
    }

}
