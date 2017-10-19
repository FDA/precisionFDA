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
import staging.utils.Utils;

import static staging.data.TestConstants.*;

public class AppsSavedAppPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

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
        String expected = getAppName().replace(":", "").replace(" ", "-");
        String actual = getAppsRelevantSelectedAppName().getText();
        return Utils.equals(actual, expected);
    }

    public boolean isSelectedAppOrgCorrect() {
        String expected = Users.getTestUser().getApplUserOrg();
        String actual = getAppsRelevantSelectedAppOrg().getText();
        return Utils.equals(actual, expected);
    }

    public boolean isSelectedAppAddedByCorrect() {
        String expected = Users.getTestUser().getApplUsername();
        String actual = getAppsRelevantSelectedAppAddedBy().getText();
        return Utils.equals(actual, expected);
    }

    public boolean isCreatedDateCorrect() {
        String createdValue = getAppsRelevantSelectedAppCreated().getText();
        String expectedValue = appCreateTimeUTC.substring(0, 16);
        return Utils.contains(createdValue, expectedValue);
    }

    public boolean isSelectedAppTitleCorrect() {
        String actual = getAppsRelevantSelectedAppTitle().getText();
        return Utils.equals(actual, getAppTitle());
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

    public AppsEditAndRunAppPage runAppFromRelevantPage() {
        getAppsSavedAppRunAppButton().click();
        return new AppsEditAndRunAppPage(getDriver());
    }

    public boolean isRunJobDisplayed() {
        return isElementPresent(getRunJobLink());
    }

    public WebElement getRunJobLink() {
        String xpath = AppsLocators.APPS_SAVED_APP_JOB_LINK_TEMPLATE.replace("{JOB_NAME}", getAppJobName());
        return getDriver().findElement(By.xpath(xpath));
    }

    public AppsJobPage openJobFromSavedAppPage() {
        getRunJobLink().click();
        return new AppsJobPage(getDriver());
    }


}
