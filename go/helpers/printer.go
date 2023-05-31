package helpers

import (
	"fmt"
	"os"
	"strings"
	"text/tabwriter"
)

func PrintListSpacesHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:", "Listing active spaces you have access to."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:", "list-spaces [FLAG...]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:", "list-spaces -groups -private [Show all active spaces of type group or private]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "list-spaces -unactivated -json [Show only unactivated spaces and present result as JSON]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:", "All flags listed below are OPTIONAL"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, -help", "Show this help message and exit"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -json", "Display response as JSON array"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -locked", "Show only locked spaces"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -unactivated", "Show only unactivated spaces"}, "\t")+"\t")
	// fmt.Fprintln(writer, strings.Join([]string{"   -protected","Show PHI protected spaces only"}, "\t") + "\t") // UNCOMMENT THIS ONCE PHI FEATURE IN PROD
	fmt.Fprintln(writer, strings.Join([]string{"   -review", "Show review spaces"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -groups", "Show groups spaces"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -private", "Show private spaces"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -administrator", "Show administrator spaces"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -government", "Show government spaces"}, "\t")+"\t")
	writer.Flush()
	return 1
}

func PrintLsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:", "Listing files in given location. If no location provided, root of My Home is used."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"      ", "Public files are not listed by default."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:", "ls [FLAG...]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:", "ls -files -folder-id 55 [Show only files from private folder with id 55]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "ls -folders -brief [Show only folders from My Home root in brief version]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "ls -space-id 24 -folder-id 42 -json [Show content of folder with id 42 from space with id 24 and present result as JSON]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:", "All flags listed below are OPTIONAL"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, -help", "Show this help message and exit"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -json", "Display response as JSON array"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -brief", "Display a brief version of the response; Only shows ID and name"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -files", "Display only files"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -folders", "Display only folders"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -space-id <ID>", "Execute in given space"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -folder-id <ID>", "Execute in given folder"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -public", "Display only public files"}, "\t")+"\t")
	writer.Flush()
	return 1
}

func PrintDownloadHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:", "Downloading a file or folder from pFDA. If you want download root of My Home or a space (has no folder-id), use flag \"-folder-id root\"."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "Supports downloading multiple files - simply pass them as positional args before any flags (check examples)."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "For files you can use either filename or file-id - name might not be unique, file-id always is."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "Filename wildcards are supported, use \"?\" for exactly 1 char, \"*\" for 0 or more characters. \n"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "By default, folder download only applies to top level files. Use flag \"-recursive\" to download whole folder content."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "If you want to download content of a public folder, use flag -public together with the command."}, "\t")+"\t")

	fmt.Fprintln(writer, strings.Join([]string{"  Usage:", "download <FILE-ID> [FLAG...] OR download <FILENAME> [FLAG...] OR download -folder-id <ID> [FLAG]\n"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:", "download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 [Downloads the file to current working directory]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 -output \"data/results_final.csv\" [Downloads the file to existing folder named \"data\" with new name \"results_final.csv\"]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "download outputs_334_1.csv -output \"data/results_final.csv\" [Downloads the file to existing folder named \"data\" with new name \"results_final.csv\"]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 -output \"data/\" [Downloads the file to existing folder named \"data/\" and keep original name]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 -overwrite true [Downloads the file to current working directory and overwrites already existing file]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "download -folder-id 1222 -output \"my_outputs/\" -overwrite true [Downloads folder content to existing folder named \"my_outputs/ and overwrites already existing files]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "download -folder-id 2221 -space-id 123 -overwrite false [Downloads space's folder content to current working directory and skip files that already exists there]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "download -folder-id 3333 -public [Downloads all files from given public folder]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "download -folder-id root -space-id 123 -recursive [Recursively downloads space's folder content to current working directory]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "download -folder-id root -overwrite true [Downloads top level content of 'My Home' to current working directory and overwrites already existing files if exist]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "download 'data*.csv' -folder-id 1222 -overwrite true [Downloads only CSV files with 'data' in their name from folder (id:1222) and overwrites already existing files if exist]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 file-YZm9QpQ0b69Qd8bP454kmcf76-2 [Downloads multiple files to the current working directory]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "download results.csv results_final.csv -folder-id 2221 [Downloads multiple files by name from folder (id:2221) to the current working directory]"}, "\t")+"\t")

	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:", "All flags listed below are OPTIONAL"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, -help", "Show this help message and exit"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -output <PATH/TO/FILE>", "Downloads file to given path"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -overwrite true|false", "Preselect overwrite option for dialog if path already exists in the target location."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -recursive", "Recursively download content of selected folder."}, "\t")+"\t")

	writer.Flush()
	return 1
}

func PrintUploadFileHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:", "Uploading a file or folder into given location. If no location provided, root of My Home is used."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "Supports uploading multiple files - simply pass them as positional args before any flags (check examples).\n"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "Supports uploading via stdin (piped input) - requires setting -name flag (check examples).\n"}, "\t")+"\t")

	fmt.Fprintln(writer, strings.Join([]string{"  Usage:", "upload-file <PATH/TO/FILE> [FLAG...]\n"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:", "upload-file script01.py [Uploads the file to the root folder of My Home]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "upload-file script01.py -space-id 12 [Uploads the file to the root folder of the space]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "upload-file script01.py -folder-id 10 [Uploads the file to the specified folder]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "upload-file data_folder/ -folder-id 10 [Uploads the folder and its content to the specified folder]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "upload-file script01.py info/readme.txt data_folder/ -folder-id 111 [Uploads multiple files to the specified folder]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "upload-file script01.py parser.py validator.py -space-id 21 [Uploads multiple files to the specified space]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "upload-file script01.py parser.py validator.py -space-id 21 -folder-id 222 [Uploads multiple files to the specified space's folder]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "upload-file -name piped_file.csv [Uploads file with given name provided via stdin]"}, "\t")+"\t")

	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:", "All flags listed below are OPTIONAL"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, -help", "Show this help message and exit"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -space-id <ID>", "Uploads into the given space"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -folder-id <ID>", "Uploads into the given folder"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -name <NAME>", "Uploads stdin file with given name [required for stdin input]"}, "\t")+"\t")
	writer.Flush()
	return 1
}

func PrintDescribeAppHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:", "Getting details about given app."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:", "describe-app -app-id <ID>"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:", "describe-app -app-id app-GJk3k5v85a4ZfgQ8bP5911Xg0-1 [Describes the app]"}, "\t")+"\t")
	writer.Flush()
	return 1
}

func PrintDescribeWorkflowHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:", "Getting details about given workflow."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:", "describe-workflow -workflow-id <ID>"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:", "describe-workflow -workflow-id workflow-GJkk5v005xggB4JcB4Zf9326V-1 [Describes the workflow]"}, "\t")+"\t")
	writer.Flush()
	return 1
}

func PrintUploadAssetHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:", "Uploading an asset."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:", "upload-asset -name <NAME{.tar,.tar.gz}> -root </PATH/TO/ROOT/FOLDER> -readme <README{.txt,.md} "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:", "upload-asset -name asset01.tar.gz -root ./asset01 -readme ./readme.md [Uploads asset with root folder asset01 and readme file readme.md from current directory]"}, "\t")+"\t")
	writer.Flush()
	return 1
}

func PrintMkdirHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:", "Creating a folder."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:", "mkdir <NAME> [FLAG...] "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:", "mkdir DATA [Created new folder named DATA in your My Home section]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "mkdir DATA -space-id 12 [Creates a new folder named DATA in root of the space]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "mkdir DATA scripts results -folder-id 2221 [Creates 3 new folders in folder (id:2221)]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "mkdir scripts/python/v1 scripts/python/v2 -p [Creates the given folder structure]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:", "All flags listed below are OPTIONAL"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -space-id <ID>", "Create the folder in the given space"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -folder-id <ID>", "Create the folder in the given folder"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -p, -parents", "Create parent directories as needed, no error if existing"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, -help", "Show this help message and exit"}, "\t")+"\t")

	writer.Flush()
	return 1
}

func PrintRmHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:", "Removing a file."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:", "rm <FILE-ID> [FLAG...] OR rm <NAME> [FLAG...] "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:", "rm file-GJk1kpQ05xgQd8bP54kJFjzkz-1 [Removes file with given id]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "rm file-GJk1kpQ05xgQd8bP54kJFjzkz-1 file-YZm9QpQ0b69Qd8bP454kmcf76-2 [Removes multiple files given by ids]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "rm inputs_01.csv inputs_02.csv -folder-id 2221 [Removes multiple files given by names in folder (id:2221)]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "rm 'inputs*.csv' -space-id 12 [Removes all CSV files with 'inputs' in their name from root of given space]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "rm '*.txt' -space-id 12 -folder-id 1212 [Removes all txt files with from the folder of given space]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:", "All flags listed below are OPTIONAL"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -space-id <ID>", "Execute in given space"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -folder-id <ID>", "Execute in given folder"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, -help", "Show this help message and exit"}, "\t")+"\t")

	writer.Flush()
	return 1
}

func PrintRmdirHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:", "Deleting a folder. Only empty folders are allowed to be deleted."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:", "rmdir <FOLDER-ID> [FLAG...] "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:", "rmdir 2221 [Removes folder (id:2221)] "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "rmdir 2221 2332 2333 [Removes folders with given ids if empty] "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:", "All flags listed below are OPTIONAL"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, -help", "Show this help message and exit"}, "\t")+"\t")

	writer.Flush()
	return 1
}

func PrintCatHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:", "Display content of a file."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:", "cat <FILE-ID>"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:", "cat file-GJk1kpQ05xgQd8bP54kJFjzkz-1 [Prints content of the given file] "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:", "All flags listed below are OPTIONAL"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, -help", "Show this help message and exit"}, "\t")+"\t")

	writer.Flush()
	return 1
}

func PrintHeadHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:", "Display first lines of a file. By default, fist 10 lines are displayed."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:", "head <FILE-ID> [FLAGS...]"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:", "head file-GJk1kpQ05xgQd8bP54kJFjzkz-1 [Prints first 10 lines of the given file] "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{" ", "head file-GJk1kpQ05xgQd8bP54kJFjzkz-1 -lines 50 [Prints first 50 lines of the given file] "}, "\t")+"\t")

	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:", "All flags listed below are OPTIONAL"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -lines", "Alter number of lines to display"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, -help", "Show this help message and exit"}, "\t")+"\t")

	writer.Flush()
	return 1
}

func PrintGetSpaceIdHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  For:", "Display space ID of current workstation's context."}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Usage:", "get-space-id"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Examples:", "get-space-id [Prints integer representing id of current space] "}, "\t")+"\t")

	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  Flags:", "All flags listed below are OPTIONAL"}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"  ", "  "}, "\t")+"\t")
	fmt.Fprintln(writer, strings.Join([]string{"   -h, -help", "Show this help message and exit"}, "\t")+"\t")

	writer.Flush()
	return 1
}

func PrintError(err error) {
	fmt.Println()
	fmt.Println(err)
}
