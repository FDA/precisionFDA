package precisionFDA.pages.about;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.AboutLocators;
import precisionFDA.pages.AbstractPage;

import static precisionFDA.utils.Utils.sleep;

public class AboutWhyPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AboutLocators.ABOUT_WHY_ACTIVATED_TAB_LINK)
    private Link aboutWhyActivatedTabLink;

    public AboutWhyPage(final WebDriver driver) {
        super(driver);
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(AboutLocators.ABOUT_WHY_ACTIVATED_TAB_LINK));
    }

    public Link getAboutWhyActivatedLink() {
        return aboutWhyActivatedTabLink;
    }

    public boolean isAboutWhyActivatedLinkDisplayed() {
        sleep(1);
        return isElementPresent(getAboutWhyActivatedLink());
    }

}
