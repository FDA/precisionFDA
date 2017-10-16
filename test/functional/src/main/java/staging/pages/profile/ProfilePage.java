package staging.pages.profile;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import staging.locators.ProfileLocators;
import staging.pages.AbstractPage;

public class ProfilePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ProfileLocators.PROFILE_ABOUT_YOUR_ORG_TEXT)
    private WebElement profileAboutOrgWE;

    public ProfilePage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(ProfileLocators.PROFILE_ABOUT_YOUR_ORG_TEXT));
    }

    public WebElement getProfileAboutOrgWE() {
        return profileAboutOrgWE;
    }

    public boolean isAboutOrgTextDisplayed() {
        return isElementPresent(getProfileAboutOrgWE());
    }

}
