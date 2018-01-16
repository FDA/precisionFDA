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

    public static final String SPACES_TITLE_WE = "//*[@id='spaces_title']";

    public static final String SPACES_HOST_LEAD_COLUMN= "//*[@id='spaces']//*[text()='Host Lead']";

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

    public static final String SPACES_CHECKBOX_TEMPLATE = "//a[contains(text(), '{ITEM_NAME}')]/../..//input[@type='checkbox']";

    public static final String SPACES_DD_COG_BUTTON = "//*[@id='tab-data']//*[@class='dropdown']//button/*[contains(@class, 'cog')]/..";

    public static final String SPACES_DD_COG_ITEMS = "//*[contains(@class, 'dropdown')][contains(@class, 'open')]/ul";

    public static final String SPACES_DD_RENAME_ITEM = "//*[contains(@class, 'dropdown')][contains(@class, 'open')]/ul//a/*[contains(@class, 'pencil')]/..";

    public static final String SPACES_DD_DELETE_ITEM = "//*[contains(@class, 'dropdown')][contains(@class, 'open')]/ul//a/*[contains(@class, 'trash')]/..";

    public static final String SPACES_DD_PUBLISH_ITEM = "//*[contains(@class, 'dropdown')][contains(@class, 'open')]/ul//a/*[contains(@class, 'bullhorn')]/..";

    public static final String SPACES_DD_MOVE_ITEM = "//*[contains(@class, 'dropdown')][contains(@class, 'open')]/ul//a/*[contains(@class, 'share')]/..";

    public static final String SPACES_MODAL_RENAME_NAME_INPUT = "//*[@id='rename_form']//input[@name='file[name]']";

    public static final String SPACES_MODAL_RENAME_SUBMIT_BUTTON = "//*[@id='rename_form']//button[text()='Rename']";

    public static final String SPACES_MODAL_DELETE_TABLE = "//*[@id='delete-files-modal']//table[contains(@class, 'wice-grid')]";

    public static final String SPACES_MODAL_PUBLISH_TABLE = "//*[@id='publish-files-modal']//table[contains(@class, 'wice-grid')]";

    public static final String SPACES_MODAL_DELETE_BUTTON= "//*[@id='delete-files-modal']//button[text()='Delete']";

    public static final String DANGER_NOTIFICATION = "//*[contains(@class, 'danger')]";

    public static final String MOVE_DIALOG_TREE = "//*[@id='move-modal']//*[@id='move_files_tree']";

    public static final String MOVE_DIALOG_TREE_TEMPLATE_LINK = "//*[@id='move_files_tree']//a[contains(text(), '{ITEM_NAME}')]";

    public static final String MOVE_DIALOG_TREE_TEMPLATE_CLICKED_LINK = "//*[@id='move_files_tree']//a[contains(text(), '{ITEM_NAME}')][contains(@class, 'clicked')]";

    public static final String MOVE_DIALOG_MOVE_HERE_BUTTON = "//*[@id='move_form']//button[text()='Move here']";

    public static final String SPACE_FILES_FIRST_CHECKBOX = "//*[contains(@class, 'table-bordered')]//tr[1]/td/input";

    public static final String FILES_DELETE_DIALOG_ITEM_TEMPLATE = "//*[@id='delete-files-modal']//a/span[text()='{ITEM_NAME}']";

    public static final String FILES_DELETE_DIALOG_ITEM_COMMON = "//*[@id='delete-files-modal']//a/span";

    public static final String FILES_PUBLISH_DIALOG_ITEM_TEMPLATE = "//*[@id='publish-files-modal']//a/span[text()='{ITEM_NAME}']";

    public static final String FILES_PUBLISH_DIALOG_PUBLISH_BUTTON = "//*[@id='publish-files-modal']//button[text()='Publish']";

}
