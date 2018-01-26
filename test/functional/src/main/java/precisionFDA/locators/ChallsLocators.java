package precisionFDA.locators;

public class ChallsLocators {

    public static final String CHALLS_MAIN_DIV = "//*[contains(@class, 'pfda-controller-experts')]";

    public static final String CHALLS_ACTIVATED_ICON = "//*[@class='active']/a[@href='/challenges']";

    public static final String CHALLS_PREV_CHALLS_TEXT = "//*[contains(text(), 'Previous PrecisionFDA Challenges')]";

    public static final String CHALLS_CREATE_NEW_CHALL_LINK = "//a[contains(@href, 'challenges/new')]";

    public static final String CHALLS_EDIT_CHALL_FORM_STATUS_SELECT = "//select[@id='challenge_status']";

    public static final String CHALLS_EDIT_CHALL_FORM_NAME_INPUT = "//input[@id='challenge_name']";

    public static final String CHALLS_EDIT_CHALL_FORM_DESCR_TEXTAREA = "//textarea[@id='challenge_description']";

    public static final String CHALLS_EDIT_CHALL_FORM_USER_SELECT = "//select[@id='challenge_app_owner_id']";

    public static final String CHALLS_EDIT_CHALL_FORM_STARTS_INPUT = "//input[@id='challenge_start_at']";

    public static final String CHALLS_EDIT_CHALL_FORM_STARTS_VISIBLE_ELEMENT = "//input[@id='challenge_start_at']/../span";

    public static final String CHALLS_EDIT_CHALL_FORM_ENDS_INPUT = "//input[@id='challenge_end_at']";

    public static final String CHALLS_EDIT_CHALL_FORM_ENDS_VISIBLE_ELEMENT = "//input[@id='challenge_end_at']/../span";

    public static final String CHALLS_EDIT_CHALL_FORM_CARD_IMAGE_INPUT = "//input[@id='challenge_card_image_url']";

    public static final String CHALLS_EDIT_CHALL_FORM_USER_OPTIONS_COMMON = "//select[@id='challenge_app_owner_id']/option";

    public static final String CHALLS_EDIT_CHALL_FORM_CREATE_BUTTON = "//input[@value='Create']";

    public static final String CHALLS_CREATED_CHALL_NAME_COMMON = "//*[contains(@class, 'tiltview-description')]/h1";

    public static final String CHALLS_CREATED_CHALL_DESCR_COMMON = "//*[contains(@class, 'tiltview-description')]/p";

    public static final String CHALLS_CREATED_CHALL_STARTS_VALUE_PARAMS = "//*[contains(@class, 'tiltview-description')]/p[text()='{CHALL_DESCRIPTION}']/..//*[contains(text(), 'tart')]/../h5[contains(@class, 'text')]";

    public static final String CHALLS_CREATED_CHALL_ENDS_VALUE_PARAMS = "//*[contains(@class, 'tiltview-description')]/p[text()='{CHALL_DESCRIPTION}']/..//*[contains(text(), 'nds')]/../h5[contains(@class, 'text')]";

    public static final String CHALLS_CREATED_CHALL_PAGE_NAME = "//*[contains(@class, 'tiltview-description')]/h1";

    public static final String CHALLS_CREATED_CHALL_PAGE_DESCR = "//*[contains(@class, 'tiltview-description')]/p";

    public static final String CHALLS_CREATED_CHALL_INTRO_LINK = "//a[contains(text(), 'ntroduction')]";

    public static final String CHALLS_CREATED_CHALL_PAGE_STARTS_VALUE = "//*[contains(@class, 'tiltview-description')]//*[contains(text(), 'tart')]/../h5[contains(@class, 'text')]";

    public static final String CHALLS_CREATED_CHALL_PAGE_ENDS_VALUE = "//*[contains(@class, 'tiltview-description')]//*[contains(text(), 'nds')]/../h5[contains(@class, 'text')]";

    public static final String CHALLS_VIEW_CHALL_BUTTON_PARAM = "//*[contains(@class, 'tiltview-description')]/p[text()='{CHALL_DESCRIPTION}']/..//a[contains(text(), 'View Challenge')]";

    public static final String CHALLS_EDIT_INFO_PENCIL_ICON = "//*[contains(@class, 'button--edit')]";

    public static final String CHALLS_EDIT_INFO_CONFIRM_ICON = "//*[contains(@class, 'button--confirm')]";

    public static final String CHALLS_EDIT_INFO_EDIT_PAGE_BUTTON = "//a[contains(@href, 'editor')]";

    public static final String CHALLS_EDIT_INFO_EDIT_CHALLENGE_INFO_LINK = "//a[text()='Challenge Info']";

    public static final String CHALLS_EDIT_INFO_EDIT_CHALLENGE_INFO_ACTIVATED_LINK = "//li[@class='active']/a[text()='Challenge Info']";

    public static final String CHALLS_EDIT_INFO_EDIT_CHALLENGE_INFO_EDITOR = "//*[@id='intro']/p";

    public static final String CHALLS_EDIT_INFO_EDIT_CHALLENGE_RESULTS_LINK = "//a[text()='Challenge Results']";

    public static final String CHALLS_EDIT_INFO_EDIT_CHALLENGE_RESULTS_ACTIVATED_LINK = "//li[@class='active']/a[text()='Challenge Results']";

    public static final String CHALLS_EDIT_INFO_EDIT_CHALLENGE_RESULTS_TITLE_EDITOR = "//*[@data-name='results']/p";

    public static final String CHALLS_EDIT_INFO_EDIT_CHALLENGE_RESULTS_DETAILS_EDITOR = "//*[@data-name='results-details']/p";

    public static final String CHALLS_EDIT_INFO_EDIT_CHALLENGE_RETURN_BUTTON = "//a[contains(text(), 'Return')]";

    public static final String CHALLS_CREATED_CHALL_INTRO_TEXT = "//div[@class='row']/p";

    public static final String CHALLS_BOOTSTRAP_CALENDAR_POPUP = "//*[contains(@class, 'bootstrap-datetimepicker-widget')]";

    public static final String CHALLS_BOOTSTRAP_CALENDAR_POPUP_INCR_MIN_ARROW = "//*[contains(@class, 'bootstrap-datetimepicker-widget')]//a[@data-action='incrementMinutes']";

    public static final String CHALLS_PAGE_TITLE = "//*[@class='page-title']";

    public static final String CHALLS_BOOTSTRAP_CALENDAR_POPUP_TIME_ICON = "//*[contains(@class, 'bootstrap-datetimepicker')]//a[contains(@title, 'Time')]";

    public static final String CHALLS_JOIN_CHALLENGE_BUTTON = "//a[contains(@class, 'btn')][contains(@href, 'join')]/span/..";

    public static final String SUBMIT_CHALLENGE_ENTRY_BUTTON = "//a[contains(@class, 'btn')][contains(@href, 'submission')]/span/..";

    public static final String SUBMIT_NEW_ENTRY_NAME_INPUT = "//input[@id='submission_name']";

    public static final String SUBMIT_NEW_ENTRY_DESCR_INPUT = "//textarea[@id='submission_desc']";

    public static final String SUBMIT_NEW_ENTRY_MODAL_FILES_TAB = "//*[contains(@class, 'modal')][contains(@style, 'block')]//li/a/span[text()='Files']";

    public static final String SUBMIT_NEW_ENTRY_MODAL_FILE_RB_TEMPLATE = "//*[contains(@class, 'modal')]//*[text()='{FILE_NAME}']/../input[@type='radio']";

    public static final String SUBMIT_NEW_ENTRY_MODAL_FILE_NAME_TEMPLATE = "//*[contains(@class, 'modal')]//*[text()='{FILE_NAME}']";

    public static final String SUBMIT_NEW_ENTRY_MODAL_SUBMIT_BUTTON = "//*[contains(@class, 'modal')][contains(@style, 'block')]//button/span[text()='Select']/..";

    public static final String CHALLS_CREATED_CHALL_SETTINGS_BUTTON = "//a[contains(text(), 'Settings')]";

    public static final String CHALLS_CREATED_CHALL_UPDATE_BUTTON = "//input[@value='Update']";

    public static final String SUBMIT_NEW_ENTRY_ATTACHED_FILE_TEMPLATE = "//*[contains(@class, 'required')]//button[text()='{FILE_NAME}']";

    public static final String SUBMIT_NEW_ENTRY_SUBMIT_BUTTON = "//button/span[text()='Submit']";

    public static final String SUBMITTED_INPUT_FILE_LINK = "//table//a[contains(text(), '{FILE_NAME}')]";

    public static final String MY_ENTRIES_LINK = "//a[text()='My Entries']";

    public static final String MY_ENTRIES_INPUT_FILE_COLUMN_NAME = "//th[text()='Input File']";

    public static final String MY_ENTRIES_ENTRY_NAME_LINK_TEMPLATE = "//table//a[text()='{ENTRY_NAME}']";

    public static final String MY_ENTRIES_INPUT_FILE_NAME_LINK_TEMPLATE = "//table//a[text()='{ENTRY_NAME}']/../../td//a[contains(@href, 'files')][contains(text(), '{FILE_NAME}')]";

    public static final String MY_ENTRIES_ENTRY_STATE_TEMPLATE = "//table//a[text()='{ENTRY_NAME}']/../../td[contains(@class, 'state')]";

    public static final String CHALLS_CREATED_CHALLENGE_CLOSED_BUTTON = "//*[@class='row']//button/span[contains(@class, 'trophy')]/..";

    public static final String CHALLS_EDIT_CHALLENGE_ANNOUNCE_RESULT_BUTTON_LINK = "//a[text()='Announce result']";

    public static final String CHALLS_PAGE_CHALLENGE_CARD_LINK_TEMPLATE = "//*[contains(@class, 'pfda-card-title')][contains(text(), '{CHALL_NAME}')]";

    public static final String RESULT_PAGE_FULL_NAME_TEMPLATE = "//table[@id='table-results-overview']//td[contains(text(), '{FULL_NAME}')]";

    public static final String RESULT_PAGE_ENTRY_NAME_TEMPLATE = "//table[@id='table-results-overview']//td/a[contains(text(), '{ENTRY_NAME}')]";

}
