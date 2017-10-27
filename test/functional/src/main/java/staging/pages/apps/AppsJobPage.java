package staging.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.AppsLocators;
import staging.pages.AbstractPage;

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

    public Link getAppsJobPageViewLogLink() {
        return appsJobPageViewLogLink;
    }

    public String getActJobName() {
        return getAppsJobPageJobName().getText();
    }

    public WebElement getAppsJobPageRunningJobLabel() {
        return appsJobPageRunningJobLabel;
    }

    public boolean isJobLabelDone() {
        return getAppsJobPageRunningJobLabel().getText().trim().equalsIgnoreCase("DONE");
    }

    public String getJobLabelValue() {
        return getAppsJobPageRunningJobLabel().getText();
    }

    public boolean isJobStatusDone() {
        return isJobLabelDone();
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

    public AppsJobLogPage viewLog() {
        log.info("view job log");
        getAppsJobPageViewLogLink().click();
        return new AppsJobLogPage(getDriver());
    }

}
