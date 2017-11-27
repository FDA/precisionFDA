package precisionFDA.pages.spaces;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.SpacesLocators;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Link;

public class SpaceDetailsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = SpacesLocators.SPACE_DETAILS_MEMBERS_TAB_LINK)
    private Link editSpaceHostLeadInput;

    @FindBy(xpath = SpacesLocators.SPACE_DETAILS_ACCEPT_BY_GUEST_LEAD_LINK)
    private Link acceptByGuestLeadLink;

    @FindBy(xpath = SpacesLocators.SPACE_DETAILS_ACCEPT_BY_HOST_LEAD_LINK)
    private Link acceptByHostLeadLink;


    public SpaceDetailsPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(SpacesLocators.SPACE_DETAILS_MEMBERS_TAB_LINK));
    }

    public Link getAcceptByGuestLeadLink() {
        return acceptByGuestLeadLink;
    }

    public Link getAcceptByHostLeadLink() {
        return acceptByHostLeadLink;
    }

    public boolean isAcceptByHostLeadDisplayed() {
        return isElementPresent(acceptByHostLeadLink, 1);
    }

    public boolean isAcceptByGuestLeadDisplayed() {
        return isElementPresent(acceptByGuestLeadLink, 1);
    }

    public SpaceDetailsPage acceptByHostLead() {
        log.info("accept by Host Lead");
        Link link = getAcceptByHostLeadLink();
        link.click();
        return new SpaceDetailsPage(getDriver());
    }

    public SpaceDetailsPage acceptByGuestLead() {
        log.info("accept by Guest Lead");
        Link link = getAcceptByGuestLeadLink();
        link.click();
        return new SpaceDetailsPage(getDriver());
    }

}
