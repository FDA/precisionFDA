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

    public static final String WORKFLOW_APP_SETTINGS_MODAL_INSTANCE_SELECTOR = "//*[@id='configure-stage-modal']//select[@name='instance_type']";

    public static final String WORKFLOW_APP_SETTINGS_MODAL_FIRST_INPUT_REQUIRED = "//*[@id='configure-stage-modal']//*[contains(@class, 'padded')][1]//input[@type='checkbox']";

    public static final String WORKFLOW_APP_SETTINGS_MODAL_CLOSE_BUTTON = "//*[@id='configure-stage-modal']//button[text()='Close']";

    public static final String WORKFLOW_UPDATE_WF_BUTTON = "//button[text()='Update']";

    public static final String WORKFLOW_CREATE_WF_BUTTON = "//button[text()='Create']";

    public static final String CREATED_WF_DIAGRAM_LINK = "//a/*[text()='Workflow Diagram']/..";

    public static final String CREATED_WF_APP_NAME_INPUT_TEMPLATE = "//*[text()='Inputs']/..//i[contains(text(), '{APP_NAME}')]";

    public static final String RUN_WF_BUTTON = "//*[contains(text(), 'Run Workflow')][contains(@class, 'btn')]";

    public static final String RUN_WF_CONFIG_ANALISYS_NAME_INPUT = "//label[text()='Analysis Name']/..//input";

    public static final String LINK_TO_CREATED_WORKFLOW_TEMPLATE = "//a/*[text()='{WF_TITLE}']/..";

    public static final String RUN_WF_CONFIG_APP_INPUT_TEMPLATE = "//*[text()='Inputs']/../..//*[text()='{APP_NAME}']";

    public static final String RUN_WF_CONFIG_SELECT_FILE_BUTTON = "//button[contains(text(), 'Select file')]";

    public static final String RUN_WF_CONFIG_MODAL_FILES_LINK = "//*[contains(@class, 'modal-content')]//li/a/*[text()='Files']/..";

    public static final String RUN_WF_CONFIG_MODAL_APP_INPUT_FILE_TEMPLATE = "//*[contains(@class, 'modal-content')]//*[text()='{FILE_NAME}']";

    public static final String RUN_WF_CONFIG_MODAL_SELECT_BUTTON = "//*[contains(@class, 'modal-content')]//button/*[text()='Select']/..";

    public static final String RUN_WF_CONFIG_SELECTED_INPUT_FILE_TEMPLATE = "//*[text()='Inputs']/../..//button[text()='{FILE_NAME}']";

    public static final String CREATED_WF_ANALYSES_WF_TITLE = "//*[contains(@id, 'analysis')]/td[text()='{WF_TITLE}']";

    public static final String RUN_WF_CONFIG_ANALYSIS_NAME_INPUT = "//*[contains(@class, 'form')]//label[text()='Analysis Name']/..//input";

    public static final String RUN_WF_CONFIG_ANALYSIS_STATUS = "//td[text()='{ANALYSIS_NAME}']/../td[contains(@class, 'state')]";

}
