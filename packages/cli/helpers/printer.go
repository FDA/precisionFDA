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
	writeLine("  Usage:", "ls-spaces [FLAG...]\n")
	writeLine("  Examples:", "ls-spaces -groups -private [Shows all active spaces of type groups or private]")
	writeLine("  ", "ls-spaces -unactivated -json [Shows only unactivated spaces and presents result as JSON]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -locked", "Shows only locked spaces")
	writeLine("   -unactivated", "Shows only unactivated spaces")
	writeLine("   -review", "Shows only review spaces")
	writeLine("   -groups", "Shows only groups spaces")
	writeLine("   -private", "Shows only private spaces")
	writeLine("   -administrator", "Shows only administrator spaces")
	writeLine("   -government", "Shows only government spaces")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintLsMembersHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing members of a specified space.\n")
	writeLine("  Usage:", "ls-members -space-id <SPACE_ID>\n")
	writeLine("  Examples:", "ls-members -space-id 27 [Lists all members of the specified space]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -space-id <ID>", "Lists members in the specified space")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintLsDiscussionsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing discussions in a given space.\n")
	writeLine("  Usage:", "ls-discussions [FLAG...]\n")
	writeLine("  Examples:", "ls-discussions -space-id 27 [Lists all discussions in the specified space]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -space-id <ID>", "Lists discussions in the specified space")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintLsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing files in a given location. If no location provided, the root of My Home is used. Public files are not listed by default.\n")
	writeLine("  Usage:", "ls [FLAG...]\n")
	writeLine("  Examples:", "ls -files -folder-id 55 [Shows only files from private folder with id 55]")
	writeLine("  ", "ls -folders -brief [Shows only folders from the My Home root in a brief version]")
	writeLine("  ", "ls -space-id 24 -folder-id 42 -json [Shows the content of the folder with id 42 from the space with id 24 in JSON format]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -brief", "Displays a brief version of the response; only shows ID and name")
	writeLine("   -files", "Displays only files")
	writeLine("   -folders", "Displays only folders")
	writeLine("   -public", "Displays only public files and folders")
	writeLine("   -space-id <ID>", "Executes in the specified space")
	writeLine("   -folder-id <ID>", "Executes in the specified folder")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintLsAssetsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing assets in a given location. If no location provided, My Home is used. Public assets are not listed by default.\n")
	writeLine("  Usage:", "ls-assets [FLAG...]\n")
	writeLine("  Examples:", "ls-assets [Lists all assets in your My Home]")
	writeLine("  ", "ls-assets -space-id 24 [Lists all assets from the space with id 24]")
	writeLine("  ", "ls-assets -public [Lists all public assets accessible to the user]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -public", "Lists public assets")
	writeLine("   -space-id <ID>", "Lists assets in the specified space")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintLsAppsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing applications in a given location. If no location provided, My Home is used. Public applications are not listed by default.\n")
	writeLine("  Usage:", "ls-apps [FLAG...]\n")
	writeLine("  Examples:", "ls-apps [Lists all applications in your My Home]")
	writeLine("  ", "ls-apps -space-id 24 [Lists all applications from the space with id 24]")
	writeLine("  ", "ls-apps -public [Lists all public applications accessible to the user]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -public", "Lists public applications")
	writeLine("   -space-id <ID>", "Lists applications in the specified space")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintLsWorkflowsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing workflows in a given location. If no location provided, My Home is used. Public workflows are not listed by default.\n")
	writeLine("  Usage:", "ls-workflows [FLAG...]\n")
	writeLine("  Examples:", "ls-workflows -space-id 24 [Lists all workflows from the space with id 24]")
	writeLine("  ", "ls-workflows -public [Lists all public workflows accessible to the user]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -public", "Lists public workflows")
	writeLine("   -space-id <ID>", "Lists workflows in the specified space")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintLsExecutionsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Listing executions in a given location. If no location provided, My Home is used. Public executions are not listed by default.\n")
	writeLine("  Usage:", "ls-executions [FLAG...]\n")
	writeLine("  Examples:", "ls-executions -space-id 24 [Lists all executions from the space with id 24]")
	writeLine("  ", "ls-executions -public [Lists all public executions accessible to the user]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -public", "Lists public executions")
	writeLine("   -space-id <ID>", "Lists executions in the specified space")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintDownloadHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Downloading a file or folder from pFDA. Supports downloading multiple files. For files you can use either filename or file-id. Filename wildcards are supported (\"?\" for 1 char, \"*\" for 0+ chars).\n")
	writeLine("  Usage:", "download <FILE_ID> [FLAG...]\n")
	writeLine("  Examples:", "download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 [Downloads the file to current working directory]")
	writeLine("  ", "download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 -output \"data/results_final.csv\" [Downloads the file with new name]")
	writeLine("  ", "download 'data*.csv' -folder-id 1222 -overwrite true [Downloads CSV files matching pattern]")
	writeLine("  ", "download file-GJk1kpQ05xgQd8bP54kJFjzkz-1 file-YZm9QpQ0b69Qd8bP454kmcf76-2 [Downloads multiple files]")
	writeLine("  ", "download -space-id 27 -folder-id root -recursive [Downloads recursively from the root folder of the Space]\n")
	writeLine("  Arguments:", "")
	writeLine("   <FILE_ID>", "The file ID or filename to download (supports wildcards, required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -space-id <ID>", "Downloads from the specified space")
	writeLine("   -folder-id <ID>", "Downloads from the specified folder (use \"root\" for root folder)")
	writeLine("   -output <PATH>", "Downloads to given path")
	writeLine("   -overwrite true|false", "Preselects overwrite option if file already exists")
	writeLine("   -recursive", "Recursively downloads content of selected folder")
	writeLine("   -public", "Downloads from public folder")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintUploadFileHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Uploading a file or folder into a given location. If no location provided, the root of My Home is used. Supports uploading multiple files and stdin input.\n")
	writeLine("  Usage:", "upload-file <PATH/TO/FILE> [FLAG...]\n")
	writeLine("  Examples:", "upload-file script01.py [Uploads the file to the root folder of My Home]")
	writeLine("  ", "upload-file script01.py -space-id 12 [Uploads the file to the root folder of the space]")
	writeLine("  ", "upload-file script01.py -folder-id 10 [Uploads the file to the specified folder]")
	writeLine("  ", "upload-file data_folder/ -folder-id 10 [Uploads the folder and its content]")
	writeLine("  ", "upload-file script01.py parser.py -space-id 21 [Uploads multiple files to the specified space]")
	writeLine("  ", "upload-file -name piped_file.csv [Uploads file with given name provided via stdin]")
	writeLine("  ", "upload-file large_file.sql -threads 20 -chunksize 134217728 [Uploads large file with custom threads and chunksize]\n")
	writeLine("  Arguments:", "")
	writeLine("   <PATH/TO/FILE>", "Path to the file or folder to upload (required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -space-id <ID>", "Uploads into the specified space")
	writeLine("   -folder-id <ID>", "Uploads into the specified folder")
	writeLine("   -name <NAME>", "Uploads a stdin file with given name (required for stdin input)")
	writeLine("   -threads <NUM>", "Number of upload threads (max 100)")
	writeLine("   -chunksize <BYTES>", "Size of each upload chunk (min 16MB, max 4GB)")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintUploadResourceHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Uploading a new portal resource. Responds with sharable non-expiring link. Supports uploading multiple resources.\n")
	writeLine("  Usage:", "upload-resource <PATH/TO/FILE> -portal-id <PORTAL_ID> [FLAG...]\n")
	writeLine("  Examples:", "upload-resource script01.py -portal-id 12 [Creates a new resource in the specified portal]")
	writeLine("  ", "upload-resource script01.py results.pdf -portal-id dna-sequences-101 [Creates resources in portal by slug]\n")
	writeLine("  Arguments:", "")
	writeLine("   <PATH/TO/FILE>", "Path to the file to upload as a resource (required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -portal-id <ID>", "Portal ID or slug (required)")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintDescribeHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Getting details about a given entity. Supported entities: app, discussion, file, folder, job, workflow.\n")
	writeLine("  Usage:", "describe <ENTITY_ID>\n")
	writeLine("  Examples:", "describe file-GJk3k5v85a4ZfgQ8bP5911Xg0-1 [Describes the file]")
	writeLine("  ", "describe app-YZm95v85a4ZfgQB4JcAB4g0-3 [Describes the app]")
	writeLine("  ", "describe job-YZm9QpQ0b69Qd8bP454kmcf76-2 [Describes the execution]")
	writeLine("  ", "describe workflow-GJkk5v005xggB4JcB4Zf9326V-1 [Describes the workflow]\n")
	writeLine("  Arguments:", "")
	writeLine("   <ENTITY_ID>", "The unique identifier of the entity (required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintUploadAssetHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Uploading an asset. Assets can be uploaded to the root of My Home only.\n")
	writeLine("  Usage:", "upload-asset -name <NAME> -root <PATH> -readme <README>\n")
	writeLine("  Examples:", "upload-asset -name asset01.tar.gz -root ./asset01 -readme ./readme.md [Uploads asset with specified root and readme]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -name <NAME>", "Asset name (.tar or .tar.gz)")
	writeLine("   -root <PATH>", "Path to root folder")
	writeLine("   -readme <PATH>", "Path to readme file (.txt or .md)")
	writeLine("   -json", "Displays response in JSON format")

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
	writeLine("  ", "mkdir scripts/python/v1 -p [Creates the specified folder structure]\n")
	writeLine("  Arguments:", "")
	writeLine("   <NAME>", "Name of the folder to create\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
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
	writeLine("  For:", "Removing a file. Supports wildcards and multiple files.\n")
	writeLine("  Usage:", "rm <FILE_ID> [FLAG...]\n")
	writeLine("  Examples:", "rm file-GJk1kpQ05xgQd8bP54kJFjzkz-1 [Removes file with given id]")
	writeLine("  ", "rm file-GJk1kpQ05xgQd8bP54kJFjzkz-1 file-YZm9QpQ0b69Qd8bP454kmcf76-2 [Removes multiple files]")
	writeLine("  ", "rm 'inputs*.csv' -space-id 12 [Removes all matching CSV files from the root of given space]\n")
	writeLine("  Arguments:", "")
	writeLine("   <FILE_ID>", "The file ID or filename to remove (supports wildcards, required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
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
	writeLine("  Arguments:", "")
	writeLine("   <FOLDER_ID>", "The numeric ID of the folder to delete (required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
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
	writeLine("  Arguments:", "")
	writeLine("   <FILE_ID>", "The unique identifier of the file (required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")

	writer.Flush()
	return 0
}

func PrintHeadHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Displaying the first lines of a file. By default, the first 10 lines are displayed.\n")
	writeLine("  Usage:", "head <FILE_ID> [FLAG...]\n")
	writeLine("  Examples:", "head file-GJk1kpQ05xgQd8bP54kJFjzkz-1 [Prints the first 10 lines of the given file]")
	writeLine("  ", "head file-GJk1kpQ05xgQd8bP54kJFjzkz-1 -lines 50 [Prints the first 50 lines of the given file]\n")
	writeLine("  Arguments:", "")
	writeLine("   <FILE_ID>", "The unique identifier of the file (required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -lines <NUM>", "Number of lines to display")

	writer.Flush()
	return 0
}

func PrintGetScopeHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Displaying the scope of the current context. Prints 'private' for private scope or the Space ID for spaces.\n")
	writeLine("  Usage:", "get-scope [FLAG...]\n")
	writeLine("  Examples:", "get-scope [Prints current scope]\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintViewLinkHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Getting view link of a file. Choose between protected and pre-authenticated links. Pre-authenticated links are valid for 24 hours by default.\n")
	writeLine("  Usage:", "view-link <FILE_ID> [FLAG...]\n")
	writeLine("  Examples:", "view-link file-GbKF3qQ0Z0gqk80j1QF47K8j-1 [Prints view link for specified file]")
	writeLine("  ", "view-link file-GbKF3qQ0Z0gqk80j1QF47K8j-1 -auth [Prints pre-authenticated view link]")
	writeLine("  ", "view-link file-GbKF3qQ0Z0gqk80j1QF47K8j-1 -auth -duration 172800 [Pre-authenticated link valid for 48 hours]\n")
	writeLine("  Arguments:", "")
	writeLine("   <FILE_ID>", "The unique identifier of the file (required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -auth", "Generate pre-authenticated link instead of protected link")
	writeLine("   -duration <SEC>", "Duration of pre-authenticated link in seconds (default 86400)")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintNoHelpAvailable() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  Error:", "No help available for the given command. For assistance, please contact the support team.")

	writer.Flush()
	return 0
}

func PrintCreateDiscussionHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Creating a new discussion in the selected space. Accepts JSON body with title, content (required), and attachments (optional).\n")
	writeLine("  Usage:", "create-discussion '<JSON_BODY>' -space-id <SPACE_ID> [FLAG...]\n")
	writeLine("  Examples:", "create-discussion '{\"title\":\"My Title\", \"content\":\"My content\"}' -space-id 12 [Creates discussion in given space]\n")
	writeLine("  Arguments:", "")
	writeLine("   <JSON_BODY>", "JSON object with title, content (required), and attachments (optional)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -space-id <ID>", "Space ID (required)")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintEditDiscussionHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Appending content and/or attachments to a discussion. Accepts JSON body with discussionId (required), content, and attachments.\n")
	writeLine("  Usage:", "edit-discussion '<JSON_BODY>' [FLAG...]\n")
	writeLine("  Examples:", "edit-discussion '{\"discussionId\":15, \"content\":\"Additional content\"}' [Appends content to discussion]\n")
	writeLine("  Arguments:", "")
	writeLine("   <JSON_BODY>", "JSON object with discussionId (required), content, and attachments\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintCreateReplyHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Creating a new reply in a discussion or answer. Accepts JSON with discussionId/answerId, replyType ('answer'/'comment'), and content.\n")
	writeLine("  Usage:", "create-reply '<JSON_BODY>' [FLAG...]\n")
	writeLine("  Examples:", "create-reply '{\"discussionId\":15, \"replyType\":\"answer\", \"content\":\"My answer\"}' [Creates answer in discussion]\n")
	writeLine("  Arguments:", "")
	writeLine("   <JSON_BODY>", "JSON object with discussionId/answerId, replyType, and content (required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintEditReplyHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Appending content and/or attachments to a reply. Accepts JSON with answerId/commentId (required), content, and attachments.\n")
	writeLine("  Usage:", "edit-reply '<JSON_BODY>' [FLAG...]\n")
	writeLine("  Examples:", "edit-reply '{\"answerId\":25, \"content\":\"Additional content\"}' [Appends content to answer]\n")
	writeLine("  Arguments:", "")
	writeLine("   <JSON_BODY>", "JSON object with answerId/commentId (required), content, and attachments\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintGetPasswordHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Getting password of a database cluster.\n")
	writeLine("  Usage:", "get-password <DBCLUSTER_ID>\n")
	writeLine("  Examples:", "get-password dbcluster-Gy54pFQ0bgVjF542f2fq8q1b-1 [Gets password for the specified database cluster]\n")
	writeLine("  Arguments:", "")
	writeLine("   <DBCLUSTER_ID>", "The unique identifier of the database cluster (required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintRotatePasswordHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Rotating password of a database cluster. Returns the new password. Note: it may take several minutes for the new password to take effect.\n")
	writeLine("  Usage:", "rotate-password <DBCLUSTER_ID>\n")
	writeLine("  Examples:", "rotate-password dbcluster-Gy54pFQ0bgVjF542f2fq8q1b-1 [Rotates password for the specified database cluster]\n")
	writeLine("  Arguments:", "")
	writeLine("   <DBCLUSTER_ID>", "The unique identifier of the database cluster (required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintSetTagsHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Setting tags on an entity. Supported: app, asset, file, folder, job, workflow. This replaces existing tags.\n")
	writeLine("  Usage:", "set-tags <ENTITY_ID> 'TAG1,TAG2,...' [FLAG...]\n")
	writeLine("  Examples:", "set-tags file-GJk1kpQ05xgQd8bP54kJFjzkz-1 'projectA,important' [Sets tags on the specified file]")
	writeLine("  ", "set-tags folder-14 'data,raw' [Sets tags on the specified folder]")
	writeLine("  ", "set-tags job-YZm9QpQ0b69Qd8bP454kmcf76-2 'analysis,batch1' [Sets tags on the specified job]\n")
	writeLine("  Arguments:", "")
	writeLine("   <ENTITY_ID>", "The unique identifier of the entity (required)")
	writeLine("   <TAGS>", "Comma-separated list of tags (required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintSetPropertiesHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Setting properties on an entity. Supported: app, asset, file, folder, job, workflow. This replaces existing properties.\n")
	writeLine("  Usage:", "set-properties <ENTITY_ID> '<JSON_PROPERTIES>' [FLAG...]\n")
	writeLine("  Examples:", "set-properties file-GJk1kpQ05xgQd8bP54kJFjzkz-1 '{\"project\":\"F664-P3\",\"status\":\"final\"}' [Sets properties on the specified file]")
	writeLine("  ", "set-properties folder-14 '{\"category\":\"raw_data\",\"year\":\"2024\"}' [Sets properties on the specified folder]")
	writeLine("  ", "set-properties app-YZm95v85a4ZfgQB4JcAB4g0-3 '{\"version\":\"1.2\",\"author\":\"team\"}' [Sets properties on the specified app]\n")
	writeLine("  Arguments:", "")
	writeLine("   <ENTITY_ID>", "The unique identifier of the entity (required)")
	writeLine("   <JSON_PROPERTIES>", "JSON object with key-value pairs (required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintRunAppHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Launching an application with the specified configuration.\n")
	writeLine("  Usage:", "run <APP_UID> [JSON_CONFIG]\n")
	writeLine("  Examples:", "")
	writeLine("   ", "pfda run app-GJk3k5v85a4ZfgQ8bP5911Xg0-1")
	writeLine("   ", "  Launches the app with default configuration\n")
	writeLine("   ", "pfda run app-GJk3k5v85a4ZfgQ8bP5911Xg0-1 '{\"inputs\": {\"snapshot\": \"file-abc123\"}}'")
	writeLine("   ", "  Launches the app with a file input\n")
	writeLine("   ", "pfda run app-GJk3k5v85a4ZfgQ8bP5911Xg0-1 '{\"scope\": \"space-123\", \"instanceType\": \"baseline-8\"}'")
	writeLine("   ", "  Launches the app in a space with a specific instance type\n")
	writeLine("   ", "pfda run app-GJk3k5v85a4ZfgQ8bP5911Xg0-1 '{\"name\": \"my-analysis\", \"jobLimit\": 2.5, \"inputs\": {\"snapshot\": \"file-abc123\"}}'")
	writeLine("   ", "  Launches the app with a custom name, cost limit, and a file input\n")
	writeLine("  Arguments:", "")
	writeLine("   <APP_UID>", "The unique identifier of the application to run (required)")
	writeLine("   [JSON_CONFIG]", "JSON object with input parameters and configuration (optional)\n")
	writeLine("  Config options:", "")
	writeLine("   scope", "Execution scope: \"private\" (default) or \"space-<ID>\"")
	writeLine("   instanceType", "Instance type, e.g. \"baseline-8\", \"baseline-16\", \"himem-32\"")
	writeLine("   name", "Custom name for the job")
	writeLine("   jobLimit", "Cost limit for the job (positive number in US dollars)")
	writeLine("   outputFolderPath", "Path for the job's output folder")
	writeLine("   inputs", "App-specific inputs as a nested JSON object, e.g. {\"snapshot\": \"file-abc123\"}\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}

func PrintTerminateHelp() int {
	writer := tabwriter.NewWriter(os.Stdout, 0, 8, 1, '\t', tabwriter.AlignRight)
	writeLine := newLineWriter(writer)

	writeLine("  ", "  ")
	writeLine("  For:", "Terminating a running execution.\n")
	writeLine("  Usage:", "terminate <JOB_UID>\n")
	writeLine("  Examples:", "terminate job-GJk3k5v85a4ZfgQ8bP5911Xg-1 [Terminates the specified job]\n")
	writeLine("  Arguments:", "")
	writeLine("   <JOB_UID>", "The unique identifier of the job to terminate (required)\n")
	writeLine("  Flags:", "All flags listed below are OPTIONAL")
	writeLine("   -h, -help", "Displays this help message and exit")
	writeLine("   -json", "Displays response in JSON format")

	writer.Flush()
	return 0
}
