package precisionFDA.pages.files;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.FilesLocators;
import precisionFDA.pages.AbstractPage;

public class FilesMyFilesPage extends AbstractPage {

    @FindBy(xpath = FilesLocators.FILES_MY_FILES_ACTIVATED_LINK)
    private Link filesMyFilesActivatedLink;

    public FilesMyFilesPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_ADD_FILES_BUTTON_LINK));
    }

    public Link getFilesMyFilesActivatedLink() {
        return filesMyFilesActivatedLink;
    }

    public boolean isMyFilesLinkActivated() {
        Link link = getFilesMyFilesActivatedLink();
        waitUntilClickable(link);
        return isElementPresent(link);
    }

}
