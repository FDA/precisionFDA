package staging.pages.login;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Button;
import staging.locators.GrantAccessLoginLocators;
import staging.pages.AbstractPage;
import staging.pages.overview.OverviewPage;

public class GrantAccessLoginPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = GrantAccessLoginLocators.GrantAccessButton)
    private Button grantAccessButton;

    public GrantAccessLoginPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(GrantAccessLoginLocators.GrantAccessButton));
    }

    public OverviewPage grantAccess() {
        log.info("grant access");
        grantAccessButton.click();
        return new OverviewPage(getDriver());
    }




}
