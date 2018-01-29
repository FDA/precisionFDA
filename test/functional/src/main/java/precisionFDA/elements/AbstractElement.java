package precisionFDA.elements;

import org.openqa.selenium.WebElement;
import ru.yandex.qatools.htmlelements.element.TypifiedElement;

public abstract class AbstractElement extends TypifiedElement {

    public AbstractElement(final WebElement element) {
        super(element);
    }

    public void click() {
        getWrappedElement().click();
    }

    public String getText() {
        return getWrappedElement().getText();
    }

}
