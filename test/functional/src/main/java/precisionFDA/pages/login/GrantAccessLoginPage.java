package precisionFDA.pages.login;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import precisionFDA.locators.GrantAccessLoginLocators;
import precisionFDA.pages.AbstractPage;
import precisionFDA.pages.overview.OverviewPage;

public class GrantAccessLoginPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = GrantAccessLoginLocators.GRANT_ACCESS_BUTTON)
    private Button grantAccessButton;

    @FindBy(xpath = GrantAccessLoginLocators.GUIDEINE_CAROUSEL)
    private WebElement guidelineCarousel;

    @FindBy(xpath = GrantAccessLoginLocators.GUIDEINE_CAROUSEL_NEXT_BUTTON)
    private WebElement guidelineCarouselNextButton;

    @FindBy(xpath = GrantAccessLoginLocators.GUIDEINE_CAROUSEL_PREV_BUTTON)
    private WebElement guidelineCarouselPrevButton;

    @FindBy(xpath = GrantAccessLoginLocators.GUIDEINE_CAROUSEL_AGREE_BUTTON)
    private WebElement guidelineCarouselAgreeButton;

    @FindBy(xpath = GrantAccessLoginLocators.CANCEL_GRANT_BUTTON)
    private WebElement cancelGrantButton;

    public GrantAccessLoginPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(GrantAccessLoginLocators.GRANT_ACCESS_BUTTON));
    }

    public WebElement getCancelGrantButton() {
        return cancelGrantButton;
    }

    public By getCancelGrantButtonBy() {
        return By.xpath(GrantAccessLoginLocators.CANCEL_GRANT_BUTTON);
    }

    public Button getGrantAccessButton() {
        return grantAccessButton;
    }

    public WebElement getGuidelineCarousel() {
        return guidelineCarousel;
    }

    public WebElement getGuidelineCarouselNextButton() {
        return guidelineCarouselNextButton;
    }

    public WebElement getGuidelineCarouselPrevButton() {
        return guidelineCarouselPrevButton;
    }

    public Boolean isGuidelineCarouselDisplayed() {
        return isElementPresent(getGuidelineCarousel(), 3);
    }

    public WebElement getGuidelineCarouselAgreeButton() {
        return guidelineCarouselAgreeButton;
    }

    public OverviewPage grantAccess() {
        log.info("grant access");
        getGrantAccessButton().click();
        waitUntilNotDisplayed(getCancelGrantButtonBy(), 120);
        if (isGuidelineCarouselDisplayed()) {
            log.info("agree with guideline");
            getGuidelineCarouselNextButton().click();
            isElementPresent(getGuidelineCarouselPrevButton(), 1);
            getGuidelineCarouselNextButton().click();
            isElementPresent(getGuidelineCarouselAgreeButton(), 1);
            getGuidelineCarouselAgreeButton().click();
        }
        return new OverviewPage(getDriver());
    }

}
