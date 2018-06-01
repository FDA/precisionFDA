package precisionFDA.pages.platform;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.PlatformLocators;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.TextInput;

public class PlatformPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = PlatformLocators.LOGIN_PASSWORD_INPUT)
    private TextInput loginPasswordInput;

    @FindBy(xpath = PlatformLocators.PROJECTS_LINK)
    private WebElement projectsLink;

    public PlatformPage(final WebDriver driver) {
        super(driver);
        // waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(PlatformLocators.PLATFORM_LOGGED_OR_LOGOUT), 30);
    }

    public TextInput getLoginPasswordInput() {
        return loginPasswordInput;
    }

    public WebElement getProjectsLink() {
        return projectsLink;
    }

    public Boolean isLoginPasswordInputDisplayed() {
        return isElementPresent(getLoginPasswordInput(), 1);
    }

    public Boolean isProjectsLinkDisplayed() {
        return isElementPresent(getProjectsLink(), 1);
    }
}