package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.data.TestConstants;
import staging.locators.AppsLocators;
import staging.model.Users;
import staging.pages.AbstractPage;

public class AppsSavedAppPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    final String appName = TestConstants.CREATE_APP_NAME_PREFIX + testRunUniqueFinalValue;
    final String appTitle = TestConstants.CREATE_APP_TITLE_PREFIX + testRunUniqueFinalValue;

    @FindBy(xpath = AppsLocators.APPS_JOBS_LIST)
    private WebElement appsJobsList;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_SELECTED_APP_NAME)
    private WebElement appsRelevantSelectedAppName;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_SELECTED_APP_TITLE)
    private WebElement appsRelevantSelectedAppTitle;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_SELECTED_APP_ORG)
    private WebElement appsRelevantSelectedAppOrg;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_SELECTED_APP_ADDED_BY)
    private WebElement appsRelevantSelectedAppAddedBy;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_SELECTED_APP_CREATED)
    private WebElement appsRelevantSelectedAppCreated;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_RUN_APP_BUTTON)
    private Link appsSavedAppRunAppButton;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_REVISION)
    private WebElement appsSavedAppRevisionWE;

    @FindBy(xpath = AppsLocators.APPS_SAVED_APP_EDIT_BUTTON)
    private Link appsSavedAppEditButtonLink;

    public AppsSavedAppPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_SAVED_APP_RUN_APP_BUTTON));
    }

    public WebElement getAppsJobsListWE() {
        return appsJobsList;
    }

    public boolean isJobsListDisplayed() {
        return isElementPresent(getAppsJobsListWE());
    }

    public WebElement getAppsRelevantSelectedAppName() {
        return appsRelevantSelectedAppName;
    }

    public WebElement getAppsRelevantSelectedAppOrg() {
        return appsRelevantSelectedAppOrg;
    }

    public WebElement getAppsRelevantSelectedAppAddedBy() {
        return appsRelevantSelectedAppAddedBy;
    }

    public WebElement getAppsRelevantSelectedAppCreated() {
        return appsRelevantSelectedAppCreated;
    }

    public WebElement getAppsRelevantSelectedAppTitle() {
        return appsRelevantSelectedAppTitle;
    }

    public Link getAppsSavedAppRunAppButton() {
        return appsSavedAppRunAppButton;
    }

    public Link getAppsSavedAppEditButtonLink() {
        return appsSavedAppEditButtonLink;
    }

    public WebElement getAppsSavedAppRevisionWE() {
        return appsSavedAppRevisionWE;
    }

    public boolean isSelectedAppNameCorrect() {
        String expected = appName.replace(":", "").replace(" ", "-");
        log.info("expected name is: " + expected);
        String actual = getAppsRelevantSelectedAppName().getText();
        if (expected.equals(actual)) {
            return true;
        }
        else {
            log.info("but actual is: " + actual);
            return false;
        }
    }

    public boolean isSelectedAppOrgCorrect() {
        String expected = Users.getTestUser().getApplUserOrg();
        log.info("expected Org is: " + expected);
        String actual = getAppsRelevantSelectedAppOrg().getText();
        if (expected.equals(actual)) {
            return true;
        }
        else {
            log.info("but actual is: " + actual);
            return false;
        }
    }

    public boolean isSelectedAppAddedByCorrect() {
        String expected = Users.getTestUser().getApplUsername();
        log.info("expected Added By is: " + expected);
        String actual = getAppsRelevantSelectedAppAddedBy().getText();
        if (expected.equals(actual)) {
            return true;
        }
        else {
            log.info("but actual is: " + actual);
            return false;
        }
    }

    public boolean isCreatedDateCorrect() {
        String createdValue = getAppsRelevantSelectedAppCreated().getText();
        String expectedValue = currentTestRunTime;
        log.info("'Created' is displayed as: " + createdValue);
        log.info("page was actually created at: " + expectedValue);
        createdValue = createdValue.substring(0, 16);
        expectedValue = expectedValue.substring(0, 16);
        if (createdValue.equals(expectedValue)) {
            return true;
        }
        else {
            log.info("created [" + createdValue + "] does not equal to expected [" + expectedValue + "]");
            return false;
        }
    }

    public boolean isSelectedAppTitleCorrect() {
        String expected = appTitle;
        log.info("expected Title is: " + expected);
        String actual = getAppsRelevantSelectedAppTitle().getText();
        if (expected.equals(actual)) {
            return true;
        }
        else {
            log.info("but actual is: " + actual);
            return false;
        }
    }

    public boolean isRunAppButtonDisplayed() {
        return isElementPresent(appsSavedAppRunAppButton);
    }

    public int getAppRevision() {
        String revision = getAppsSavedAppRevisionWE().getText();
        return Integer.parseInt(revision);
    }

    public AppsEditAppPage editSavedApp() {
        getAppsSavedAppEditButtonLink().click();
        return new AppsEditAppPage(getDriver());
    }


}
