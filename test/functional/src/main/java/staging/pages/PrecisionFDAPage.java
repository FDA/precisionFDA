package staging.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.CommonLocators;
import staging.locators.PrecisionFDALocators;
import staging.utils.Utils;

public class PrecisionFDAPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = PrecisionFDALocators.FDANavigationPanel)
    private WebElement FDANavigationPanel;

    @FindBy(xpath = PrecisionFDALocators.FDALoggedUsernameLink)
    private Link FDALoggedUsernameLink;

    @FindBy(xpath = CommonLocators.APPS_PAGE_ICON)
    private Link appsPageIcon;

    public PrecisionFDAPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(PrecisionFDALocators.FDANavigationPanel), 30);
    }

    public WebElement getNavigationPanelWE() {
        return FDANavigationPanel;
    }

    public Link getUsernameLink() {
        return FDALoggedUsernameLink;
    }

    public AppsPage openAppsPage() {
        log.info("opening Apps page");
        appsPageIcon.click();
        return new AppsPage(getDriver());
    }


}
