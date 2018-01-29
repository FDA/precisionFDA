package precisionFDA.pages.login;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import precisionFDA.locators.GrantAccessLoginLocators;
import precisionFDA.pages.AbstractPage;
import precisionFDA.pages.overview.OverviewPage;

public class GrantAccessLoginPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = GrantAccessLoginLocators.GRANT_ACCESS_BUTTON)
    private Button grantAccessButton;

    public Button getGrantAccessButton() {
        return grantAccessButton;
    }

    public GrantAccessLoginPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(GrantAccessLoginLocators.GRANT_ACCESS_BUTTON));
    }

    public OverviewPage grantAccess() {
        log.info("grant access");
        getGrantAccessButton().click();
        return new OverviewPage(getDriver());
    }




}
