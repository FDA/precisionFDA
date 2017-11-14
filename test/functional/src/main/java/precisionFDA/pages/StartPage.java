package precisionFDA.pages;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;

import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.CommonLocators;
import precisionFDA.locators.StartLocators;
import precisionFDA.model.ExpertProfile;

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
        waitUntilScriptsReady();
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

    public boolean isCreatedExpertBlogTitleDisplayed(ExpertProfile expertProfile) {
        if (getCreatedExpertBlogTitleWE(expertProfile) == null) {
            return false;
        }
        else {
            return isElementPresent(getCreatedExpertBlogTitleWE(expertProfile), 2);
        }
    }

    public WebElement getCreatedExpertBlogTitleWE(ExpertProfile expertProfile) {
        WebElement blogTitle = null;
        List<WebElement> allTitles = getDriver().findElements(By.xpath(StartLocators.START_COMMON_EXPERT_BLOG_TITLE));
        for (WebElement we : allTitles) {
            if (we.getText().contains(expertProfile.getExpertBlogTitle())) {
                blogTitle = we;
                break;
            }
        }
        return blogTitle;
    }



}
