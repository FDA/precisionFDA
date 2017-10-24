package staging.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.CommonLocators;
import staging.locators.StartLocators;

public class StartPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = StartLocators.START_LOGIN_LINK)
    private Link startLoginLink;

    @FindBy(xpath = CommonLocators.COMMON_NAV_PANEL)
    private WebElement commonNavigationPanel;

    @FindBy(xpath = StartLocators.START_SUCCESS_MESSAGE_AREA)
    private WebElement startSuccessMessageArea;

    public StartPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(StartLocators.START_LOGIN_LINK), 30);
    }

    public boolean isNavigationPanelNotDisplayed() {
        return !isElementPresent(getNavigationPanelWE(), 2);
    }

    public boolean isNavigationPanelDisplayed() {
        return isElementPresent(getNavigationPanelWE(), 2);
    }

    public WebElement getNavigationPanelWE() {
        return commonNavigationPanel;
    }

    public WebElement getStartSuccessMessageArea() {
        return startSuccessMessageArea;
    }

    public boolean isLogoutMessageDisplayed() {
        String actualText = getStartSuccessMessageArea().getText();
        String expectedText = StartLocators.START_YOU_LOGGED_OUT_TEXT;
        return actualText.contains(expectedText);
    }

}
