package staging.model;

public class FilesProfile {

    private String fileInRoot;

    private String fileInRootDescription;

    private String fileInFirstLevelFolder;

    private String fileInSecondLevelFolder;

    private String firstLevelFolder;

    private String secondLevelFolder;

    public FilesProfile(final String fileInRootFolder, final String fileInRootDescription, final String fileInFirstLevelFolder,
                        final String fileInSecondLevelFolder, final String firstLevelFolder, final String secondLevelFolder) {
        this.fileInRoot = fileInRootFolder;
        this.fileInRootDescription = fileInRootDescription;
        this.fileInFirstLevelFolder = fileInFirstLevelFolder;
        this.fileInSecondLevelFolder = fileInSecondLevelFolder;
        this.firstLevelFolder = firstLevelFolder;
        this.secondLevelFolder = secondLevelFolder;
    }

    public String getFileInRoot() {
        return fileInRoot;
    }

    public String getFileInRootDescription() {
        return fileInRootDescription;
    }

    public String getFileInFirstLevelFolder() {
        return fileInFirstLevelFolder;
    }

    public String getFileInSecondLevelFolder() {
        return fileInSecondLevelFolder;
    }

    public String getFirstLevelFolder() {
        return firstLevelFolder;
    }

    public String getSecondLevelFolder() {
        return secondLevelFolder;
    }

    public void setFileInRoot(String newName) {
        this.fileInRoot = newName;
    }
}


