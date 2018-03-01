package precisionFDA.model;

public class SpaceProfile {

    private String spaceName;

    private String spaceDescription;

    private String spaceHostLead;

    private String spaceGuestLead;

    private String spaceType;

    private String spaceCTS;

    public SpaceProfile(final String spaceName, final String spaceDescription,
                        final String spaceHostLead, final String spaceGuestLead,
                        final String spaceType, final String spaceCTS) {
        this.spaceName = spaceName;
        this.spaceDescription = spaceDescription;
        this.spaceHostLead = spaceHostLead;
        this.spaceGuestLead = spaceGuestLead;
        this.spaceType = spaceType;
        this.spaceCTS = spaceCTS;
    }

    public String getSpaceName() {
        return spaceName;
    }

    public String getSpaceDescription() {
        return spaceDescription;
    }

    public String getSpaceHostLead() {
        return spaceHostLead;
    }

    public String getSpaceGuestLead() {
        return spaceGuestLead;
    }

    public String getSpaceType() {
        return spaceType;
    }

    public String getSpaceCTS() {
        return spaceCTS;
    }
}


