package precisionFDA.model;

public class WorkflowProfile {

    private String wfName;

    private String wfTitle;

    private String wfFirstAnalysisName;

    public WorkflowProfile(final String wfName,
                           final String wfTitle,
                           final String wfFirstAnalysisName) {
        this.wfName = wfName;
        this.wfTitle = wfTitle;
        this.wfFirstAnalysisName = wfFirstAnalysisName;
    }

    public String getWfName() {
        return wfName;
    }

    public String getWfTitle() {
        return wfTitle;
    }

    public String getWfFirstAnalysisName() {
        return wfFirstAnalysisName;
    }
}


