package precisionFDA.pages.licenses;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.LicensesLocators;
import precisionFDA.pages.AbstractPage;

public class LicensesPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = LicensesLocators.LICENSE_CREATE_NEW_LINK)
    private Link licenseCreateNewLink;

    public LicensesPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(LicensesLocators.LICENSE_CREATE_NEW_LINK));
    }

    public Link getLicenseCreateNewLink() {
        return licenseCreateNewLink;
    }

    public boolean isCreateNewLicenseDisplayed() {
        return isElementPresent(getLicenseCreateNewLink());
    }

}
