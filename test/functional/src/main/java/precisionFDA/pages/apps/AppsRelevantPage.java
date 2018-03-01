package precisionFDA.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.AppsLocators;
import precisionFDA.model.AppProfile;
import precisionFDA.pages.AbstractPage;

public class AppsRelevantPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AppsLocators.APPS_JOBS_LIST)
    private WebElement appsJobsList;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_ACTIVATED_LINK)
    private Link appsRelevantActivatedLink;

    public AppsRelevantPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_CREATE_APP_BUTTON_LINK));
    }

    public WebElement getAppsJobsListWE() {
        return appsJobsList;
    }

    public Link getAppsRelevantActivatedLink() {
        return appsRelevantActivatedLink;
    }

    public WebElement getMyAppsAppLink(AppProfile appProfile) {
        String xpath = AppsLocators.APPS_SAVED_APP_LINK_TEMPLATE.replace("{APP_TITLE}", appProfile.getCurRevTitleText());
        return getDriver().findElement(By.xpath(xpath));
    }

    public boolean isJobsListDisplayed() {
        return isElementPresent(getAppsJobsListWE());
    }

    public boolean isRelevantLinkActivated() {
        return isElementPresent(getAppsRelevantActivatedLink());
    }

    public AppsSavedAppPage openAppFromMyAppsList(AppProfile appProfile) {
        log.info("open saved application from My Apps list");
        WebElement link = getMyAppsAppLink(appProfile);
        waitUntilClickable(link);
        link.click();
        return new AppsSavedAppPage(getDriver());
    }

    public AppsSavedAppPage openAppFromJobsList(AppProfile appProfile) {
        log.info("open saved application from jobs list");
        WebElement link = getJobsListAppLink(appProfile);
        waitUntilClickable(link);
        link.click();
        return new AppsSavedAppPage(getDriver());
    }

    public AppsJobPage openJobFromJobsList(AppProfile appProfile) {
        log.info("open job from jobs list");
        WebElement link = getJobsListJobLink(appProfile);
        waitUntilClickable(link);
        link.click();
        return new AppsJobPage(getDriver());
    }

    public WebElement getJobsListAppLink(AppProfile appProfile) {
        String xpath = AppsLocators.APPS_JOBS_LIST_APP_LINK_TEMPLATE.replace("{APP_TITLE}", appProfile.getCurRevTitleText());
        return getDriver().findElement(By.xpath(xpath));
    }

    public WebElement getJobsListJobLink(AppProfile appProfile) {
        String xpath = AppsLocators.APPS_JOBS_LIST_JOB_LINK_TEMPLATE.replace("{JOB_NAME}", appProfile.getJobNameText());
        return getDriver().findElement(By.xpath(xpath));
    }

    public boolean isLinkToMyAppsAppDisplayed(AppProfile appProfile) {
        return isElementPresent(getMyAppsAppLink(appProfile), 5);
    }

    public boolean isLinkToJobsListAppDisplayed(AppProfile appProfile) {
        return isElementPresent(getJobsListAppLink(appProfile), 5);
    }

    public boolean isLinkToJobsListJobDisplayed(AppProfile appProfile) {
        return isElementPresent(getJobsListJobLink(appProfile), 5);
    }
}
