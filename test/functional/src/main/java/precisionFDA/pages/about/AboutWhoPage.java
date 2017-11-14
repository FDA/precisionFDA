package precisionFDA.pages.about;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.AboutLocators;
import precisionFDA.pages.AbstractPage;

public class AboutWhoPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AboutLocators.ABOUT_WHO_ACTIVATED_TAB_LINK)
    private Link aboutWhoActivatedTabLink;

    public AboutWhoPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(AboutLocators.ABOUT_WHO_ACTIVATED_TAB_LINK));
    }

    public Link getAboutWhoActivatedLink() {
        return aboutWhoActivatedTabLink;
    }

    public boolean isAboutWhoActivatedLinkDisplayed() {
        return isElementPresent(getAboutWhoActivatedLink());
    }

}
