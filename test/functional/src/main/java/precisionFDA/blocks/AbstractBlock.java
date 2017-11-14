package precisionFDA.blocks;

import org.openqa.selenium.*;
import ru.yandex.qatools.htmlelements.element.HtmlElement;

public abstract class AbstractBlock extends HtmlElement {

    public WebElement findByXpath(final String selector) {
        return getWrappedElement().findElement(By.xpath(selector));
    }

    @Override
    public Rectangle getRect() {
        return null;
    }

    @Override
    public <X> X getScreenshotAs(OutputType<X> outputType) throws WebDriverException {
        return null;
    }

    public void sleep(final long msec) {
        try {
            Thread.sleep(msec);
        } catch (final InterruptedException e) {
            //
        }
    }

}
