package precisionFDA.data;

import precisionFDA.model.NewChallEntryProfile;
import precisionFDA.model.WorkflowProfile;

import static precisionFDA.utils.Utils.getRunTimeLocalUniqueValue;

public class TestWorkflowData {

    static final String MAIN_WF_NAME_PREFIX = "AT workflow name ";

    static final String MAIN_WF_TITLE_PREFIX = "AT workflow title ";


    static final String getMainWFName() {
        return MAIN_WF_NAME_PREFIX + getRunTimeLocalUniqueValue();
    }

    static final String getMainWFTitle() {
        return MAIN_WF_TITLE_PREFIX + getRunTimeLocalUniqueValue();
    }


    public static WorkflowProfile mainWFProfile = new WorkflowProfile (
            getMainWFName(),
            getMainWFTitle()
    );

    public static WorkflowProfile getMainWorkflowProfile() {
        return mainWFProfile;
    }

}
