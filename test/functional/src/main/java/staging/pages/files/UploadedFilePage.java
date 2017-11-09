package staging.pages.files;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.data.TestUserData;
import staging.locators.FilesLocators;
import staging.model.User;
import staging.pages.AbstractPage;

import static staging.data.TestDict.getDictPrivate;

public class UploadedFilePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = FilesLocators.FILES_DOWNLOAD_FILE_LINK)
    private Link downloadFileLink;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_PAGE_TITLE)
    private WebElement filePageTitle;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_ADDED_BY)
    private Link addedByLink;

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_FILE_ACCESS_VALUE)
    private WebElement uploadedFileAccessValue;

    User getTestUser() {
        return TestUserData.getTestUser();
    }

    public UploadedFilePage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_UPLOADED_FILE_ACCESS_VALUE));
    }

    public Link getDownloadFileLink() {
        return downloadFileLink;
    }

    public WebElement getFilePageTitle() {
        return filePageTitle;
    }

    public Link getAddedByLink() {
        return addedByLink;
    }

    public WebElement getUploadedFileAccessValueWE() {
        return uploadedFileAccessValue;
    }

    public String getAddedByText() {
        return getAddedByLink().getText();
    }

    public String getUploadedFileAccessValueText() {
        return getUploadedFileAccessValueWE().getText();
    }

    public boolean isPageTitleCorrect(String fileName) {
        String actTitle = getFilePageTitle().getText();
        if (actTitle.contains(fileName)) {
            return true;
        }
        else {
            log.info("page title is: " + actTitle);
            return false;
        }
    }

    public boolean isAddedByCorrect() {
        String actAddedBy = getAddedByText();
        String expAddedBy = getTestUser().getApplUsername();
        if (actAddedBy.equals(expAddedBy)) {
            return true;
        }
        else {
            log.info("displayed is [" + actAddedBy + "] but expected [" + expAddedBy + "]");
            return false;
        }
    }

    public boolean isAccessPrivate() {
        String actValue = getUploadedFileAccessValueText();
        if (actValue.equalsIgnoreCase(getDictPrivate())) {
            return true;
        }
        else {
            log.info("displayed access is [" + actValue + "] but expected [" + getDictPrivate());
            return false;
        }
    }

    public boolean isDownloadFileLinkDisplayed() {
        UploadedFilePage uploadedFilePage = waitUntilDownloadFileLinkIsDisplayed();
        return isElementPresent(getDownloadFileLink());
    }

    public UploadedFilePage waitUntilDownloadFileLinkIsDisplayed() {
        int timeoutSec = 60;
        int refreshStepSec = 5;
        int spentTimeSec = 0;
        while ( !isElementPresent(getDownloadFileLink(), 1) && (spentTimeSec < timeoutSec) ) {
            sleep(refreshStepSec*1000);
            spentTimeSec = spentTimeSec + refreshStepSec;
            getDriver().navigate().refresh();
        }
        return new UploadedFilePage(getDriver());
    }


}
