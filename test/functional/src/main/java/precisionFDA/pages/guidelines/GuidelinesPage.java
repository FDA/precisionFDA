package precisionFDA.pages.guidelines;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.GuidelinesLocators;
import precisionFDA.pages.AbstractPage;

public class GuidelinesPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = GuidelinesLocators.GUIDELINES_CAROUSEL)
    private WebElement guidelinesCarousel;

    public GuidelinesPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(GuidelinesLocators.GUIDELINES_CAROUSEL));
    }

    public WebElement getGuidelinesCarousel() {
        return guidelinesCarousel;
    }

    public boolean isGuidelinesCarouselDisplayed() {
        return isElementPresent(getGuidelinesCarousel());
    }


}
