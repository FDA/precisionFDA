package precisionFDA.data;

import precisionFDA.model.WorkflowProfile;

import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

public class TestWorkflowData {

    static final String MAIN_WF_NAME_PREFIX = "AT workflow name ";

    static final String MAIN_WF_TITLE_PREFIX = "AT workflow title ";

    static final String MAIN_WF_ANALYSIS_PREFIX = "AT workflow analysis name ";

    static final String getMainWFName() {
        return MAIN_WF_NAME_PREFIX + getRunTimeLocalUniqueValue();
    }

    static final String getMainWFTitle() {
        return MAIN_WF_TITLE_PREFIX + getRunTimeLocalUniqueValue();
    }

    static final String getMainWFFirstAnalysisName() {
        return MAIN_WF_ANALYSIS_PREFIX + getRunTimeLocalUniqueValue();
    }

    public static WorkflowProfile mainWFProfile = new WorkflowProfile (
            getMainWFName(),
            getMainWFTitle(),
            getMainWFFirstAnalysisName()
    );

    public static WorkflowProfile getMainWorkflowProfile() {
        return mainWFProfile;
    }

}
