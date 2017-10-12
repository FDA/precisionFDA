package staging.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.CommonLocators;
import staging.locators.MainLocators;
import staging.pages.login.LoginPage;

public class CommonPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = CommonLocators.MAIN_LOGO)
    private Link mainLogoLink;

    public CommonPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(CommonLocators.MAIN_LOGO), 30);
    }

    public PrecisionFDAPage openPrecisionFDAPage() {
        mainLogoLink.click();
        return new PrecisionFDAPage(getDriver());
    }

}
