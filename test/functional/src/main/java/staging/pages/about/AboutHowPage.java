package staging.pages.about;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.AboutLocators;
import staging.pages.AbstractPage;

public class AboutHowPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = AboutLocators.ABOUT_INTRODUCTION_TITLE)
    private WebElement aboutIntroTitle;

    public AboutHowPage(final WebDriver driver) {
        super(driver);
        waitForPageToLoadAndVerifyBy(By.xpath(AboutLocators.ABOUT_INTRODUCTION_TITLE));
    }

    public WebElement getAboutIntroTitle() {
        return aboutIntroTitle;
    }

    public boolean isAboutIntroTitleDisplayed() {
        return isElementPresent(getAboutIntroTitle());
    }

}
