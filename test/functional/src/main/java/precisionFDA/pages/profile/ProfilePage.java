package precisionFDA.pages.profile;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import precisionFDA.model.TimeZoneProfile;
import ru.yandex.qatools.htmlelements.element.Link;
import ru.yandex.qatools.htmlelements.element.Select;
import precisionFDA.data.TestCommonData;
import precisionFDA.locators.CommonLocators;
import precisionFDA.locators.ProfileLocators;
import precisionFDA.pages.AbstractPage;
import precisionFDA.pages.apps.AppsPage;
import precisionFDA.pages.notes.NotesPage;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static precisionFDA.utils.Utils.sleep;

public class ProfilePage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = ProfileLocators.PROFILE_ABOUT_YOUR_ORG_TEXT)
    private WebElement profileAboutOrgWE;

    @FindBy(xpath = ProfileLocators.PROFILE_TIMEZONE_SELECT)
    private Select profileTimeZoneSelect;

    @FindBy(xpath = CommonLocators.APPS_PAGE_ICON)
    private Link appsPageIcon;

    @FindBy(xpath = CommonLocators.NOTES_PAGE_ICON)
    private Link notesPageIcon;

    public ProfilePage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(ProfileLocators.PROFILE_ABOUT_YOUR_ORG_TEXT));
    }

    public WebElement getProfileAboutOrgWE() {
        return profileAboutOrgWE;
    }

    public Link getAppsPageIcon() {
        return appsPageIcon;
    }

    public Link getNotesPageIcon() {
        return notesPageIcon;
    }

    public Select getProfileTimeZoneSelect() {
        return profileTimeZoneSelect;
    }

    public boolean isAboutOrgTextDisplayed() {
        return isElementPresent(getProfileAboutOrgWE());
    }

    public ProfilePage setTimeZone(TimeZoneProfile timeZone) {
        log.info("select timezone: " + timeZone.getLocation());
        isElementPresent(getProfileTimeZoneSelect());
        sleep(500);
        getProfileTimeZoneSelect().selectByValue(timeZone.getLocation());
        sleep(500);

        String selected = getProfileTimeZoneSelect().getFirstSelectedOption().getText().trim();
        log.info("selected timezone string is: " + selected);
        String mask = "\\((.*?:.*?)\\)";
        String value = "";
        Pattern regex = Pattern.compile(mask);
        Matcher regexMatcher = regex.matcher(selected);
        while (regexMatcher.find()) {
            value = regexMatcher.group(1);
        }
        value = value.replace("(", "").replace(")", "");
        log.info("time zone is " + value);
        timeZone.setValue(value);
        TestCommonData.setCurrentTimezone(value);
        return new ProfilePage(getDriver());
    }

    public String getSelectedTimeZone() {
        return getProfileTimeZoneSelect().getFirstSelectedOption().getText();
    }

    public AppsPage openAppsPage() {
        log.info("open Apps page");
        Link link = getAppsPageIcon();
        waitUntilClickable(link);
        link.click();
        return new AppsPage(getDriver());
    }

    public NotesPage openNotesPage() {
        log.info("open Notes page");
        Link link = getNotesPageIcon();
        waitUntilClickable(link);
        link.click();
        return new NotesPage(getDriver());
    }

}
