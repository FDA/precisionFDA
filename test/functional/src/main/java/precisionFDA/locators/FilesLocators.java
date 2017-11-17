package precisionFDA.locators;

public class FilesLocators {

    public static final String FILES_MY_FILES_LINK = "//*[@class='pill-label'][text()='My Files']/../../a";

    public static final String FILES_MY_FILES_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='My Files']/..";

    public static final String FILES_FEATURED_LINK = "//*[@class='pill-label'][text()='Featured']/..";

    public static final String FILES_FEATURED_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Featured']/..";

    public static final String FILES_EXPLORE_LINK = "//*[@class='pill-label'][text()='Explore']/..";

    public static final String FILES_EXPLORE_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Explore']/..";

    public static final String FILES_ADD_FILES_BUTTON_LINK = "//*[@class='btn-group']//a[@href='/files/new']/span";

    public static final String FILES_BROWSE_FILES_INPUT = "//input[@class='event-browse-files']";

    public static final String FILES_BROWSE_FILES_VISIBLE_FORM = "//*[contains(@class, 'form-upload-files')]";

    public static final String FILES_UPLOAD_ALL_BUTTON = "//button[contains(@class, 'upload-files')]";

    public static final String FILES_UPLOAD_PREVIEW_FILE_NAME = "//*[@class='file-name']";

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

    public static final String FILES_UPLOADED_FILE_EDIT_DD = "//button[@id='dLabel']";

    public static final String FILES_UPLOADED_FILE_EDIT_DELETE_ITEM = "//*[contains(@class, 'toolbar')]//a[@data-method='delete']";

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

    public static final String FILES_PUBLISH_PAGE_PUBLISH_OBJ_BUTTON = "//button[text()='Publish selected objects']";

    public static final String FILES_UPLOADED_FILE_PUBLISH_BUTTON_LINK = "//a[contains(@href, 'publish')]/span/..";

    public static final String FILES_PUBLISH_PAGE_FILE_NAME = "//span[@class='object-title']";

}
