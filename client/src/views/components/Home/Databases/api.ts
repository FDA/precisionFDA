import { showErrorAlert } from "../components/ToastAlert"
import { defaultHeaders } from "../configs/headers"

export const fetchFilesReport = async (key: any, sampleId: any, sampleUrl: any) => {
    const response = await fetch(
        `${sampleUrl}/${sampleId}/json`,
        {
            method: 'GET',
            credentials: 'include',
            headers: defaultHeaders,
        }
    )
    if (response && (response.status === 500)) {
        showErrorAlert(`Something went wrong:  ${response.statusText}`)

        return { Json: "Not ready" }
    }

    return await response.json()
}
