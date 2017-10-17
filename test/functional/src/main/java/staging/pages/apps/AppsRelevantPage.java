package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.data.TestConstants;
import staging.locators.AppsLocators;
import staging.pages.AbstractPage;

public class AppsRelevantPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    final String appTitle = TestConstants.CREATE_APP_TITLE_PREFIX + testRunUniqueFinalValue;

    @FindBy(xpath = AppsLocators.APPS_JOBS_LIST)
    private WebElement appsJobsList;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_ACTIVATED_LINK)
    private Link appsRelevantActivatedLink;

    public AppsRelevantPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_JOBS_LIST));
    }

    public WebElement getAppsJobsListWE() {
        return appsJobsList;
    }

    public Link getAppsRelevantActivatedLink() {
        return appsRelevantActivatedLink;
    }

    public WebElement getSavedAppLink() {
        String xpath = AppsLocators.APPS_SAVED_APP_LINK_TEMPLATE.replace("{APP_TITLE}", appTitle);
        return getDriver().findElement(By.xpath(xpath));
    }

    public boolean isJobsListDisplayed() {
        return isElementPresent(getAppsJobsListWE());
    }

    public boolean isRelevantLinkActivated() {
        return isElementPresent(getAppsRelevantActivatedLink());
    }

    public AppsSavedAppPage openSavedAppl() {
        log.info("open saved application");
        getSavedAppLink().click();
        return new AppsSavedAppPage(getDriver());
    }
}
