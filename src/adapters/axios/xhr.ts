import axios, { AxiosRequestConfig, AxiosPromise } from 'axios'
import { getCookie } from 'cookies-next'

function getHeaders(token?: string) {
  return {
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json; charset=utf-8',
    Authorization: token ? `Bearer ${token}` : undefined,
  }
}

export const xhr = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL_BASE,
  timeout: 40000,
  headers: getHeaders(),
})

async function get(
  url: string,
  config?: AxiosRequestConfig,
): Promise<AxiosPromise> {
  const token = getCookie('token')

  const newConfig = {
    ...config,
    headers: getHeaders(token),
  }

  return await xhr.get(url, newConfig)
}

async function post<D>(url: string, data: D): Promise<AxiosPromise> {
  const token = getCookie('token')

  const config = {
    headers: getHeaders(token),
  }

  return await xhr.post(url, data, config)
}

async function put<D>(url: string, data: D): Promise<AxiosPromise> {
  const token = getCookie('token')

  const config = {
    headers: getHeaders(token),
  }

  return await xhr.put(url, data, config)
}

async function patch<D>(url: string, data: D): Promise<AxiosPromise> {
  const token = getCookie('token')

  const config = {
    headers: getHeaders(token),
  }

  return await xhr.patch(url, data, config)
}

async function del(url: string): Promise<AxiosPromise> {
  const token = getCookie('token')

  const config = {
    headers: getHeaders(token),
  }

  return xhr.delete(url, config)
}

export const api = {
  get,
  post,
  put,
  patch,
  del,
}
