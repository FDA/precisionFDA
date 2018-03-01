package precisionFDA.pages.profile;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.locators.ProfileLocators;
import precisionFDA.pages.AbstractPage;

public class PublicProfilePage extends AbstractPage {

    @FindBy(xpath = ProfileLocators.PROFILE_PUBLIC_JOINED_TAG)
    private WebElement profileJoinedTextWE;

    public PublicProfilePage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ProfileLocators.PROFILE_PUBLIC_JOINED_TAG));
    }

    public WebElement getProfileJoinedTextWE() {
        return profileJoinedTextWE;
    }

    public boolean isJoinedTagDisplayed() {
        return isElementPresent(getProfileJoinedTextWE());
    }

}
