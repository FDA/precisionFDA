package precisionFDA.locators;

public class SpacesLocators {

    public static final String PROVISION_SPACE_BUTTON_LINK = "//*[contains(@class, 'btn-group')]/a[contains(@href, 'spaces/')]";

    public static final String EDIT_SPACE_HOST_LEAD_INPUT = "//input[@id='space_host_lead_dxuser']";

    public static final String EDIT_SPACE_NAME_INPUT = "//input[@id='space_name']";

    public static final String EDIT_SPACE_DESCR_TEXTAREA = "//textarea[@id='space_description']";

    public static final String EDIT_SPACE_GUEST_LEAD_INPUT = "//input[@id='space_guest_lead_dxuser']";

    public static final String EDIT_SPACE_TYPE_SELECT = "//select[@id='space_space_type']";

    public static final String EDIT_SPACE_CTS_INPUT = "//input[@id='space_cts']";

    public static final String EDIT_SPACE_CREATE_BUTTON = "//input[@value='Create']";

    public static final String SPACES_NAME_TEMPLATE = "//*[@id='spaces']//*[text()='{SPACE_NAME}']";

    public static final String SPACES_DESCR_TEMPLATE = "//*[@id='spaces']//*[@class='description'][text()='{SPACE_DESCR}']";

    public static final String SPACE_DETAILS_MEMBERS_TAB_LINK = "//a[contains(@href, 'members')][contains(@aria-controls, 'members')]";

    public static final String SPACE_DETAILS_ACCEPT_BY_GUEST_LEAD_LINK = "//*[text()='Guest Lead']/../a[contains(@href, 'accept')]";

    public static final String SPACE_DETAILS_ACCEPT_BY_HOST_LEAD_LINK = "//*[text()='Host Lead']/../a[contains(@href, 'accept')]";

    public static final String SPACES_SPASE_STATUS_ON_GRID_TEMPLATE = "//a[text()='{SPACE_NAME}']/../../*[contains(@class, 'state')]";

    public static final String SPACES_MAIN_DIV = "//*[@id='spaces']";

    public static final String SPACES_CREATE_FOLDER_BUTTON = "//*[contains(@data-target, 'folder')][contains(@data-target, 'create')]";

    public static final String SPACES_CREATE_FOLDER_FORM_CREATE_BUTTON = "//*[@id='create-folder-modal']//button[text()='Create']";

    public static final String SPACES_CREATE_FOLDER_FORM_NAME_INPUT = "//*[@id='create-folder-modal']//input[@id='name']";

    public static final String SPACES_CREATED_FOLDER_TEMPLATE = "//*[@id='files']//a[contains(text(), '{FOLDER_NAME}')]";

    public static final String SPACES_ADDED_FILE_TEMPLATE = "//*[@id='files']//a[contains(text(), '{FILE_NAME}')]";

    public static final String SPACES_FILES_BREADCRUMBS = "//ol[contains(@class, 'breadcrumb')]";

    public static final String FILES_BREADCRUMB_CHAIN = "//ol[contains(@class, 'breadcrumb')]/li";

    public static final String SPACES_MOVE_DATA_TO_SPACE_BUTTON = "//button[contains(@data-bind, 'objectSelector')]";

    public static final String SPACES_MOVE_DATA_TO_SPACE_FILES_ITEM = "//*[contains(@class, 'modal-dialog')]//li/a/span[text()='Files']";

    public static final String SPACES_MOVE_DATA_TO_SPACE_FILE_CHECKBOX_TEMPLATE = "//*[contains(@class, 'modal-dialog')]//*[@class='object-name'][text()='{FILE_NAME}']/../input";

    public static final String SPACES_MOVE_DATA_TO_SPACE_DIALOG_SELECT_BUTTON = "//*[contains(@class, 'modal-dialog')]//button/*[text()='Select']";

}
