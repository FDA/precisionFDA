package precisionFDA.locators;

public class ExpertsLocators {

    public static final String EXPERTS_MAIN_DIV = "//*[contains(@class, 'pfda-controller-experts')]";

    public static final String EXPERTS_ACTIVATED_ICON = "//*[@class='active']/a[@href='/experts']";

    public static final String CREATE_EXPERT_BUTTON_ON_EXPERTS_PAGE = "//a[@href='/experts/new']";

    public static final String CREATE_EXPERT_BUTTON_ON_NEW_EXPERT_FORM = "//input[@value='Create Expert']";

    public static final String CREATE_EXPERT_FORM_USERNAME_SELECT = "//select[@id='expert_username']";

    public static final String CREATE_EXPERT_FORM_PREFERRED_INPUT = "//textarea[@id='expert__prefname']";

    public static final String CREATE_EXPERT_FORM_ABOUT_INPUT = "//textarea[@id='expert__about']";

    public static final String CREATE_EXPERT_FORM_BLOG_TITLE_INPUT = "//textarea[@id='expert__blog_title']";

    public static final String CREATE_EXPERT_FORM_BLOG_INPUT = "//textarea[@id='expert__blog']";

    public static final String CREATE_EXPERT_FORM_PREVIEW_INPUT = "//textarea[@id='expert__challenge']";

    public static final String CREATE_EXPERT_FORM_VISIBILITY_SELECT = "//select[@id='expert_scope']";

    public static final String CREATE_EXPERT_FORM_UPLOAD_IMAGE_BUTTON = "//button[text()='Upload image']";

    public static final String CREATE_EXPERT_IMAGE_UPLOAD_BROWSE_VISIBLE_BUTTON = "//*[@id='image-upload-modal']//*[contains(@class, 'browse-files')]";

    public static final String CREATE_EXPERT_IMAGE_UPLOAD_BROWSE_INPUT = "//input[@class='event-browse-files']";

    public static final String CREATE_EXPERT_IMAGE_UPLOAD_BUTTON = "//button[contains(@class, 'btn btn-success btn-lg event-upload-image')]";

    public static final String CREATE_EXPERT_IMAGE_UPLOAD_COMPLETE = "//*[text()='Upload(s) complete']";

    public static final String CREATE_EXPERT_IMAGE_UPLOAD_COMPLETE_OK_BUTTON = "//button[text()='OK']";

    public static final String CREATE_EXPERT_ALERT_SUCCESS = "//*[contains(@class, 'alert-success')]";

    public static final String CREATED_EXPERT_COMMON_LINK = "//*[@class='pfda-card-title']/a";

    public static final String CREATED_EXPERT_COMMON_IMAGE = "//img[contains(@src, '{EXPERT_IMAGE_FILE_NAME}')]";

    public static final String CREATED_EXPERT_PAGE_VIEW_DASHBOARD = "//a/span[contains(@class, 'dashboard')]";

    public static final String CREATED_EXPERT_PAGE_PUBLICPRIVATE_LABEL = "//*[contains(@class, 'label')]/*[contains(@class, 'eye')]/..";

    public static final String CREATED_EXPERT_PAGE_OPENCLOSED_LABEL = "//*[contains(@class, 'label')]/*[contains(@class, 'check')]/..|//*[contains(@class, 'label')]/*[contains(@class, 'lock')]/..";

    public static final String CREATED_EXPERT_PAGE_ABOUT = "//*[contains(@class, 'expert-intro')]";

    public static final String CREATED_EXPERT_DASHBOARD_EDIT_LINK = "//a[contains(@href, 'edit')]/*[contains(@class, 'pencil')]/..";

    public static final String EDIT_EXPERT_UPDATE_BUTTON = "//input[@value='Update']";

    public static final String EXPERT_PAGE_ASK_QUESTION_BUTTON = "//a[contains(@data-target, 'ask-question')]";

    public static final String EXPERT_PAGE_OPENCLOSED_BUTTON = "//button[contains(@class, 'dropdown')]/span[@class='caret']/..";

    public static final String EXPERT_PAGE_OPEN_EXPERT_ITEM = "//*[@class='dropdown-menu']/li/a[contains(@href, 'open')]";

    public static final String EXPERT_PAGE_CLOSE_EXPERT_ITEM = "//*[@class='dropdown-menu']/li/a[contains(@href, 'close')]";

    public static final String EXPERT_QUESTION_POPUP_TEXTAREA = "//textarea[@id='expert_question']";

    public static final String EXPERT_QUESTION_POPUP_SUBMIT_BUTTON = "//button[text()='Submit']";

    public static final String EXPERT_YOUR_QUESTIONS_COMMON = "//ul[@class='list-group']/li[@class='list-group-item']";

    public static final String EXPERT_OPEN_QUESTION_LINK_COMMON_WHEN_NO_ANSWERED = "//*[contains(text(), 'Open Question')]/following-sibling::a";

    public static final String EXPERT_OPEN_QUESTION_LINK_COMMON_WHEN_ANSWERED = "//*[preceding::*[contains(text(), 'Open Quest')]][following::*[contains(text(), 'Answered Quest')]]";

    public static final String EXPERT_ANSWERED_QUESTION_LINK_COMMON = "//*[contains(text(), 'Answered Question')]/following-sibling::a";

    public static final String EXPERT_COMMON_QUESTION_LINK_DASHBOARD = "//a[contains(@class, 'item')][text()='{QUESTION}']";

    public static final String EXPERT_COMMON_QUESTION_ACTIVE_LINK_DASHBOARD = "//a[contains(@class, 'item')][contains(@class, 'active')][text()='{QUESTION}']";

    public static final String EXPERT_QA_FORM_ANSWER_TEXTAREA = "//textarea[@id='expert_question_answer']";

    public static final String EXPERT_QA_FORM_QUESTION_TEXTAREA = "//textarea[@id='expert_question_body']";

    public static final String EXPERT_ANSWER_QUESTION_SUBMIT_ANSWER_BUTTON = "//input[@value='Submit Answer']";

    public static final String EXPERT_QUESTION_POPUP_UPDATE_BUTTON = "//input[@value='Update Answer']";

    public static final String EXPERT_ANSWERED_QUESTIONS_LINKS_FOR_SUBMITTER_COMMON = "//*[contains(@class, 'expert-question')][contains(text(), 'nswered')]/../*[@class='expert-question-body']";

    public static final String EXPERT_ANSWERED_QUESTIONS_PAGE_ANSWER = "//*[@class='expert-question']/*[@class='expert-blog-text']/p";

    public static final String EXPERT_OPEN_QUESTIONS_LIST_TITLE = "//*[contains(text(), 'Open Questions')]";

    public static final String EXPERT_ANSWERED_QUESTIONS_LIST_TITLE = "//*[contains(text(), 'Answered Questions')]";


}
