package precisionFDA.locators;

public class DiscsLocators {

    public static final String DISCS_START_DISCS_LINK = "//*[@class='btn-group']/a[@href='/discussions']/span";

    public static final String DISCS_EDIT_DISC_EDITOR_AREA = "//*[@id='tab-note-editor']";

    public static final String EDIT_DISC_TITLE = "//*[contains(@class, 'note-editing')]//input[@name='title']";

    public static final String EDIT_DISC_CONTENT = "//*[@id='note-editor']/textarea";

    public static final String EDIT_DISC_SAVE_BUTTON_LINK = "//a[text()='Save']";

    public static final String SAVED_DISC_LINK_TEMPLATE = "//*[contains(@class, 'list')]//a[contains(text(), '{DISC_NAME}')]";

    public static final String EDIT_DISC_BUTTON_LINK = "//a[contains(@href, 'edit')][contains(@href, 'discussions')]";

    public static final String DISC_SAVED_PAGE_TITLE = "//*[@class='pfda-discussion-title']";

    public static final String DISC_SAVED_PAGE_CONTENT = "//*[contains(@class, 'note-display')]";

    public static final String EDIT_DISC_ATTACH_BUTTON = "//button[contains(text(), 'ttach to Discu')]";

    public static final String EDIT_DISC_ATTACH_MODAL_FILES_TAB = "//*[contains(@id, 'modal')][contains(@style, 'display')]//li//span[text()='Files']";

    public static final String EDIT_DISC_ATTACH_MODAL_FILE_LINK_TEMPLATE = "//*[contains(@id, 'modal')][contains(@style, 'display')]//span[text()='{FILE_NAME}']";

    public static final String EDIT_DISC_ATTACH_MODAL_FILE_CHECKBOX_TEMPLATE = "//*[contains(@id, 'modal')][contains(@style, 'display')]//span[text()='{FILE_NAME}']/../..//input[@type='checkbox']";

    public static final String EDIT_DISC_ATTACH_MODAL_SELECT_BUTTON = "//*[contains(@id, 'modal')][contains(@style, 'display')]//button/span[text()='Select']";

    public static final String EDIT_DISC_ATTACHED_FILE_LINK_TEMPLATE = "//*[@id='note-attachments']//a[text()='{FILE_NAME}']";

}
