package staging.locators;

public class NotesLocators {

    public static final String NOTES_MY_NOTES_LINK = "//a[@href='/notes']//span";

    public static final String NOTES_MY_NOTES_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='My Notes']";

    public static final String NOTES_NEW_NOTE_LINK = "//*[@class='btn-group']//a[@href='/notes']/span";

    public static final String NOTES_FEATURED_LINK = "//a[@href='/notes/featured']//span";

    public static final String NOTES_FEATURED_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Featured']";

    public static final String NOTES_EXPLORE_LINK = "//a[@href='/notes/explore']//span";

    public static final String NOTES_EXPLORE_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Explore']";

    public static final String NOTES_NEW_NOTE_EDITOR_AREA = "//*[@id='tab-note-editor']";

    public static final String NOTES_NEW_NOTE_EDIT_TAB = "//li//a[text()='Edit Content']";

    public static final String NOTES_PAGINATION_AREA = "//ul[contains(@class, 'pagination')]/li";


}
