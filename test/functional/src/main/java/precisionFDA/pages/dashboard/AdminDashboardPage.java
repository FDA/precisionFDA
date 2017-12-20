package precisionFDA.pages.dashboard;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import precisionFDA.data.TestUserData;
import precisionFDA.locators.DashboardLocators;
import precisionFDA.pages.AbstractPage;
import ru.yandex.qatools.htmlelements.element.Link;

import static precisionFDA.data.TestRunData.*;
import static precisionFDA.utils.Utils.*;

public class AdminDashboardPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = DashboardLocators.ACTIVE_USERS_LINK)
    private Link activeUsersLink;

    public AdminDashboardPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(DashboardLocators.SITE_ACTIVITY_TITLE));
    }

    public Link getActiveUsersLink() {
        return activeUsersLink;
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

    public void waitUntilActiveUsersFileIsDownloaded() {
        waitUntilFileIsDownloaded(getActiveUsersFileName());
    }

    public boolean isActiveUsersFileCorrect() {
        String[] expectedArray = {TestUserData.getAnotherTestUser().getApplUsername(),
                TestUserData.getTestUser().getApplUsername(),
                "id", "first_name", "last_name", "email", "created_at", "last_login"};

        boolean contains;
        boolean flag = true;

        for (int i = 0; i <= expectedArray.length - 1; i ++) {
            contains = isFileContainsText(getPathToDownloadsFolder() + getActiveUsersFileName(), expectedArray[i]);
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

}
