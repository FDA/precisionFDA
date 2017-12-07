package precisionFDA.model;

public class NewChallEntryProfile {

    private String entryName;

    private String entryDescr;

    public NewChallEntryProfile(final String entryName,
                                final String entryDescr) {
        this.entryName = entryName;
        this.entryDescr = entryDescr;
    }

    public String getEntryName() {
        return entryName;
    }

    public String getEntryDescr() {
        return entryDescr;
    }
}


