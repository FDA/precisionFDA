package precisionFDA.pages.about;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.AboutLocators;
import precisionFDA.pages.AbstractPage;

public class AboutWhatPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AboutLocators.ABOUT_WHAT_ACTIVATED_TAB_LINK)
    private Link aboutWhatActivatedTabLink;

    public AboutWhatPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(AboutLocators.ABOUT_WHAT_ACTIVATED_TAB_LINK));
    }

    public Link getAboutWhatActivatedLink() {
        return aboutWhatActivatedTabLink;
    }

    public boolean isAboutWhatActivatedLinkDisplayed() {
        return isElementPresent(getAboutWhatActivatedLink());
    }

}
