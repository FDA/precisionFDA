package precisionFDA.pages.spaces;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.SpacesLocators;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Link;

public class SpacesPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = SpacesLocators.PROVISION_SPACE_BUTTON_LINK)
    private Link provisionSpaceButtonLink;


    public SpacesPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(SpacesLocators.PROVISION_SPACE_BUTTON_LINK));
    }

    public Link getProvisionSpaceButtonLink() {
        return provisionSpaceButtonLink;
    }

    public EditSpacePage clickProvisionSpace() {
        log.info("click Provision Space");
        waitUntilClickable(getProvisionSpaceButtonLink());
        getProvisionSpaceButtonLink().click();
        return new EditSpacePage(getDriver());
    }

    public boolean isProvisionButtonDisplayed() {
        return isElementPresent(getProvisionSpaceButtonLink(), 2);
    }



}
