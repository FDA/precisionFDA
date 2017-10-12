package staging.pages.comps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import ru.yandex.qatools.htmlelements.element.Link;
import staging.locators.CompsLocators;
import staging.pages.AbstractPage;

public class CompsPage extends AbstractPage {

    private final Logger log = Logger.getLogger(this.getClass());

    @FindBy(xpath = CompsLocators.COMPS_MY_COMPS_LINK)
    private Link compsMyCompsLink;

    @FindBy(xpath = CompsLocators.COMPS_FEATURED_LINK)
    private Link compsFeaturedLink;

    @FindBy(xpath = CompsLocators.COMPS_EXPLORE_LINK)
    private Link compsExploreLink;

    @FindBy(xpath = CompsLocators.COMPS_RUN_COMPARISON_LINK)
    private Link compsRunComparisonLink;

    public CompsPage(final WebDriver driver) {
        super(driver);
        waitUntilJSReady();
        waitForPageToLoadAndVerifyBy(By.xpath(CompsLocators.COMPS_MY_COMPS_LINK));
    }

    public Link getCompsMyCompsLink() {
        return compsMyCompsLink;
    }

    public CompsMyCompsPage openCompsMyCompsPage() {
        log.info("open Comps.MyComps page");
        compsMyCompsLink.click();
        return new CompsMyCompsPage(getDriver());
    }

    public CompsFeaturedPage openCompsFeaturedPage() {
        log.info("open Comps.Featured page");
        compsFeaturedLink.click();
        return new CompsFeaturedPage(getDriver());
    }

    public CompsExplorePage openCompsExplorePage() {
        log.info("open Comps.Explore page");
        compsExploreLink.click();
        return new CompsExplorePage(getDriver());
    }

    public CompsRunComparisonPage openCompsRunComparisonPage() {
        log.info("open Comps.RunComparison page");
        compsRunComparisonLink.click();
        return new CompsRunComparisonPage(getDriver());
    }



}
