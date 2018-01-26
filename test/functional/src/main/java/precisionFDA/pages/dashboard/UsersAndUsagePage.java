package precisionFDA.pages.dashboard;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.data.TestUserData;
import precisionFDA.locators.DashboardLocators;
import precisionFDA.pages.AbstractPage;

import static precisionFDA.data.TestCommonData.getPathToDownloadsFolder;
import static precisionFDA.data.TestCommonData.getUsersAndUsageFileName;
import static precisionFDA.utils.Utils.doesFileContainText;
import static precisionFDA.utils.Utils.isFileDownloaded;
import static precisionFDA.utils.Utils.waitUntilFileIsDownloaded;

public class UsersAndUsagePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = DashboardLocators.USERS_AND_USAGE_EXPORT_TO_CSV_BUTTON)
    private WebElement exportToCSVButton;

    public UsersAndUsagePage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(DashboardLocators.USERS_AND_USAGE_CURRENT_STORAGE_COLUMN_LINK));
    }

    public WebElement getExportToCSVButton() {
        return exportToCSVButton;
    }

    public boolean isUsersAndUsageExportCSVDisplayed() {
        return isElementPresent(getExportToCSVButton(), 5);
    }

    public void exportToCSV() {
        getExportToCSVButton().click();
    }

    public void waitUntilUsersAndUsageFileIsDownloaded() {
        waitUntilFileIsDownloaded(getUsersAndUsageFileName());
    }

    public boolean isUsersAndUsageFileDownloaded() {
        return isFileDownloaded(getUsersAndUsageFileName());
    }

    public boolean isUsersAndUsageFileCorrect() {
        String[] expectedArray = {
                TestUserData.getTestUserTwo().getApplUsername(),
                TestUserData.getTestUserOne().getApplUsername(),
                TestUserData.getAdminUser().getApplUsername(),
                "User,Current storage usage,Compute in past day,Compute in past week,Compute in past month,Compute in past year"};

        boolean contains;
        boolean flag = true;

        for (int i = 0; i <= expectedArray.length - 1; i ++) {
            contains = doesFileContainText(getPathToDownloadsFolder() + getUsersAndUsageFileName(), expectedArray[i]);
            if (!contains) {
                log.warn("the Users&Usage file does not contain expected string: " + expectedArray[i]);
                flag = false;
            }
        }
        return flag;
    }

}
