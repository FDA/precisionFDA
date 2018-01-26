package precisionFDA.model;

public class DiscProfile {

    private String discName;

    private String discRowDescr;

    private String discRichDescr;

    public DiscProfile(final String discName,
                       final String discRowDescr,
                       final String discRichDescr) {
        this.discName = discName;
        this.discRowDescr = discRowDescr;
        this.discRichDescr = discRichDescr;
    }

    public String getDiscName() {
        return discName;
    }

    public String getDiscRowDescr() {
        return discRowDescr;
    }

    public String getDiscRichDescr() {
        return discRichDescr;
    }

    //==============

    public void setDiscName(String discName) {
        this.discName = discName;
    }

    public void setDiscRowDescr(String discRowDescr) {
        this.discRowDescr = discRowDescr;
    }

    public void setDiscRichDescr(String discRichDescr) {
        this.discRichDescr = discRichDescr;
    }

}


