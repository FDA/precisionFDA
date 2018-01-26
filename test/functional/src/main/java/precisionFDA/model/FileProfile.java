package precisionFDA.model;

public class FileProfile {

    private String fileName;

    private String fileDescription;

    private String fileComment;

    public FileProfile(final String fileName,
                       final String fileDescription,
                       final String fileComment) {
        this.fileName = fileName;
        this.fileDescription = fileDescription;
        this.fileComment = fileComment;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFileDescription() {
        return fileDescription;
    }

    public String getFileComment() {
        return fileComment;
    }

    public void setFileName(String newName) {
        this.fileName = newName;
    }

    public void setFileDescription(String newDescr) {
        this.fileDescription = newDescr;
    }

}


