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

    public static final String CHALLS_EDIT_CHALL_FORM_ENDS_INPUT = "//input[@id='challenge_end_at']";

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



}
