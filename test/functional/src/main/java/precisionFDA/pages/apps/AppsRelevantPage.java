package precisionFDA.pages.apps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.AppsLocators;
import precisionFDA.model.AppProfile;
import precisionFDA.pages.AbstractPage;

public class AppsRelevantPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AppsLocators.APPS_JOBS_LIST)
    private WebElement appsJobsList;

    @FindBy(xpath = AppsLocators.APPS_RELEVANT_ACTIVATED_LINK)
    private Link appsRelevantActivatedLink;

    public AppsRelevantPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(AppsLocators.APPS_JOBS_LIST));
    }

    public WebElement getAppsJobsListWE() {
        return appsJobsList;
    }

    public Link getAppsRelevantActivatedLink() {
        return appsRelevantActivatedLink;
    }

    public WebElement getSavedAppLink(AppProfile appProfile) {
        String xpath = AppsLocators.APPS_SAVED_APP_LINK_TEMPLATE.replace("{APP_TITLE}", appProfile.getCurRevTitleText());
        return getDriver().findElement(By.xpath(xpath));
    }

    public boolean isJobsListDisplayed() {
        return isElementPresent(getAppsJobsListWE());
    }

    public boolean isRelevantLinkActivated() {
        return isElementPresent(getAppsRelevantActivatedLink());
    }

    public AppsSavedAppPage openSavedAppl(AppProfile appProfile) {
        log.info("open saved application");
        WebElement link = getSavedAppLink(appProfile);
        waitUntilClickable(link);
        link.click();
        return new AppsSavedAppPage(getDriver());
    }

    public boolean isLinkToSavedAppDisplayed(AppProfile appProfile) {
        return isElementPresent(getSavedAppLink(appProfile));
    }
}
