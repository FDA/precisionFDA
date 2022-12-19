package helpers

import (
	"fmt"
	"os"
	"strings"
    "text/tabwriter"
)

func PrintListSpacesHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:","Listing active spaces you have access to."}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:","list-spaces [FLAG...]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:","list-spaces --groups --private [Show all active spaces of type group or private]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","list-spaces --unactivated --json [Show only unactivated spaces and present result as JSON]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:","All flags listed below are OPTIONAL"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, --help","Show this help message and exit"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --json","Display response as JSON array"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --locked","Show only locked spaces"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --unactivated","Show only unactivated spaces"}, "\t") + "\t")
	// fmt.Fprintln(writer, strings.Join([]string{"   --protected","Show PHI protected spaces only"}, "\t") + "\t") // UNCOMMENT THIS ONCE PHI FEATURE IN PROD
	fmt.Fprintln(writer, strings.Join([]string{"   --review","Show review spaces"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --groups","Show groups spaces"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --private","Show private spaces"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --administrator","Show administrator spaces"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --government","Show government spaces"}, "\t") + "\t")
	writer.Flush()
	return 1
}


func PrintLsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:","Listing files in given location. If no location provided, root of My Home is used."}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:","ls [FLAG...]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:","ls --files --folder-id 55 [Show only files from private folder with id 55]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","ls --folders --brief [Show only folders from My Home root in brief version]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","ls --space-id 24 --folder-id 42 --json [Show content of folder with id 42 from space with id 24 and present result as JSON]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:","All flags listed below are OPTIONAL"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, --help","Show this help message and exit"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --json","Display response as JSON array"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --brief","Display a brief version of the response; Only shows ID and name"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --files","Show only files"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --folders","Show only folders"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --space-id <ID>","Execute in given space"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --folder-id <ID>","Execute in given folder"}, "\t") + "\t")
	writer.Flush()
	return 1
}

func PrintDownloadHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:","Downloading a file from pFDA."}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:","download --file-id <ID> [FLAG...]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:","download --file-id file-GJk1kpQ05xgQd8bP54kJFjzkz-1 [Downloads the file to current working directory]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","download --file-id file-GJk1kpQ05xgQd8bP54kJFjzkz-1 --output \"data/results_final.csv\" [Downloads the file to existing folder named \"data\" under new name \"results_final.csv\"]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","download --file-id file-GJk1kpQ05xgQd8bP54kJFjzkz-1 --output \"data/\" [Downloads the file to existing folder named \"data\" and keep original name]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","download --file-id file-GJk1kpQ05xgQd8bP54kJFjzkz-1 --overwrite [Downloads the file to current working directory and overwrites already existing file if it exists]"}, "\t") + "\t")

	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:","All flags listed below are OPTIONAL"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, --help","Show this help message and exit"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --output <PATH/TO/FILE>","Downloads file to given path"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --overwrite true|false","Preselect overwrite option for dialog if file with the same name already exists in the target location."}, "\t") + "\t")

	writer.Flush()
	return 1
}

func PrintUploadFileHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:","Uploading a file into given location. If no location provided, root of My Home is used."}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:","upload-file --file <PATH/TO/FILE> [FLAG...]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:","upload-file  --file script01.py [Uploads the file to the root folder of My Home]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","upload-file  --file script01.py --space-id 12 [Uploads the file to the root folder of the space]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","upload-file  --file script01.py --folder-id 10 [Uploads the file to the specified folder]"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:","All flags listed below are OPTIONAL"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, --help","Show this help message and exit"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --space-id <ID>","Uploads into the given space"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"   --folder-id <ID>","Uploads into the given folder"}, "\t") + "\t")
	writer.Flush()
	return 1
}

func PrintDescribeAppHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:","Getting details about given app."}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:","describe-app --app-id <ID>"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:","describe-app --app-id app-GJk3k5v85a4ZfgQ8bP5911Xg0-1 [Describes the app]"}, "\t") + "\t")
	writer.Flush()
	return 1
}

func PrintDescribeWorkflowHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:","Getting details about given workflow."}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:","describe-workflow --workflow-id <ID>"}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:","describe-workflow --workflow-id workflow-GJkk5v005xggB4JcB4Zf9326V-1 [Describes the workflow]"}, "\t") + "\t")
	writer.Flush()
	return 1
}

func PrintUploadAssetHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ","  "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:","Uploading an asset."}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:","upload-asset --name <NAME{.tar,.tar.gz}> --root </PATH/TO/ROOT/FOLDER> --readme <README{.txt,.md} "}, "\t") + "\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:","upload-asset --name asset01.tar.gz --root ./asset01 --readme ./readme.md [Uploads asset with root folder asset01 and readme file readme.md from current directory]"}, "\t") + "\t")
	writer.Flush()
	return 1
}