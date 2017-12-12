package precisionFDA.model;

public class WorkflowProfile {

    private String wfName;

    private String wfTitle;

    public WorkflowProfile(final String wfName,
                           final String wfTitle) {
        this.wfName = wfName;
        this.wfTitle = wfTitle;
    }

    public String getWfName() {
        return wfName;
    }

    public String getWfTitle() {
        return wfTitle;
    }
}


