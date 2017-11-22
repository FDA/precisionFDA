package precisionFDA.utils;

import org.apache.log4j.Logger;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.*;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Random;
import java.util.TimeZone;

import static precisionFDA.data.TestDict.*;
import static precisionFDA.data.TestFilesData.*;
import static precisionFDA.data.TestRunData.*;

public class Utils {

    static final String TEST_TEXT_FILE_NAME = "textFile.txt";

    static final String TEST_PNG_FILE_NAME = "pngFile.png";

    public static String getTestTextTemplateFileName() {
        return TEST_TEXT_FILE_NAME;
    }

    public static String getTestPngTemplateFileName() {
        return TEST_PNG_FILE_NAME;
    }

    public static String getCurrentDateTimeValue(String timeZone) {
        Date d = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        dateFormat.setTimeZone(TimeZone.getTimeZone(timeZone));
        String date = dateFormat.format(d);
        return date;
    }

    public static String getRunTimeLocalUniqueValue() {
        Date d = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd_MM_HHmmssSSS");
        String salt = dateFormat.format(d);
        return salt;
    }

    public static String applyTimezoneToDate(String dateString, String timezoneOfTheDate, String desiredTimezone) {
        Logger log = Logger.getLogger("INFO");

        SimpleDateFormat dateFormatOld = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        dateFormatOld.setTimeZone(TimeZone.getTimeZone(timezoneOfTheDate));

        SimpleDateFormat dateFormatNew = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        dateFormatNew.setTimeZone(TimeZone.getTimeZone(desiredTimezone));

        Date oldDate;
        String newDateString = "";
        try {
            oldDate = dateFormatOld.parse(dateString);
            newDateString = dateFormatNew.format(oldDate);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        log.info("date was converted from [" + dateString + "] to [" + newDateString + "]");
        return newDateString;
    }

    public static String getTimeStamp() {
        Date d = new Date();
        SimpleDateFormat dateFormat = new SimpleDateFormat("HH:mm:ss");
        String stamp = "[" + dateFormat.format(d) + "]";
        return stamp;
    }

    public static void createFolder(String folderPath) {
        Logger log = Logger.getLogger("INFO");
        File file = new File(folderPath);
        if (!file.exists()) {
            file.mkdir();
            log.info("folder created: " + folderPath);
        }
    }

    public static void createFile(String folderPath, String content) throws IOException {
        File file = new File(folderPath);
        file.createNewFile();
        FileWriter fw = new FileWriter(file.getAbsoluteFile());
        BufferedWriter bw = new BufferedWriter(fw);
        bw.write(content);
        bw.close();
    }

    public static String getPageSource(WebDriver driver) {
        return driver.getPageSource();
    }

    public static long getDifferenceBetweenDateTime(String dateTime1, String dateTime2) {
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

        Date d1 = null;
        Date d2 = null;
        long diffSec = 999;

        try {
            d1 = format.parse(dateTime1);
            d2 = format.parse(dateTime2);
            long diffMsec = d2.getTime() - d1.getTime();
            diffSec = Math.abs(diffMsec/1000);
        } catch (Exception e) {
            e.printStackTrace();
            diffSec = 1000;
        }
        return diffSec;
    }

    public static String isDateTimeCorrect(String actTime, String expTime) {
        final Logger log = Logger.getLogger("");
        long possibleDelta = 10;
        String textResult = "";
        Long delta = Utils.getDifferenceBetweenDateTime(actTime, expTime);
        if (delta <= possibleDelta) {
            textResult = getDictTrue();
        }
        else {
            textResult = "Too big difference between displayed [" + actTime + "] and expected [" + expTime + "] | delta is: " + delta + " seconds";
            log.error(textResult);
        }
        return textResult;
    }

    public static String getGeneratedTestFileName(String type) {
        final Logger log = Logger.getLogger("");
        String runTime = getRunTimeLocalUniqueValue();
        String newFileName = runTime;
        String templateFileName = "";

        if (type.equals(getDictTxt())) {
            newFileName = "text_file_" + runTime + getRandom() + ".txt";
            templateFileName = getTestTextTemplateFileName();
        }

        if (type.equals(getDictPng())) {
            newFileName = "png_file_" + runTime + getRandom() + ".png";
            templateFileName = getTestPngTemplateFileName();
        }

        if (type.equals(getDictFilter() + "#1")) {
            newFileName = "png_" + getFirstFilterPhrase() + "_" + runTime + getRandom() + ".png";
            templateFileName = getTestPngTemplateFileName();
        }

        if (type.equals(getDictFilter() + "#2")) {
            newFileName = "txt_" + getSecondFilterPhrase() + "_" + runTime + getRandom() + ".txt";
            templateFileName = getTestTextTemplateFileName();
        }

        if (type.equals(getDictFilter())) {
            newFileName = "txt_" + getCommonFilterPhrase() + "_" + runTime + getRandom() + ".txt";
            templateFileName = getTestTextTemplateFileName();
        }

        InputStream oInStream = null;
        OutputStream oOutStream = null;

        try {
            oInStream = new FileInputStream(getPathToTestFilesFolder() + templateFileName);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
        try {
            oOutStream = new FileOutputStream(getPathToTempFilesFolder() + newFileName);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }

        byte[] oBytes = new byte[1024];
        int nLength;
        BufferedInputStream oBuffInputStream = new BufferedInputStream( oInStream );
        try {
            while ((nLength = oBuffInputStream.read(oBytes)) > 0)
            {
                oOutStream.write(oBytes, 0, nLength);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            oInStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            oOutStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        log.info("created file: " + newFileName);
        return newFileName;
    }

    public static void deleteTempFiles() {
        final Logger log = Logger.getLogger("");
        log.info("deleting temp files");
        deleteTempFilesByExt(".txt");
        deleteTempFilesByExt(".png");
        deleteFileByPartialName(getDockerFileName(), getPathToTempFilesFolder());
    }

    public static void deleteTempFilesByExt(String ext) {
        GenericExtFilter filter = new GenericExtFilter(ext);
        File fileDir = new File(getPathToTempFilesFolder());

        //list out all the file name with .txt extension
        String[] list = fileDir.list(filter);

        if (list.length == 0) return;

        File fileDelete;

        for (String file : list){
            String temp = new StringBuffer(getPathToTempFilesFolder())
                    .append(File.separator)
                    .append(file).toString();
            fileDelete = new File(temp);
            fileDelete.delete();
        }
    }

    public static class GenericExtFilter implements FilenameFilter {

        private String ext;

        public GenericExtFilter(String ext) {
            this.ext = ext;
        }

        public boolean accept(File dir, String name) {
            return (name.endsWith(ext));
        }
    }

    public static String generateExpectedBreadcrumbs(String rootFolderName, String firstLevelFolderName, String secondLevelFolderName) {
        String br = getDictMyFiles();
        if (rootFolderName.length() > 0) {
            br = br + " / " + rootFolderName;
        }
        if (firstLevelFolderName.length() > 0) {
            br = br + " / " + firstLevelFolderName;
        }
        if (secondLevelFolderName.length() > 0) {
            br = br + " / " + secondLevelFolderName;
        }
        return br;
    }
    public static String generateTestTextFileName() {
        return getGeneratedTestFileName("txt");
    }

    public static String generateTestPngFileName() {
        return getGeneratedTestFileName("png");
    }

    public static void removeDockerFileFromDownloads() {
        removeSameFileFromDownloads(getDockerFileName());
    }

    public static void removeSameFileFromDownloads(String fileName) {
        String downloadsPath = getPathToDownloadsFolder();
        String newFileName = downloadsPath + "old_" + getRunTimeLocalUniqueValue() + fileName;
        renameFile(downloadsPath, fileName, newFileName);
    }

    public static void renameFile(String pathToFile, String oldFileName, String newFileName) {
        Logger log = Logger.getLogger("INFO");
        File file = new File(pathToFile + oldFileName);
        file.renameTo(new File(newFileName));
        log.info("file [" + oldFileName + "] is renamed to [" + newFileName + "]");
    }

    public static void deleteFileByPartialName(String namePart, String folderPath) {
        final File folder = new File(folderPath);
        for (File f : folder.listFiles()) {
            if (f.getName().contains(namePart)) {
                f.delete();
            }
        }
    }

    public static String generateUpdatedName(String oldFileName) {
        return "upd_" + getRunTimeLocalUniqueValue() + oldFileName;
    }

    public static void waitUntilFileIsDownloaded(String filePath) {
        final Logger log = Logger.getLogger("");
        int timeoutSec = 15;
        int refreshStepSec = 1;
        int spentTimeSec = 0;

        File file = new File(filePath);

        log.info("waiting up to " + timeoutSec + " sec until file [" + filePath + "] is downloaded");
        while ( !file.exists() && (spentTimeSec < timeoutSec) ) {
            sleep(refreshStepSec*1000);
            spentTimeSec = spentTimeSec + refreshStepSec;
            log.info("it's been " + spentTimeSec + " seconds");
        }
        if (!file.exists()) {
            log.info("[WARNING] the file was not downloaded after " + timeoutSec + " seconds");
        }
    }

    public static void sleep(final long msec) {
        try {
            Thread.sleep(msec);
        } catch (final InterruptedException e) {
            //
        }
    }

    public static void wgetFile(String url) {
        final Logger log = Logger.getLogger("");
        String[] array = url.split("/");
        String fileName = array[array.length - 1];
        log.info("trying to download file [" + fileName + "] from [" + url + "]");
        String command = "wget -O " + getPathToDownloadsFolder() + fileName + " " + url;
        try {
            Runtime.getRuntime().exec( command ).waitFor();
        } catch (InterruptedException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }
        waitUntilFileIsDownloaded(getPathToDownloadsFolder() + fileName);
    }

    public static void printCaseStatus(String caseStatus, String caseName, String suiteName) {
        final Logger log = Logger.getLogger("");
        printLine();
        log.info("-- it was test case [" + caseName + "] from suite [" + suiteName + "] --");
        printLine();
        log.info("--      " + caseStatus.toUpperCase() + "      --");
        printLine();
    }
    public static void printTestHeader(final String text) {
        final Logger log = Logger.getLogger("");
        printLine();
        log.info(text);
        printLine();
    }

    public static void printLine() {
        final Logger log = Logger.getLogger("");
        log.info("----------------------------------------------------------------");
    }

    public static void takeScreenshot(String filePath, WebDriver driver) {
        if (isScreenshotFeatureOn()) {
            final Logger log = Logger.getLogger(getDictInfo().toUpperCase());
            File scrFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            try {
                org.apache.commons.io.FileUtils.copyFile(scrFile, new File(filePath));
                log.info("screenshot is here: " + filePath);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public static String getRandom() {
        Random rand = new Random();
        return "" + rand.nextInt(1000);
    }


}
