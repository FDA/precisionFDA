package helpers

import (
	"fmt"
	"os"
	"strings"
	"text/tabwriter"
)

// Function type for writing a line to a tabwriter
type lineWriterFunc func(left, right string)

// Create a line writer for a given writer
func newLineWriter(writer *tabwriter.Writer) lineWriterFunc {
	return func(left, right string) {
		fmt.Fprintln(writer, strings.Join([]string{left, right}, "\t")+"\t")
	}
}

func PrintLsSpacesHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing active spaces you have access to.\n")
	writeLine("  Usage:", "ls-spaces [FLAG...] | list-spaces [FLAG...]\n")
	writeLine("  Examples:", "ls-spaces -groups -private [Shows all active spaces of type groups or private]")
	writeLine("  ", "ls-spaces -unactivated -json [Shows only unactivated spaces and present result as JSON]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -locked", "Shows only locked spaces")
	writeLine("   -unactivated", "Shows only unactivated spaces")
	// writeLine("   -protected", "Show PHI protected spaces only") // UNCOMMENT THIS ONCE PHI FEATURE IN PROD
	writeLine("   -review", "Shows only review spaces")
	writeLine("   -groups", "Shows only groups spaces")
	writeLine("   -private", "Shows only private spaces")
	writeLine("   -administrator", "Shows only administrator spaces")
	writeLine("   -government", "Shows only government spaces")
	writeLine("   -json", "Displays response as JSON array")

	writer.Flush()
	return 0
}

func PrintLsMembersHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing members of a specified space.\n")
	writeLine("  Usage:", "ls-members -space-id <SPACE_ID> \n")
	writeLine("  Example:", "ls-members -space-id 27 [Lists all members of the specified space]\n")
	writeLine("  Flags:", "The following flags are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exits")
	writeLine("   -space-id <ID>", "Lists executions in the specified space")

	writer.Flush()
	return 0
}

func PrintLsDiscussionsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)
	writeLine("  ", "  ")
	writeLine("  For:", "Listing discussions in a given space. Always responds in JSON format.\n")
	writeLine("  Usage:", "ls-discussions [FLAG...]\n")
	writeLine("  Example:", "ls-discussions -space-id 27 [Lists all discussions in the specified space]\n")
	writeLine("  Flags: ", "The following flags are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exits")
	writeLine("   -space-id <ID>", "Lists discussions in the specified space")

	writer.Flush()
	return 0
}

func PrintLsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing files in a given location. If no location provided, the root of My Home is used.")
	writeLine("      ", "Public files are not listed by default.\n")
	writeLine("  Usage:", "ls [FLAG...]\n")
	writeLine("  Examples:", "ls -files -folder-id 55 [Show only files from private folder with id 55]")
	writeLine("  ", "ls -folders -brief [Show only folders from the My Home root in a brief version]")
	writeLine("  ", "ls -space-id 24 -folder-id 42 -json [Show the content of the folder with id 42 from the space with id 24 and present the result as JSON]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays the help message and exit")
	writeLine("   -brief", "Displays a brief version of the response; Only shows ID and name")
	writeLine("   -files", "Displays only files")
	writeLine("   -folders", "Displays only folders")
	writeLine("   -public", "Displays only public files & folders")
	writeLine("   -space-id <ID>", "Executes in the specified space")
	writeLine("   -folder-id <ID>", "Executes in the specified folder")
	writeLine("   -json", "Displays response as JSON array")

	writer.Flush()
	return 0
}

func PrintLsAssetsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing assets in a given location. If no location provided, My Home is used. Always responds in JSON format.")
	writeLine("      ", "Public assets are not listed by default.\n")
	writeLine("  Usage:", "ls-assets [FLAG...]\n")
	writeLine("  Examples:", "ls-assets -space-id 24 [Lists all assets from the space with id 24]")
	writeLine("  Examples:", "ls-assets [Lists all assets in your My Home]")
	writeLine("  ", "ls-assets -public [Lists all public assets accessible to the user]\n")
	writeLine("  Flags:", "The following flags are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exits")
	writeLine("   -public", "Lists public assets")
	writeLine("   -space-id <ID>", "Lists assets in the specified space")

	writer.Flush()
	return 0
}

func PrintLsAppsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing applications in a given location. If no location provided, My Home is used. Always responds in JSON format.")
	writeLine("      ", "Public applications are not listed by default.\n")
	writeLine("  Usage:", "ls-apps [FLAG...]\n")
	writeLine("  Examples:", "ls-apps -space-id 24 [Lists all applications from the space with id 24]")
	writeLine("  Examples:", "ls-apps [Lists all applications in your My Home]")
	writeLine("  ", "ls-apps -public [Lists all public applications accessible to the user]\n")
	writeLine("  Flags:", "The following flags are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exits")
	writeLine("   -public", "Lists public applications")
	writeLine("   -space-id <ID>", "Lists applications in the specified space")

	writer.Flush()
	return 0
}

func PrintLsWorkflowsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing workflows in a given location. If no location provided, My Home is used. Always responds in JSON format.")
	writeLine("      ", "Public workflows are not listed by default.\n")
	writeLine("  Usage:", "ls-workflows [FLAG...]\n")
	writeLine("  Examples:", "ls-workflows -space-id 24 [Lists all workflows from the space with id 24]")
	writeLine("  ", "ls-workflows -public [Lists all public workflows accessible to the user]\n")
	writeLine("  Flags:", "The following flags are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exits")
	writeLine("   -public", "Lists public workflows")
	writeLine("   -space-id <ID>", "Lists workflows in the specified space")

	writer.Flush()
	return 0
}

func PrintLsExecutionsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing executions in a given location. If no location provided, My Home is used. Always responds in JSON format.")
	writeLine("      ", "Public executions are not listed by default.\n")
	writeLine("  Usage:", "ls-executions [FLAG...]\n")
	writeLine("  Examples:", "ls-executions -space-id 24 [Lists all executions from the space with id 24]")
	writeLine("  ", "ls-executions -public [Lists all public executions accessible to the user]\n")
	writeLine("  Flags:", "The following flags are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exits")
	writeLine("   -public", "Lists public executions")
	writeLine("   -space-id <ID>", "Lists executions in the specified space")

	writer.Flush()
	return 0
}

func PrintDownloadHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Downloading a file or folder from pFDA. If you want download the root of My Home or a space (which has no folder-id), use the flag \"-folder-id root\".")
	writeLine("  ", "Supports downloading multiple files - simply pass them as positional args before any flags (check examples).")
	writeLine("  ", "For files you can use either filename or file-id - name might not be unique, file-id always is.")
	writeLine("  ", "Filename wildcards are supported, use \"?\" for exactly 1 char, \"*\" for 0 or more characters. \n")
	writeLine("  ", "By default, folder download only applies to top level files. Use flag \"-recursive\" to download whole folder content.")
	writeLine("  ", "If you want to download content of a public folder, use flag -public together with the command.")
	writeLine("  Usage:", "download <FILE-ID> [FLAG...] OR download <FILENAME> [FLAG...] OR download -folder-id <ID> [FLAG]\n")
	writeLine("  Examples:", "download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 [Downloads the file to current working directory]")
	writeLine("  ", "download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 -output \"data/results_final.csv\" [Downloads the file to existing folder named \"data\" with new name \"results_final.csv\"]")
	writeLine("  ", "download outputs_334_1.csv -output \"data/results_final.csv\" [Downloads the file to existing folder named \"data\" with new name \"results_final.csv\"]")
	writeLine("  ", "download 'data*.csv' -folder-id 1222 -overwrite true [Downloads only CSV files with 'data' in their name from folder (id:1222) and overwrites already existing files if exist]")
	writeLine("  ", "download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 file-YZm9QpQ0b69Qd8bP454kmcf76-2 [Downloads multiple files to the current working directory]")
	writeLine("  ", "download results.csv results_final.csv -folder-id 2221 [Downloads multiple files by name from folder (id:2221) to the current working directory]")
	writeLine("  ", "download -space-id 27 -folder-id root -recursive [Downloads recursively from the root folder of the Space]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -space-id <ID>", "Downloads from the specified space")
	writeLine("   -folder-id <ID>", "Downloads from the specified folder")
	writeLine("   -output <PATH/TO/FILE>", "Downloads to given path")
	writeLine("   -overwrite true|false", "Preselects overwrite option for dialog if path already exists in the target location.")
	writeLine("   -recursive", "Recursively downloads content of selected folder.")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintUploadFileHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Uploading a file or folder into a given location. If no location provided, the root of My Home is used.")
	writeLine("  ", "Supports uploading multiple files - simply pass them as positional args before any flags (check examples).")
	writeLine("  ", "Supports uploading via stdin (piped input) - requires setting -name flag (check examples).\n")
	writeLine("  Usage:", "upload-file <PATH/TO/FILE> [FLAG...]\n")
	writeLine("  Examples:", "upload-file script01.py [Uploads the file to the root folder of My Home]")
	writeLine("  ", "upload-file script01.py -space-id 12 [Uploads the file to the root folder of the space]")
	writeLine("  ", "upload-file script01.py -folder-id 10 [Uploads the file to the specified folder]")
	writeLine("  ", "upload-file data_folder/ -folder-id 10 [Uploads the folder and its content to the specified folder]")
	writeLine("  ", "upload-file script01.py info/readme.txt data_folder/ -folder-id 111 [Uploads multiple files to the specified folder]")
	writeLine("  ", "upload-file script01.py parser.py validator.py -space-id 21 [Uploads multiple files to the specified space]")
	writeLine("  ", "upload-file script01.py parser.py validator.py -space-id 21 -folder-id 222 [Uploads multiple files to the specified space's folder]")
	writeLine("  ", "upload-file -name piped_file.csv [Uploads file with given name provided via stdin]")
	writeLine("  ", "upload-file large_file.sql -threads 20 -chunksize 134217728 [Uploads large file with custom number of threads and chunksize]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -space-id <ID>", "Uploads into the specified space")
	writeLine("   -folder-id <ID>", "Uploads into the specified folder")
	writeLine("   -name <NAME>", "Uploads a stdin file with given name [required for stdin input]")
	writeLine("   -json", "Displays response in JSON format")
	writeLine("   -threads", "Changes number of upload threads to spawn (Max 100). Consider memory usage, not controlled.")
	writeLine("   -chunksize", "Changes size of each upload chunk in bytes (Min 16MB, Max 4GB). Consider memory usage, not controlled.")

	writer.Flush()
	return 0
}

func PrintDescribeAppHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Getting details about a given app. Always responds in JSON format.\n")
	writeLine("  Usage:", "describe-app <APP_ID>\n")
	writeLine("  Examples:", "describe-app app-GJk3k5v85a4ZfgQ8bP5911Xg0-1 [Describes the app]")

	writer.Flush()
	return 0
}

func PrintDescribeWorkflowHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Getting details about a given workflow. Always responds in JSON format.\n")
	writeLine("  Usage:", "describe-workflow <WORKFLOW_ID>\n")
	writeLine("  Examples:", "describe-workflow workflow-GJkk5v005xggB4JcB4Zf9326V-1 [Describes the workflow]")

	writer.Flush()
	return 0
}

func PrintUploadResourceHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Uploading a new portal resource. Responds with sharable non-expiring link to the created resource.\n")
	writeLine("  ", "Supports uploading multiple resources - simply pass them as positional args before any flags (check examples).")
	writeLine("  Usage:", "upload-resource <PATH/TO/FILE> -portal-id <PORTAL_ID | PORTAL_SLUG> [FLAG...]\n")
	writeLine("  Examples:", "upload-resource script01.py -portal-id 12 [Creates a new resource in the specified portal]")
	writeLine("  ", "upload-resource script01.py processed_data.py results.pdf -portal-id dna-sequences-101  [Creates new resources in the specified portal defined by slug]")

	writer.Flush()
	return 0
}

func PrintDescribeHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Getting details about a given entity. Entity can be one of: app, job, file, workflow, discussion. Always responds in JSON format.\n")
	writeLine("  Usage:", "describe <ENTITY_ID>\n")
	writeLine("  Examples:", "describe file-GJk3k5v85a4ZfgQ8bP5911Xg0-1 [Describes the file]")
	writeLine("  ", "describe file-GJk1kpQ05xgQd8bP54kJFjzkz-1 [Describes the asset]")
	writeLine("  ", "describe app-YZm95v85a4ZfgQB4JcAB4g0-3 [Describes the app]")
	writeLine("  ", "describe job-YZm9QpQ0b69Qd8bP454kmcf76-2 [Describes the execution]")
	writeLine("  ", "describe workflow-GJkk5v005xggB4JcB4Zf9326V-1 [Describes the workflow]")
	writeLine("  ", "describe discussion-15 [Describes the discussion]")

	writer.Flush()
	return 0
}

func PrintUploadAssetHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Uploading an asset. Assets can be uploaded to the root of My Home only.\n")
	writeLine("  Usage:", "upload-asset -name <NAME{.tar,.tar.gz}> -root </PATH/TO/ROOT/FOLDER> -readme <README{.txt,.md}\n")
	writeLine("  Examples:", "upload-asset -name asset01.tar.gz -root ./asset01 -readme ./readme.md [Uploads asset with root folder asset01 and readme file readme.md from current directory]")

	writer.Flush()
	return 0
}

func PrintMkdirHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Creating a folder.\n")
	writeLine("  Usage:", "mkdir <NAME> [FLAG...]\n")
	writeLine("  Examples:", "mkdir DATA [Creates a new folder named DATA in your My Home section]")
	writeLine("  ", "mkdir DATA -space-id 12 [Creates a new folder named DATA in root of the space]")
	writeLine("  ", "mkdir DATA scripts results -folder-id 2221 [Creates 3 new folders in folder (id:2221)]")
	writeLine("  ", "mkdir scripts/python/v1 scripts/python/v2 -p [Creates the specified folder structure]")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays the help message and exit")
	writeLine("   -space-id <ID>", "Creates the folder in the specified space")
	writeLine("   -folder-id <ID>", "Creates the folder in the specified folder")
	writeLine("   -p, -parents", "Creates parent directories as needed, no error if existing")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintRmHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Removing a file.\n")
	writeLine("  Usage:", "rm <FILE_ID | FILE_NAME> [FLAG...] OR rm <NAME> [FLAG...]\n")
	writeLine("  Examples:", "rm file-GJk1kpQ05xgQd8bP54kJFjzkz-1 [Removes file with given id]")
	writeLine("  ", "rm file-GJk1kpQ05xgQd8bP54kJFjzkz-1 file-YZm9QpQ0b69Qd8bP454kmcf76-2 [Removes multiple files given by ids]")
	writeLine("  ", "rm inputs_01.csv inputs_02.csv -folder-id 2221 [Removes multiple files given by names in the folder (id:2221)]")
	writeLine("  ", "rm 'inputs*.csv' -space-id 12 [Removes all CSV files with 'inputs' in their name from the root of given space]")
	writeLine("  ", "rm '*.txt' -space-id 12 -folder-id 1212 [Removes all txt files with from the folder of given space]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays the help message and exit")
	writeLine("   -space-id <ID>", "Executes in the specified space")
	writeLine("   -folder-id <ID>", "Executes in the specified folder")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintRmdirHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Deleting a folder. Only empty folders are allowed to be deleted.\n")
	writeLine("  Usage:", "rmdir <FOLDER_ID> [FLAG...]\n")
	writeLine("  Examples:", "rmdir 2221 [Removes folder (id:2221)]")
	writeLine("  ", "rmdir 2221 2332 2333 [Removes folders with given ids if empty]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays the help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintCatHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Displaying the content of a file.\n")
	writeLine("  Usage:", "cat <FILE_ID>\n")
	writeLine("  Examples:", "cat file-GJk1kpQ05xgQd8bP54kJFjzkz-1 [Prints content of the given file]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays the help message and exit")

	writer.Flush()
	return 0
}

func PrintHeadHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Displays the first lines of a file. By default, the first 10 lines are displayed.\n")
	writeLine("  Usage:", "head <FILE_ID> [FLAGS...]\n")
	writeLine("  Examples:", "head file-GJk1kpQ05xgQd8bP54kJFjzkz-1 [Prints the first 10 lines of the given file]")
	writeLine("  ", "head file-GJk1kpQ05xgQd8bP54kJFjzkz-1 -lines 50 [Prints the first 50 lines of the given file]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -lines", "Alter number of lines to display")
	writeLine("   -h, -help", "Displays the help message and exit")

	writer.Flush()
	return 0
}

func PrintGetScopeHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Displays the scope of the current context. If you are running it in a private scope, 'private' is printed to the console.\n In case you are in a space, only the integer Space ID is printed to the console.\n")
	writeLine("  Usage:", "get-scope [FLAG...]\n")
	writeLine("  Examples:", "get-scope [Prints current scope]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays the help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintViewLinkHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Get view link of the file. You can choose between protected and pre-authenticated links.\n\tPre-authenticated links are valid for 24 hours by default, unless -duration flag is specified.\n")
	writeLine("  Usage:", "view-link <FILE_ID> [FLAG...]\n")
	writeLine("  Examples:", "view-link file-GbKF3qQ0Z0gqk80j1QF47K8j-1 [Prints view link for specified file.]\n")
	writeLine(" ", "view-link file-GbKF3qQ0Z0gqk80j1QF47K8j-1 -auth [Prints pre-authenticated view link for specified file.]\n")
	writeLine(" ", "view-link file-GbKF3qQ0Z0gqk80j1QF47K8j-1 -auth -duration 172800 [Prints pre-authenticated view link for specified file - valid for 48 hours.]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -auth", "Generate pre-authenticated link instead of protected link")
	writeLine("   -duration", "Set duration of pre-authenticated link in seconds (default 86400)")
	writeLine("   -h, -help", "Displays the help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}
