package precisionFDA.pages.dashboard;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import precisionFDA.data.TestUserData;
import precisionFDA.locators.DashboardLocators;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Link;

import static precisionFDA.data.TestCommonData.*;
import static precisionFDA.utils.Utils.*;

public class AdminDashboardPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = DashboardLocators.ACTIVE_USERS_LINK)
    private Link activeUsersLink;

    @FindBy(xpath = DashboardLocators.ACTIVITY_REPORTS_LINK)
    private Link activityReportsLink;

    @FindBy(xpath = DashboardLocators.USERS_AND_USAGE_LINK)
    private Link usersAndUsageLink;

    public AdminDashboardPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(DashboardLocators.SITE_ACTIVITY_TITLE));
    }

    public Link getActivityReportsLink() {
        return activityReportsLink;
    }

    public Link getActiveUsersLink() {
        return activeUsersLink;
    }

    public Link getUsersAndUsageLink() {
        return usersAndUsageLink;
    }

    public void clickActiveUsers() {
        log.info("click Active Users");
        waitUntilDisplayed(getActiveUsersLink(), 2);
        getActiveUsersLink().click();
        sleep(500);
    }

    public boolean isActiveUsersLinkDisplayed() {
        return isElementPresent(getActiveUsersLink(), 5);
    }

    public boolean isUsersAndUsageLinkDisplayed() {
        return isElementPresent(getUsersAndUsageLink(), 5);
    }

    public boolean isActivityReportsLinkDisplayed() {
        return isElementPresent(getActivityReportsLink(), 5);
    }

    public void waitUntilActiveUsersFileIsDownloaded() {
        waitUntilFileIsDownloaded(getActiveUsersFileName());
    }

    public boolean isActiveUsersFileCorrect() {
        String[] expectedArray = {TestUserData.getTestUserTwo().getApplUsername(),
                TestUserData.getTestUserOne().getApplUsername(),
                "id", "first_name", "last_name", "email", "created_at", "last_login"};

        boolean contains;
        boolean flag = true;

        for (int i = 0; i <= expectedArray.length - 1; i ++) {
            contains = doesFileContainText(getPathToDownloadsFolder() + getActiveUsersFileName(), expectedArray[i]);
            if (!contains) {
                log.warn("the Active Users file does not contain expected string: " + expectedArray[i]);
                flag = false;
            }
        }
        return flag;
    }

    public boolean isActiveUsersFileDownloaded() {
        return isFileDownloaded(getActiveUsersFileName());
    }

    public ActivityReportsPage clickActivityReports() {
        log.info("click Activity Reports");
        isElementPresent(getActivityReportsLink(), 5);
        getActivityReportsLink().click();
        return new ActivityReportsPage(getDriver());
    }

    public UsersAndUsagePage clickUsersAndUsageLink() {
        log.info("click Users&Usage");
        isElementPresent(getUsersAndUsageLink(), 5);
        getUsersAndUsageLink().click();
        return new UsersAndUsagePage(getDriver());
    }

}
