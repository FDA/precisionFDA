package staging.pages.files;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.FilesLocators;
import staging.pages.AbstractPage;

public class FilesMyFilesPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = FilesLocators.FILES_MY_FILES_ACTIVATED_LINK)
    private Link filesMyFilesActivatedLink;

    public FilesMyFilesPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(FilesLocators.FILES_ADD_FILES_LINK));
    }

    public Link getFilesMyFilesActivatedLink() {
        return filesMyFilesActivatedLink;
    }


}
