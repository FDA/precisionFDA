package precisionFDA.locators;

public class WorkflowLocators {

    public static final String ADD_STAGE_BUTTON = "//button[contains(text(), 'Add Stage')]";

    public static final String CREATE_WF_BUTTON_LINK = "//a[contains(text(), 'Create Workflow')]";

    public static final String NEW_WF_FORM_NAME_INPUT = "//input[contains(@placeholder, 'Enter Workflow name')]";

    public static final String NEW_WF_FORM_TITLE_INPUT = "//input[contains(@placeholder, 'Enter workflow title')]";

    public static final String NEW_WF_ADD_STAGE_MODAL_FILTER_INPUT = "//*[contains(@class, 'modal')]//*[@id='all-apps']//input[contains(@placeholder, 'ilter')]";

    public static final String NEW_WF_ADD_STAGE_INPUTS_LABEL = "//*[contains(@class, 'modal')]//*[@id='all-apps']//*[contains(text(), '{APP_NAME}')]/../..//*[contains(text(), 'Inputs')]";

    public static final String NEW_WF_ADD_STAGE_ADD_LINK = "//*[contains(@class, 'modal')]//*[@id='all-apps']//a[contains(text(), 'Add')]";

    public static final String NEW_WF_ADD_STAGE_MODAL_CLOSE_BUTTON = "//*[contains(@class, 'modal')]//*[@id='build-workflow-modal']//button[text()='Close']";

    public static final String WORKFLOW_APP_BLOCK_LINK = "//a//*[contains(text(), '{APP_NAME}')][contains(@class, 'gear')]";


}
