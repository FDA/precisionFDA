package precisionFDA.pages.spaces;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
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
        // waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(SpacesLocators.SPACES_HOST_LEAD_COLUMN));
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

    public WebElement getSpaceNameLink(String spaceName) {
        String xpath = SpacesLocators.SPACES_NAME_TEMPLATE.replace("{SPACE_NAME}", spaceName);
        WebElement we = getDriver().findElement(By.xpath(xpath));
        return we;
    }

    public boolean isCreatedSpaceNameDisplayed(String name) {
        WebElement we = getSpaceNameLink(name);
        return isElementPresent(we, 2);
    }

    public boolean isCreatedSpaceDescrDisplayed(String descr) {
        String xpath = SpacesLocators.SPACES_DESCR_TEMPLATE.replace("{SPACE_DESCR}", descr);
        WebElement we = getDriver().findElement(By.xpath(xpath));
        return isElementPresent(we, 2);
    }

    public SpaceDetailsPage openSpace(String spaceName) {
        log.info("Open space");
        WebElement link = getSpaceNameLink(spaceName);
        waitUntilClickable(link, 2);
        link.click();
        return new SpaceDetailsPage(getDriver());
    }

    public String getSpaceStatusOnGrid(String spaceName) {
        String xpath = SpacesLocators.SPACES_SPASE_STATUS_ON_GRID_TEMPLATE.replace("{SPACE_NAME}", spaceName);
        WebElement we = findElement(By.xpath(xpath));
        return we.getText().trim();
    }


}
