package staging.pages.Guidelines;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import staging.locators.GuidelinesLocators;
import staging.pages.AbstractPage;

public class GuidelinesPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = GuidelinesLocators.GUIDELINES_CAROUSEL)
    private WebElement guidelinesCarousel;

    public GuidelinesPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(GuidelinesLocators.GUIDELINES_MAIN_TITLE));
    }

    public WebElement getGuidelinesCarousel() {
        return guidelinesCarousel;
    }

    public boolean isGuidelinesCarouselDisplayed() {
        return isElementPresent(getGuidelinesCarousel());
    }


}
