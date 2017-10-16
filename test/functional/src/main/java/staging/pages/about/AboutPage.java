package staging.pages.about;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.AboutLocators;
import staging.pages.AbstractPage;

public class AboutPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AboutLocators.ABOUT_MAIN_TITLE)
    private WebElement aboutMainTitle;

    @FindBy(xpath = AboutLocators.ABOUT_WHY_TAB_LINK)
    private Link aboutWhyTabLink;

    @FindBy(xpath = AboutLocators.ABOUT_WHAT_TAB_LINK)
    private Link aboutWhatTabLink;

    @FindBy(xpath = AboutLocators.ABOUT_WHO_TAB_LINK)
    private Link aboutWhoTabLink;

    @FindBy(xpath = AboutLocators.ABOUT_HOW_TAB_LINK)
    private Link aboutHowTabLink;

    public AboutPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AboutLocators.ABOUT_MAIN_TITLE));
    }

    public Link getAboutWhyLink() {
        return aboutWhyTabLink;
    }

    public Link getAboutWhatLink() {
        return aboutWhatTabLink;
    }

    public Link getAboutWhoLink() {
        return aboutWhoTabLink;
    }

    public Link getAboutHowLink() {
        return aboutHowTabLink;
    }

    public AboutWhyPage openAboutWhyPage() {
        log.info("open About.Why Page");
        aboutWhyTabLink.click();
        return new AboutWhyPage(getDriver());
    }

    public AboutWhatPage openAboutWhatPage() {
        log.info("open About.What Page");
        aboutWhatTabLink.click();
        return new AboutWhatPage(getDriver());
    }

    public AboutWhoPage openAboutWhoPage() {
        log.info("open About.Who Page");
        aboutWhoTabLink.click();
        return new AboutWhoPage(getDriver());
    }

    public AboutHowPage openAboutHowPage() {
        log.info("open About.How Page");
        aboutHowTabLink.click();
        return new AboutHowPage(getDriver());
    }

    public boolean isAboutWhyLinkDisplayed() {
        return isElementPresent(getAboutWhyLink());
    }

    public boolean isAboutWhatLinkDisplayed() {
        return isElementPresent(getAboutWhatLink());
    }

    public boolean isAboutWhoLinkDisplayed() {
        return isElementPresent(getAboutWhoLink());
    }

    public boolean isAboutHowLinkDisplayed() {
        return isElementPresent(getAboutHowLink());
    }

}
