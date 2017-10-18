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

import static staging.data.TestConstants.getAppJobName;
import static staging.data.TestConstants.getAppTitle;

public class AppsJobPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AppsLocators.APPS_JOB_PAGE_I_O_TAB_LINK)
    private Link appsJobPageIOTabLink;

    @FindBy(xpath = AppsLocators.APPS_JOB_PAGE_JOB_NAME)
    private WebElement appsJobPageJobName;

    @FindBy(xpath = AppsLocators.APPS_JOB_PAGE_APP_TITLE_LINK)
    private Link appsJobPageAppTitleLink;

    @FindBy(xpath = AppsLocators.APPS_JOB_PAGE_LAUNCHED_BY_LINK)
    private Link appsJobPageLaunchedByLink;

    @FindBy(xpath = AppsLocators.APPS_JOB_PAGE_CREATED)
    private WebElement appsJobPageCreated;

    @FindBy(xpath = AppsLocators.APPS_JOB_PAGE_RUNNING_JOB_LABEL)
    private WebElement appsJobPageRunningJobLabel;

    @FindBy(xpath = AppsLocators.APPS_JOB_PAGE_VIEW_LOG_LINK)
    private Link appsJobPageViewLogLink;

    public AppsJobPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_JOB_PAGE_I_O_TAB_LINK));
    }

    public WebElement getAppsJobPageJobName() {
        return appsJobPageJobName;
    }

    public Link getAppsJobPageAppTitleLink() {
        return appsJobPageAppTitleLink;
    }

    public Link getAppsJobPageLaunchedByLink() {
        return appsJobPageLaunchedByLink;
    }

    public WebElement getAppsJobPageCreated() {
        return appsJobPageCreated;
    }

    public Link getAppsJobPageViewLogLink() {
        return appsJobPageViewLogLink;
    }

    public boolean isJobNameCorrect() {
        String expected = getAppJobName();
        String actual = getAppsJobPageJobName().getText();
        return equals(actual, expected);
    }

    public boolean isAppTitleCorrect() {
        String expected = getAppTitle();
        String actual = getAppsJobPageAppTitleLink().getText();
        return contains(actual, expected);
    }

    public boolean isLaunchedByCorrect() {
        String expected = Users.getTestUser().getApplUsername();
        String actual = getAppsJobPageLaunchedByLink().getText();
        return contains(actual, expected);
    }

    public boolean isCreatedCorrect() {
        String expected = jobRunTimeUTC.substring(0, 16);
        String actual = getAppsJobPageCreated().getText();
        return contains(actual, expected);
    }

    public WebElement getAppsJobPageRunningJobLabel() {
        return appsJobPageRunningJobLabel;
    }

    public AppsJobPage waitUntilJobIsDone() {
        int timeoutSec = 300;
        int refreshStepSec = 15;
        int spentTimeSec = 0;
        log.info("waiting for " + timeoutSec + " sec until job status is Done");
        while ( !isJobStatusDone() && (spentTimeSec < timeoutSec) ) {
            sleep(refreshStepSec*1000);
            spentTimeSec = spentTimeSec + refreshStepSec;
            log.info("it's been " + spentTimeSec + " seconds");
            getDriver().navigate().refresh();
        }
        if (!isJobStatusDone()) {
            log.info("[WARNING] the running job is not DONE after " + timeoutSec + " seconds");
        }
        return new AppsJobPage(getDriver());
    }

    public boolean isJobLabelDone() {
        return getAppsJobPageRunningJobLabel().getText().trim().equalsIgnoreCase("DONE");
    }

    public boolean isJobStatusDone() {
        return isJobLabelDone();
    }

    public AppsJobLogPage viewLog() {
        getAppsJobPageViewLogLink().click();
        return new AppsJobLogPage(getDriver());
    }





}
