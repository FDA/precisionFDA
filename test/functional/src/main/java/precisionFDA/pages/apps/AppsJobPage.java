package precisionFDA.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.AppsLocators;
import precisionFDA.pages.AbstractPage;

import static precisionFDA.data.TestDict.getDictDone;
import static precisionFDA.data.TestDict.getDictFail;
import static precisionFDA.utils.Utils.sleep;

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

    @FindBy(xpath = AppsLocators.APPS_JOB_RUN_OUTPUT_RESULT)
    private WebElement appsJobRunOutputResult;

    public AppsJobPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_JOB_PAGE_I_O_TAB_LINK));
        sleep(getPageSleep());
    }

    public WebElement getAppsJobPageJobName() {
        return appsJobPageJobName;
    }

    public Link getAppsJobPageViewLogLink() {
        return appsJobPageViewLogLink;
    }

    public Link getAppsJobPageIOTabLink() {
        return appsJobPageIOTabLink;
    }

    public String getActJobName() {
        return getAppsJobPageJobName().getText();
    }

    public WebElement getAppsJobPageRunningJobLabel() {
        return appsJobPageRunningJobLabel;
    }

    public WebElement getAppsJobRunOutputResultWe() {
        return appsJobRunOutputResult;
    }

    public String getAppsJobRunOutputResultText() {
        String output = getAppsJobRunOutputResultWe().getText();
        log.info("Output result is: " + output);
        return output.trim();
    }

    public boolean isJobLabelDone() {
        return getAppsJobPageRunningJobLabel().getText().trim().equalsIgnoreCase(getDictDone());
    }

    public String getJobLabelValue() {
        return getAppsJobPageRunningJobLabel().getText();
    }

    public boolean isJobStatusDone() {
        return isJobLabelDone();
    }

    public AppsJobPage waitUntilJobFinished() {
        int timeoutSec = 300;
        int refreshStepSec = 15;
        String doneStatus = getDictDone().toUpperCase();
        String failedStatus = getDictFail().toUpperCase();

        log.info("waiting for " + timeoutSec + " sec until job status is finished");

        String currentStatus;
        for (int spentTimeSec = 0; spentTimeSec <= timeoutSec; spentTimeSec += refreshStepSec) {
            currentStatus = getJobLabelValue().toUpperCase();
            log.info("current job status: " + currentStatus);
            if (currentStatus.contains(doneStatus) || currentStatus.contains(failedStatus)) {
                break;
            }
            else {
                sleep(refreshStepSec*1000);
                log.info("it's been " + ( spentTimeSec + refreshStepSec ) + " seconds");
                getDriver().navigate().refresh();
            }
        }
        if (!isJobStatusDone()) {
            log.warn("the running job is not DONE after " + timeoutSec + " seconds");
        }

        return new AppsJobPage(getDriver());
    }

    public AppsJobLogPage viewLog() {
        log.info("view job log");
        getAppsJobPageViewLogLink().click();
        return new AppsJobLogPage(getDriver());
    }

    public boolean isAppsJobPageIOTabLinkDisplayed() {
        return isElementPresent(getAppsJobPageIOTabLink(), 5);
    }

}
