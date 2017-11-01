package staging.pages.profile;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.ui.ExpectedConditions;
import ru.yandex.qatools.htmlelements.element.Select;
import staging.data.TestRunData;
import staging.locators.ProfileLocators;
import staging.pages.AbstractPage;

public class ProfilePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ProfileLocators.PROFILE_ABOUT_YOUR_ORG_TEXT)
    private WebElement profileAboutOrgWE;

    @FindBy(xpath = ProfileLocators.PROFILE_TIMEZONE_SELECT)
    private Select profileTimeZoneSelect;

    public ProfilePage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(ProfileLocators.PROFILE_ABOUT_YOUR_ORG_TEXT));
    }

    public WebElement getProfileAboutOrgWE() {
        return profileAboutOrgWE;
    }

    public Select getProfileTimeZoneSelect() {
        return profileTimeZoneSelect;
    }

    public boolean isAboutOrgTextDisplayed() {
        return isElementPresent(getProfileAboutOrgWE());
    }

    public ProfilePage setTimeZone(String[] timeZone) {
        log.info("select timezone: " + timeZone[1]);
        isElementPresent(getProfileTimeZoneSelect());
        sleep(500);
        getProfileTimeZoneSelect().selectByVisibleText(timeZone[1]);
        TestRunData.setCurrentTimezone(timeZone[0]);
        return new ProfilePage(getDriver());
    }

    public String getSelectedTimeZone() {
        return getProfileTimeZoneSelect().getFirstSelectedOption().getText();
    }

}
