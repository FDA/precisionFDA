package precisionFDA.locators;

public class AppsLocators {

    public static final String APPS_JOBS_LIST = "//div[@id='jobs']";

    public static final String APPS_MAIN_DIV = "//*[@class='container-fluid container-padded']";

    public static final String APPS_RELEVANT_LINK = "//*[@class='pill-label'][text()='Relevant Apps']/..";

    public static final String APPS_RELEVANT_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Relevant Apps']/..";

    public static final String APPS_FEATURED_LINK = "//*[@class='pill-label'][text()='Featured']/..";

    public static final String APPS_FEATURED_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Featured']/..";

    public static final String APPS_EXPLORE_LINK = "//*[@class='pill-label'][text()='Explore']/..";

    public static final String APPS_EXPLORE_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Explore']/..";

    public static final String APPS_MANAGE_ASSETS_LINK = "//a[@href='/app_assets']/span";

    public static final String APPS_MANAGE_MY_ASSETS_LINK = "//*[@class='pill-label'][text()='My Assets']/..";

    public static final String APPS_MANAGE_MY_ASSETS_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='My Assets']/..";

    public static final String APPS_MANAGE_CREATE_ASSETS_LINK = "//a[@href='/app_assets/new']/span";

    public static final String APPS_MANAGE_MAIN_TOOLBAR = "//*[@class='pfda-toolbar']//*[contains(@class, 'nav-pills')]";

    public static final String APPS_MANAGE_FEATURED_LINK = "//*[@class='pill-label'][text()='Featured']/..";

    public static final String APPS_MANAGE_FEATURED_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Featured']/..";

    public static final String APPS_MANAGE_EXPLORE_LINK = "//*[@class='pill-label'][text()='Explore']/..";

    public static final String APPS_MANAGE_EXPLORE_ACTIVATED_LINK = "//*[@class='active']//*[@class='pill-label'][text()='Explore']/..";

    public static final String APPS_MANAGE_CREATE_ASSETS_GENERATE_KEY_LINK = "//a[@href='/tokify']/span";

    public static final String APPS_EDIT_APP_NAME_INPUT = "//*/label[text()='App Name']/../input";

    public static final String APPS_EDIT_APP_TITLE_INPUT = "//*/label[text()='Title']/../input";

    public static final String APPS_CREATE_APP_BUTTON_LINK = "//a[contains(text(), 'Create App')]";

    public static final String APPS_EDIT_APP_SCRIPT_TAB_LINK = "//a/*[contains(text(), 'Script')]";

    public static final String APPS_EDIT_APP_SCRIPT_TEXTAREA = "//*[@id='script-editor']/textarea";

    public static final String APPS_EDIT_APP_README_TAB_LINK = "//a/*[contains(text(), 'README')]";

    public static final String APPS_EDIT_APP_README_TEXTAREA = "//*[@id='readme-editor']/textarea";

    public static final String APPS_EDIT_APP_README_PREVIEW_TAB_LINK = "//li/a[text()='Preview']";

    public static final String APPS_EDIT_APP_README_PREVIEW_TEXTAREA = "//*[@id='tab-readme-preview']/*[contains(@class, 'readme-preview')]";

    public static final String APPS_CREATE_APP_CREATE_BUTTON = "//button/*[contains(text(), 'Create')]";

    public static final String APPS_RELEVANT_SELECTED_APP_NAME = "//li/*[contains(text(), 'name')]/../p";

    public static final String APPS_RELEVANT_SELECTED_APP_ORG = "//li/*[contains(text(), 'Org')]/../p";

    public static final String APPS_RELEVANT_SELECTED_APP_ADDED_BY = "//li/*[contains(text(), 'Added by')]/../p";

    public static final String APPS_RELEVANT_SELECTED_APP_CREATED = "//li/*[contains(text(), 'Created')]/../p";

    public static final String APPS_RELEVANT_SELECTED_APP_TITLE = "//*[contains(@class, 'list-group')]//a[contains(@class, 'active')]/*[contains(@class, 'title')]";

    public static final String APPS_SAVED_APP_RUN_APP_BUTTON = "//div[contains(@class, 'right')]//a[contains(@href, 'jobs')]";

    public static final String APPS_SAVED_APP_LINK_TEMPLATE = "//div[contains(text(), 'My Apps')]/../a/div[text()='{APP_TITLE}']";

    public static final String APPS_SAVED_APP_REVISION = "//span[@class='app-revision']";

    public static final String APPS_SAVED_APP_EDIT_BUTTON = "//span[contains(@class, 'edit')]/../../a[contains(@href, 'edit')]";

    public static final String APPS_SAVED_APP_SAVE_REVISION_BUTTON = "//span[contains(text(), 'Save Revision')]";

    public static final String APPS_EDIT_RUN_APP_JOB_NAME_INPUT = "//label[text()='Job Name']/..//input[@name='name']";

    public static final String APPS_EDIT_RUN_APP_RUN_APP_BUTTON = "//span[text()='Run App']/../../button";

    public static final String APPS_SAVED_APP_JOB_LINK_TEMPLATE = "//*[@id='app-job']//a[contains(text(), '{JOB_NAME}')]";

    public static final String APPS_JOB_PAGE_I_O_TAB_LINK = "//span[text()='Inputs and Outputs']/../../a[contains(@href, 'tab')]";

    public static final String APPS_JOB_PAGE_JOB_NAME = "//*[@class='page-title']/span[@class='name']";

    public static final String APPS_JOB_PAGE_APP_TITLE_LINK = "//*[contains(@class, 'heading')][text()='App']/..//a";

    public static final String APPS_JOB_PAGE_LAUNCHED_BY_LINK = "//*[contains(@class, 'heading')][text()='Launched by']/..//a";

    public static final String APPS_JOB_PAGE_CREATED = "//*[contains(@class, 'heading')][text()='Created']/../p";

    public static final String APPS_JOB_PAGE_RUNNING_JOB_LABEL = "//*[contains(@class, 'title')]//span[contains(@class, 'label-')]";

    public static final String APPS_JOB_PAGE_VIEW_LOG_LINK = "//*[@class='pfda-toolbar']//a[contains(@href, 'job')][contains(@href, 'log')]";

    public static final String APPS_JOB_LOG_PAGE_LOG_AREA = "//*[contains(@class, 'job-log')]";

    public static final String APPS_SAVED_APP_README_TAB_LINK = "//a//span[text()='README']";

    public static final String APPS_SAVED_APP_README_PREVIEW = "//*[@id='app-readme']";

    public static final String APPS_SAVED_APP_COMMENTS_TAB_LINK = "//li/a[contains(@href, 'comments')][@aria-controls='tab-comments']";

    public static final String APPS_SAVED_APP_COMMENT_AREA = "//textarea[@id='comment_body']";

    public static final String APPS_SAVED_APP_COMMENT_BUTTON = "//input[@value='Comment']";

    public static final String APPS_SAVED_APP_LAST_COMMENT = "//*[@class='pfda-comment'][1]//*[@class='pfda-comment-body']/p";

    public static final String APPS_SAVED_APP_EDIT_TAG_LINK = "//a[@class='pfda-tag-item']";

    public static final String APPS_SAVED_APP_EDIT_TAG_FORM_TAGNAME_INPUT = "//input[@name='tags']";

    public static final String APPS_SAVED_APP_EDIT_TAG_FORM_UPDATE_TAGS_BUTTON = "//button[text()='Update tags']";

    public static final String APPS_SAVED_APP_SAVED_TAG_LINK = "//ul[contains(@class, 'pfda-tags')]//a";

    public static final String APPS_SAVED_APP_EDIT_TAG_FORM_CHECKBOXES = "//input[@name='taggable_uid']";

    public static final String APPS_EDIT_APP_VMENV_TAB_LINK = "//a//span[text()='VM Environment']";

    public static final String APPS_EDIT_APP_VMENV_INSTANCE_DROP = "//select[@name='instance_type']";

    public static final String APPS_EDIT_APP_VMENV_INSTANCE_PACKAGE_INPUT = "//input[@placeholder='Package name']";

    public static final String APPS_SAVED_APP_INSTANCE_VALUE = "//*[contains(text(), 'instance type')]/../p";

    public static final String APPS_SAVED_APP_REVISIONS_BUTTON = "//button//*[contains(text(), 'Revision')]";

    public static final String APPS_SAVED_APP_FIRST_REVISION = "//*[@class='btn-group open']/*[@class='dropdown-menu']//span[text()='1']";

    public static final String APPS_SAVED_APP_REVISION_PAGE_TITLE = "//li/*[contains(text(), 'evision')][contains(text(), 'itle')]/../p";

    public static final String APPS_SUBMITTED_COMMENT_TIME = "//*[contains(@class, 'comment-actions')]/li[3]";

    public static final String APPS_REVISION_TITLE_LABEL = "//li/*[text()='Revision Title']";

    public static final String APPS_ADD_INPUT_FIELD_BUTTON = "//*[@class='section-io-input']//*[text()='Inputs']/..//button";

    public static final String APPS_ADD_OUTPUT_FIELD_BUTTON = "//*[@class='section-io-input']//*[text()='Outputs']/..//button";

    public static final String APPS_ADD_INPUT_STRING_ITEM = "//*[@class='section-io-input']//*[text()='Inputs']/..//li/a[text()='String']";

    public static final String APPS_ADD_INPUT_FILE_ITEM = "//*[@class='section-io-input']//*[text()='Inputs']/..//li/a[text()='File']";

    public static final String APPS_ADD_OUTPUT_STRING_ITEM = "//*[@class='section-io-input']//*[text()='Outputs']/..//li/a[text()='String']";

    public static final String APPS_ADD_OUTPUT_FILE_ITEM = "//*[@class='section-io-input']//*[text()='Outputs']/..//li/a[text()='File']";

    public static final String APPS_INPUT_NAME_FIELD = "//input[contains(@placeholder, 'nter')][contains(@placeholder, 'ame')][contains(@placeholder, 'nput')]";

    public static final String APPS_INPUT_LABEL_FIELD = "//input[contains(@placeholder, 'nter')][contains(@placeholder, 'abel')][contains(@placeholder, 'nput')]";

    public static final String APPS_INPUT_HELP_FIELD = "//input[contains(@placeholder, 'nter')][contains(@placeholder, 'elp')][contains(@placeholder, 'ext')]";

    public static final String APPS_INPUT_DEFAULT_FIELD = "//input[contains(@placeholder, 'ptional')][contains(@placeholder, 'efault')]";

    public static final String APPS_OUTPUT_NAME_FIELD = "//input[contains(@placeholder, 'nter')][contains(@placeholder, 'ame')][contains(@placeholder, 'utput')]";

    public static final String APPS_OUTPUT_LABEL_FIELD = "//input[contains(@placeholder, 'nter')][contains(@placeholder, 'abel')][contains(@placeholder, 'utput')]";

    public static final String APPS_OUTPUT_HELP_FIELD = "//input[contains(@placeholder, 'nter')][contains(@placeholder, 'elp')][contains(@placeholder, 'utput')]";

    public static final String APPS_SAVED_INPUT_LABEL_VALUE = "//*[text()='Inputs']/..//p[contains(@class, 'label')]";

    public static final String APPS_SAVED_INPUT_HELP_VALUE = "//*[text()='Inputs']/..//p[contains(@class, 'help')]";

    public static final String APPS_SAVED_INPUT_DEFAULT_VALUE = "//*[text()='Inputs']/..//p[contains(@class, 'default')]";

    public static final String APPS_SAVED_OUTPUT_LABEL_VALUE = "//*[text()='Outputs']/..//p[contains(@class, 'label')]";

    public static final String APPS_SAVED_OUTPUT_HELP_VALUE = "//*[text()='Outputs']/..//p[contains(@class, 'help')]";

    public static final String APPS_JOB_RUN_OUTPUT_RESULT = "//table[contains(@class, 'output')]//td[contains(@class, 'job-io-value')]";

    public static final String APPS_SAVED_EXPORT_BUTTON = "//button/span[contains(@class, 'cloud-download')]/..";

    public static final String APPS_SAVED_EXPORT_DOCKER_LINK = "//a[contains(text(), 'Docker Container')]";

    public static final String APPS_SAVED_EXPORT_CWLTOOL_LINK = "//a[contains(text(), 'CWL Tool')]";

    public static final String APPS_SAVED_EXPORT_WDLTASK_LINK = "//a[contains(text(), 'WDL Task')]";

    public static final String APPS_JOBS_LIST_APP_LINK_TEMPLATE = "//*[@id='jobs']//a[contains(text(), '{APP_TITLE}')]";

    public static final String APPS_JOBS_LIST_JOB_LINK_TEMPLATE = "//*[@id='jobs']//a[contains(text(), '{JOB_NAME}')]";

    public static final String APPS_SAVED_APP_ASSIGN_TO_CHALLENGE_BUTTON ="//button[contains(@class, 'dropdown-toggle')]/span[contains(@class, 'trophy')]/..";

    public static final String APPS_SAVED_APP_ASSIGN_TO_CHALLENGE_ITEM_TEMPLATE = "//*[@class='dropdown-menu']//a[contains(text(), '{CHALLENGE_NAME}')]";

    public static final String APPS_SAVED_APP_CHALLENGE_TAG_TEMPLATE = "//*[@class='details-challenges']//span[text()='{CHALLENGE_NAME}']";

    public static final String APPS_TRACK_PAGE_MAIN_DIV = "//div[contains(@class, 'track-canvas')]";

    public static final String APPS_SAVED_APP_TRACK_BUTTON_LINK = "//a[contains(@href, 'track')]";

    public static final String APPS_TRACK_PAGE_APP_BLOCK = "//*[name()='svg']//a[contains(text(), '{APP_TITLE}')]";

}
