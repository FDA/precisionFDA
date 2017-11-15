package precisionFDA.pages.comps;

import org.apache.log4j.Logger;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.FindBy;
import precisionFDA.utils.Utils;
import ru.yandex.qatools.htmlelements.element.Link;
import precisionFDA.locators.CompsLocators;
import precisionFDA.pages.AbstractPage;

import static precisionFDA.utils.Utils.sleep;

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
        waitUntilScriptsReady();
        waitForPageToLoadAndVerifyBy(By.xpath(CompsLocators.COMPS_MY_COMPS_LINK));
    }

    public Link getCompsMyCompsLink() {
        return compsMyCompsLink;
    }

    public Link getCompsExploreLink() {
        return compsExploreLink;
    }

    public Link getCompsFeaturedLink() {
        return compsFeaturedLink;
    }

    public Link getCompsRunComparisonLink() {
        return compsRunComparisonLink;
    }

    public CompsMyCompsPage openCompsMyCompsPage() {
        log.info("open Comps.MyComps page");
        Link link = getCompsMyCompsLink();
        waitUntilDisplayed(link);
        link.click();
        return new CompsMyCompsPage(getDriver());
    }

    public CompsFeaturedPage openCompsFeaturedPage() {
        log.info("open Comps.Featured page");
        Link link = getCompsFeaturedLink();
        waitUntilDisplayed(link);
        link.click();
        return new CompsFeaturedPage(getDriver());
    }

    public CompsExplorePage openCompsExplorePage() {
        log.info("open Comps.Explore page");
        Link link = getCompsExploreLink();
        waitUntilDisplayed(link);
        link.click();
        return new CompsExplorePage(getDriver());
    }

    public CompsRunComparisonPage openCompsRunComparisonPage() {
        log.info("open Comps.RunComparison page");
        sleep(500);
        Link link = getCompsRunComparisonLink();
        waitUntilClickable(link);
        link.click();
        return new CompsRunComparisonPage(getDriver());
    }

    public boolean isMyCompsLinkDisplayed() {
        return isElementPresent(getCompsMyCompsLink());
    }



}
