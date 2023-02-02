import axios from 'axios'
import sparkMD5 from 'spark-md5'
import httpStatusCodes from 'http-status-codes'

import { getUploadURL, uploadChunk, closeFile } from '../../../api/files'
import { backendCall } from '../../../utils/api'
import { CHUNK_SIZE } from '../../home/files/actionModals/useFileUploadModal/constants'


export interface CreateChallengePayload {
  name: string
  description: string
  scope: string
  app_owner_id: string
  start_at: string
  end_at: Date
  status: Date
  host_lead_dxuser: string
  guest_lead_dxuser: string
  card_image_id: string
  card_image_url: string
  pre_registration_url: string | null,
}

export interface ProposeChallengePayload {
  name: string,
  email: string,
  organisation: string,
  specific_question: boolean,
  specific_question_text: string,
  data_details: boolean,
  data_details_text: string,
}


const throwIfError = (status: number, payload?: any) => {
  if (status !== httpStatusCodes.OK) {
    const errorMessage = payload?.error?.message ?? 'Unknown upload failure'
    throw new Error(errorMessage)
  }
}

export async function getChallenge(challengeId: string): Promise<any> {
  const res = await backendCall(`/api/challenges/${challengeId}?custom=true`, 'GET')
  return res.payload.challenge
}

export async function createChallengeRequest(payload: CreateChallengePayload) {
  return axios.post('/api/challenges/', { challenge: payload }).then(r => r.data)
}

export async function editChallengeRequest(payload: CreateChallengePayload, challengeId: string) {
  return axios.put(`/api/challenges/${challengeId}`, { challenge: payload }).then(r => r.data)
}

export async function createChallengeCardImage(file: File): Promise<string> {
  let fileUid: any = null
  await backendCall('/api/create_challenge_card_image', 'POST', { name: file.name, metadata: {} })
    .then(response => {
      const numChunks = Math.ceil(file.size / CHUNK_SIZE)
      const reader = new FileReader()
      const spark = new sparkMD5.ArrayBuffer()
      fileUid = response.payload.id

      reader.onload = () => {
        for (let i = 0; i < numChunks; i++) {
          let sentSize = 0
          const firstByte = i * CHUNK_SIZE
          const lastByte = (i + 1) * CHUNK_SIZE
          if (reader.result) {
            const buffer = reader.result.slice(firstByte, lastByte) as ArrayBuffer
            spark.append(buffer)
            const hash = spark.end()

            getUploadURL(fileUid, i + 1, buffer.byteLength, hash)
              .then(res => {
                const { status, payload } = res
                const { url, headers } = payload

                throwIfError(status, payload)

                return uploadChunk(url, buffer, headers)
              })
              .then(res => {
                throwIfError(res.status)
                sentSize += buffer.byteLength

                if (sentSize === file.size) {
                  closeFile(fileUid)
                  return fileUid
                }
              })
          }
        }
      }
      reader.readAsArrayBuffer(file as any)
    },
    )
    return fileUid
}

export async function getChallengeImageLink(fileUid: string) {
  return axios.post('/api/get_file_link', { id: fileUid }).then(r => r.data)
}

export async function proposeChallengeRequest(payload: ProposeChallengePayload) {
  return axios.post('/api/challenges/propose', payload).then(r => r.data)
}

export async function fetchScoringAppUsers(): Promise<[]> {
  return axios.get('/api/challenges/scoring_app_users').then(r => r.data)
}

export async function fetchHostLeads(): Promise<[]> {
  return axios.get('/api/challenges/host_lead_users').then(r => r.data)
}

export async function fetchGuestLeads(): Promise<[]> {
  return axios.get('/api/challenges/guest_lead_users').then(r => r.data)
}


export async function fetchChallengeScopes(challengeId: string | undefined): Promise<[]> {
  const res = await backendCall('/api/challenges/scopes_for_select', 'GET', { id: challengeId })
  return res.payload
}

export async function fetchChallengeOrders() {
  return axios.get('/api/challenges/challenges_for_select').then(r => r.data)
}

