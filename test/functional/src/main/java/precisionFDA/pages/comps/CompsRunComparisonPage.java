package precisionFDA.pages.comps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.CompsLocators;
import precisionFDA.pages.AbstractPage;

public class CompsRunComparisonPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = CompsLocators.COMPS_RUN_COMP_CIRCLE_WITH_WE)
    private WebElement compsRunCompCirceWithWE;

    public CompsRunComparisonPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(CompsLocators.COMPS_RUN_COMP_CIRCLE_WITH_WE));
    }

    public WebElement getCompsRunCompCircleWithWE() {
        return compsRunCompCirceWithWE;
    }

    public boolean isCircleWithDisplayed() {
        return isElementPresent(getCompsRunCompCircleWithWE());
    }


}
