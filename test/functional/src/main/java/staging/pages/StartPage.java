package staging.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.CommonLocators;
import staging.locators.StartLocators;
import staging.model.ExpertProfile;

import java.util.List;

public class StartPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = StartLocators.START_LOGIN_LINK)
    private Link startLoginLink;

    @FindBy(xpath = CommonLocators.COMMON_NAV_PANEL)
    private WebElement commonNavigationPanel;

    @FindBy(xpath = StartLocators.START_SUCCESS_MESSAGE_AREA)
    private WebElement startSuccessMessageArea;

    public StartPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(StartLocators.START_LOGIN_LINK), 30);
    }

    public boolean isNavigationPanelDisplayed() {
        return isElementPresent(getNavigationPanelWE(), 2);
    }

    public WebElement getNavigationPanelWE() {
        return commonNavigationPanel;
    }

    public WebElement getStartSuccessMessageArea() {
        return startSuccessMessageArea;
    }

    public String getMessageAreaText() {
        return getStartSuccessMessageArea().getText();
    }

    public boolean isCreatedExpertPrefNameDisplayed(ExpertProfile expertProfile) {
        if (getCreatedExpertWE(expertProfile) == null) {
            return false;
        }
        else {
            return isElementPresent(getCreatedExpertWE(expertProfile), 2);
        }
    }

    public WebElement getCreatedExpertWE(ExpertProfile expertProfile) {
        WebElement prefName = null;
        List<WebElement> allNames = getDriver().findElements(By.xpath(StartLocators.START_COMMON_EXPERT_PREF_NAMES));
        for (WebElement we : allNames) {
            if (we.getText().contains(expertProfile.getExpertPreferredName())) {
                prefName = we;
                break;
            }
        }
        return prefName;
    }



}
