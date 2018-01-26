package precisionFDA.locators;

public class FilesLocators {

    public static final String FILES_MY_FILES_LINK = "//*[@class='pill-label'][text()='My Files']/../../a";

    public static final String FILES_MY_FILES_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='My Files']/..";

    public static final String FILES_FEATURED_LINK = "//*[@class='pill-label'][text()='Featured']/..";

    public static final String FILES_FEATURED_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Featured']/..";

    public static final String FILES_EXPLORE_LINK = "//*[@class='pill-label'][text()='Explore']/..";

    public static final String FILES_EXPLORE_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Explore']/..";

    public static final String FILES_ADD_FILES_BUTTON_LINK = "//*[contains(@class, 'btn')]//a[contains(@href, '/files/new')]";

    public static final String FILES_BROWSE_FILES_INPUT = "//input[@class='event-browse-files']";

    public static final String FILES_BROWSE_FILES_VISIBLE_FORM = "//*[contains(@class, 'form-upload-files')]";

    public static final String FILES_UPLOAD_ALL_BUTTON = "//button[contains(@class, 'upload-files')]";

    public static final String FILES_UPLOAD_PREVIEW_FILE_NAME_COMMON = "//*[@class='file-name']";

    public static final String FILES_UPLOAD_PREVIEW_FILE_NAME_TEMPLATE = "//*[@class='file-name'][text()='{FILE_NAME}']";

    public static final String FILES_UPLOADS_COMPLETE_MESSAGE = "//span[text()='Upload(s) complete']";

    public static final String FILES_COMMON_LINK_TO_UPLOADED_FILE = "//*[@id='files']//a[contains(@href, 'file-')]";

    public static final String FILES_DOWNLOAD_FILE_LINK = "//a[contains(@class, 'btn')]/span[contains(@class, 'download')]/..";

    public static final String FILES_UPLOADED_FILE_PAGE_TITLE = "//*[@class='page-title']";

    public static final String FILES_UPLOADED_FILE_ADDED_BY = "//*[text()='Added by']/..//a";

    public static final String FILES_UPLOADED_FILE_ACCESS_VALUE = "//*[text()='Access']/..//p";

    public static final String FILES_CREATE_FOLDER_BUTTON = "//*[contains(@data-target, 'create-folder')]";

    public static final String FILES_CREATE_FOLDER_FORM_CREATE_BUTTON = "//form//button[text()='Create']";

    public static final String FILES_CREATE_FOLDER_FORM_NAME_INPUT = "//form//input[@id='name']";

    public static final String FILES_COMMON_LINK_TO_CREATED_FOLDER = "//td/a[contains(@href, 'folder')]";

    public static final String FILES_SUCCESS_ALERT = "//*[contains(@class, 'alert-success')]";

    public static final String FILES_BREADCRUMBS = "//ol[@class='breadcrumb']";

    public static final String FILES_BREADCRUMB_CHAIN = "//ol[@class='breadcrumb']/li";

    public static final String FILES_UPLOADED_FILE_EDIT_DD = "//button/span[contains(@class, 'cog')]/..";

    public static final String FILES_UPLOADED_FILE_EDIT_DELETE_ENABLED_ITEM = "//li[not(contains(@class, 'disabled'))]/a/*[contains(@class, 'trash')]/..";

    public static final String FILES_UPLOADED_FILE_EDIT_DOWNLOAD_ENABLED_ITEM = "//li[not(contains(@class, 'disabled'))]/a/*[contains(@class, 'download')]/..";

    public static final String FILES_UPLOADED_FILE_EDIT_DOWNLOAD_ANY_ITEM = "//a/*[contains(@class, 'download')]/..";

    public static final String FILES_UPLOADED_FILE_EDIT_MOVE_ENABLED_ITEM = "//li[not(contains(@class, 'disabled'))]/a/*[contains(@class, 'share')]/..";

    public static final String FILES_UPLOADED_FILE_EDIT_RENAME_ENABLED_ITEM = "//li[not(contains(@class, 'disabled'))]/a/*[contains(@class, 'pencil')]/..";

    public static final String FILES_UPLOADED_FILE_EDIT_PUBLISH_ENABLED_ITEM = "//li[not(contains(@class, 'disabled'))]/a/*[contains(@class, 'bullhorn')]/..";

    public static final String FILES_FILTER_NAME_INPUT = "//input[@id='files_f_name']";

    public static final String FILES_FILTER_ICON = "//*[@id='files_submit_grid_icon']";

    public static final String FILES_COMMON_LINK = "//td/a[contains(@href, 'files')]";

    public static final String FILES_UPLOADED_FILE_EDIT_ITEM = "//*[contains(@class, 'toolbar')]//a[contains(@data-target, 'edit')]";

    public static final String FILES_EDIT_FILE_FORM_NAME_INPUT = "//form[@class='edit_file']//input[@id='file_name']";

    public static final String FILES_EDIT_FILE_FORM_SAVE_BUTTON = "//form[@class='edit_file']//button[text()='Save']";

    public static final String FILES_EDIT_FILE_FORM_DESCR_TEXTAREA = "//form[@class='edit_file']//textarea[@id='file_description']";

    public static final String FILES_UPLOADED_FILE_PAGE_DESCRIPTION = "//*[@class='description']";

    public static final String FILES_UPLOADED_FILE_COMMENT_TEXTAREA = "//textarea[@id='comment_body']";

    public static final String FILES_UPLOADED_FILE_COMMENT_SUBMIT_BUTTON = "//input[@value='Comment']";

    public static final String FILES_UPLOADED_FILE_SAVED_COMMENT_TEXT = "//*[@class='pfda-comment-body']/p";

    public static final String FILES_UPLOADED_AUTHURL_PAGE_TITLE = "//p[contains(text(), 'Authorized URL for')]";

    public static final String FILES_UPLOADED_AUTHURL_PAGE_URL = "//div[contains(text(), 'http')][contains(@class, 'alert')]";

    public static final String FILES_UPLOADED_FILE_PAGE_AUTHORIZED_URL_BUTTON_LINK = "//a/span[contains(@class, 'fa-link')]/..";

    public static final String FILES_PUBLISH_PAGE_PUBLISH_OBJ_BUTTON = "//form[contains(@action, 'publish')]//button[contains(text(), 'objects')]";

    public static final String FILES_UPLOADED_FILE_PUBLISH_BUTTON = "//*[contains(@class, 'btn')][contains(@href, 'publish')]|//*[contains(@class, 'btn')]/*[contains(text(), 'Publish')]";

    public static final String FILES_UPLOADED_FILE_PUBLISH_TO_PUBLIC_ITEM_LINK = "//*[contains(@class, 'drop')]//a[contains(@href, '=public')]";

    public static final String FILES_UPLOADED_FILE_PUBLISH_TO_SPACE_ITEM_LINK_COMMON = "//ul//a[contains(@href, 'publish')]";

    public static final String FILES_PUBLISH_PAGE_FILE_NAME = "//span[@class='object-title']";

    public static final String FILES_LIST_CHECKBOX_TEMPLATE = "//a[contains(text(), '{ITEM_NAME}')]/../..//input[@type='checkbox']";

    public static final String FILES_DELETE_DIALOG_ITEMS_TABLE = "//*[@id='delete-files-modal']//table";

    public static final String FILES_PUBLISH_DIALOG_ITEMS_TABLE = "//*[@id='publish-files-modal']//table";

    public static final String FILES_DOWNLOAD_DIALOG_ITEMS_TABLE = "//*[@id='download-files-modal']//table";

    public static final String FILES_MOVE_DIALOG_TREE_MY_FILES_LINK = "//*[@id='move_files_tree']//a[contains(text(), 'My files')]";

    public static final String FILES_MOVE_DIALOG_TREE_ROOT_ITEM_LINK = "//*[@id='move_files_tree']//a[@id='root_anchor']";

    public static final String FILES_MOVE_DIALOG_TREE_TEMPLATE_LINK = "//*[@id='move_files_tree']//a[contains(text(), '{ITEM_NAME}')]";

    public static final String FILES_MOVE_DIALOG_TREE_TEMPLATE_CLICKED_LINK = "//*[@id='move_files_tree']//a[contains(text(), '{ITEM_NAME}')][contains(@class, 'clicked')]";

    public static final String FILES_DELETE_DIALOG_ITEM_TEMPLATE = "//*[@id='delete-files-modal']//a/span[text()='{ITEM_NAME}']";

    public static final String FILES_PUBLISH_DIALOG_ITEM_TEMPLATE = "//*[@id='publish-files-modal']//a/span[text()='{ITEM_NAME}']";

    public static final String FILES_DELETE_DIALOG_ITEM_COMMON = "//*[@id='delete-files-modal']//a/span";

    public static final String FILES_DOWNLOAD_DIALOG_ITEM_COMMON = "//*[@id='download-files-modal']//a/span";

    public static final String FILES_DOWNLOAD_DIALOG_ITEM_TEMPLATE = "//*[@id='download-files-modal']//a/span[text()='{ITEM_NAME}']";

    public static final String FILES_DELETE_DIALOG_DELETE_BUTTON = "//*[@id='delete-files-modal']//button[text()='Delete']";

    public static final String FILES_PUBLISH_DIALOG_PUBLISH_BUTTON = "//*[@id='publish-files-modal']//button[text()='Publish']";

    public static final String FILES_RENAME_DIALOG_INPUT = "//form[@id='rename_form']//input[@name='file[name]']";

    public static final String FILES_RENAME_DIALOG_RENAME_BUTTON = "//form[@id='rename_form']//button[text()='Rename']";

    public static final String FILES_DOWNLOAD_DIALOG_DOWNLOAD_ITEM_LINK_TEMPLATE = "//*[@id='download-files-modal']//a/span[text()='{ITEM_NAME}']/../../..//a/*[contains(@class, 'download')]/..";

    public static final String FILES_DOWNLOAD_DIALOG_CLOSE_BUTTON = "//*[@id='download-files-modal']//button[text()='Close']";

    public static final String FILES_DOWNLOAD_DIALOG_PLACE_TO_FOCUS = "//*[@id='download-files-modal']//tr[1]/td/span[contains(@class, 'help')]";

    public static final String FILES_MOVE_DIALOG_MOVE_HERE_BUTTON = "//*[@id='move_form']//button[text()='Move here']";

    public static final String FILES_MOVE_DANGER_NOTIFICATION = "//*[contains(@class, 'danger')]";

    public static final String FILES_SPACE_LINK = "//a[contains(text(), '{FILE_NAME}')]/../..//a[contains(@href, 'spaces')]";

    public static final String FILES_UPLOAD_RESTART_BUTTON = "//button[text()='Restart']";

}
