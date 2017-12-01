package precisionFDA.locators;

public class NotesLocators {

    public static final String NOTES_MY_NOTES_LINK = "//a[@href='/notes']//span";

    public static final String NOTES_MY_NOTES_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='My Notes']";

    public static final String NOTES_NEW_NOTE_LINK = "//*[@class='btn-group']//a[@href='/notes']/span";

    public static final String NOTES_FEATURED_LINK = "//a[@href='/notes/featured']//span";

    public static final String NOTES_FEATURED_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Featured']";

    public static final String NOTES_EXPLORE_LINK = "//a[@href='/notes/explore']//span";

    public static final String NOTES_EXPLORE_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Explore']";

    public static final String NOTES_EDIT_NOTE_EDIT_TAB = "//li//a[text()='Edit Content']";

    public static final String NOTES_PAGINATION_AREA = "//ul[contains(@class, 'pagination')]/li";

    public static final String NOTES_EDIT_NOTE_TITLE = "//input[@name='title']";

    public static final String NOTES_EDIT_NOTE_ORG = "//li/h5[text()='Org']/../p";

    public static final String NOTES_EDIT_NOTE_ADDED_BY = "//li/h5[text()='Added by']/../p/a";

    public static final String NOTES_EDIT_NOTE_CREATED = "//li/h5[text()='Created']/../p";

    public static final String NOTES_EDIT_NOTE_EDITOR_AREA = "//*[@id='note-editor']/textarea";

    public static final String NOTES_EDIT_NOTE_EDITOR_VISIBLE_DIV = "//*[@class='pfda-note note-editing']";

    public static final String NOTES_EDIT_NOTE_EDITOR_ENTERED_TEXT = "//*[@class='pfda-note note-editing']//*[@class='ace_layer ace_text-layer']";

    public static final String NOTES_EDIT_NOTE_SAVE_BUTTON = "//a[text()='Save']";

    public static final String NOTES_LIST_FIRST_NOTE_TITLE = "//*[contains(@class, 'pfda-cards-list')]/a[1]//div[contains(@class, 'title')]";

    public static final String NOTES_LIST_FIRST_NOTE_USER_DATA = "//*[contains(@class, 'pfda-cards-list')]/a[1]//li[1]";

    public static final String NOTES_LIST_FIRST_NOTE_CREATED = "//*[contains(@class, 'pfda-cards-list')]/a[1]//li[2]";

    public static final String NOTES_SAVED_NOTE_TITLE = "//span[@class='note-title']";

    public static final String NOTES_SAVED_NOTE_ORG = "//li/*[contains(text(), 'Org')]/../p";

    public static final String NOTES_SAVED_NOTE_ADDED_BY = "//li/*[contains(text(), 'Added by')]/../p";

    public static final String NOTES_SAVED_NOTE_CREATED = "//li/*[contains(text(), 'Created')]/../p";

    public static final String NOTES_SAVED_NOTE_BODY_TEXT = "//*[contains(@class, 'note')][contains(@class, 'rendered')]";

    public static final String NOTES_LIST_ANY_NOTE_LINK = "//*[contains(@class, 'pfda-cards-list')]//a";

    public static final String NOTES_SAVED_NOTE_EDIT_DD = "//button/span[contains(@class, 'cog')]/..";

    public static final String NOTES_SAVED_NOTE_DD_DELETE = "//*[contains(@class, 'dropdown-menu')]//a[@data-method='delete']/span/..";

    public static final String NOTES_LIST_SUCCESS_MESSAGE = "//*[contains(@class, 'alert-success')]";

    public static final String NOTES_SAVED_NOTE_EDIT_BUTTON = "//a[contains(@class, 'btn')]/*[contains(@class, 'edit')]/..";

    public static final String NOTES_EDIT_NOTE_PREVIEW_TAB_LINK = "//a[text()='Preview']";

    public static final String NOTES_EDIT_NOTE_PREVIEW_AREA = "//*[@id='tab-note-preview'][contains(@class, 'active')]";

    public static final String NOTES_SAVED_NOTE_COMMENT_AREA = "//textarea[@id='comment_body']";

    public static final String NOTES_SAVED_NOTE_COMMENT_SUBMIT_BUTTON = "//input[@value='Comment']";

    public static final String NOTES_SAVED_NOTE_FIRST_COMMENT = "//*[@class='pfda-comments']/*[@class='pfda-comment'][1]//p";

    public static final String NOTES_EDIT_NOTE_BACK_BUTTON = "//a[text()='Back']";

    public static final String NOTES_SUBMITTED_COMMENT_TIME = "//*[contains(@class, 'comment-actions')]/li[3]";
}
