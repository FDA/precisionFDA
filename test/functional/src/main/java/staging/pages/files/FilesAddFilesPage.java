package staging.pages.files;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import staging.locators.FilesLocators;
import staging.pages.AbstractPage;

public class FilesAddFilesPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = FilesLocators.FILES_BROWSE_FILES_INPUT)
    private WebElement filesBrowseFilesInput;

    public FilesAddFilesPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_BROWSE_FILES_INPUT));
    }

    public WebElement getFilesBrowseFilesInput() {
        return filesBrowseFilesInput;
    }


}
