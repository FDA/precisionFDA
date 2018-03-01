package precisionFDA.pages.files;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.FilesLocators;
import precisionFDA.pages.AbstractPage;

public class FilesAuthURLPage extends AbstractPage {

    @FindBy(xpath = FilesLocators.FILES_UPLOADED_AUTHURL_PAGE_URL)
    private WebElement authUrlWE;

    public FilesAuthURLPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_UPLOADED_AUTHURL_PAGE_TITLE));
    }

    public WebElement getAuthUrlWE() {
        return authUrlWE;
    }

    public String getAuthUrlText() {
        return getAuthUrlWE().getText().replace("'", "").replace("\"", "");
    }

    public boolean isAuthorizedUrlDisplayed() {
        return isElementPresent(getAuthUrlWE(), 2);
    }





}
