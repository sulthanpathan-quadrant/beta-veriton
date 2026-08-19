import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Cloud,
  Database,
  FolderOpen,
  Upload,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
// import { ImportedDataset } from '@/components/modals/UnifiedImportModal'
import { ImportedDataset } from '../modals/UnifiedImportModal';

interface DataSourceTabProps {
  onDatasetImported: (dataset: ImportedDataset) => void
  selectedDataset: ImportedDataset | null
  onNext: () => void
  onBackToJobs: () => void
  targetTab?: string | null
}

type ImportSource = 'none' | 'adls' | 'delta' | 'onelake' | 'local'
type AuthType = 'access-key' | 'sas-token' | 'service-principal'
type OneLakeMode = '' | 'files' | 'tables'

interface OneLakeFile {
  name: string
  size_bytes?: number
  last_modified?: string
  full_path: string
}

interface OneLakeTable {
  name: string
}

const ONELAKE_BASE_URL =
  'https://api.veriton.ai/api/service3'

const UPLOAD_FILE_URL =
  'https://api.veriton.ai/api/service3/upload_file'

const DATA_PREVIEW_URL =
  'https://api.veriton.ai/api/service3/data_preview'

const DataSourceTab = ({
  onDatasetImported,
  selectedDataset,
  onNext,
  onBackToJobs,
  targetTab
}: DataSourceTabProps) => {
  const [selectedSource, setSelectedSource] = useState<ImportSource>('none')
  const [showConnectionModal, setShowConnectionModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form-level error (for validation & upload/preview)
  const [formError, setFormError] = useState('')

  // ADLS Gen2 fields
  const [storageAccount, setStorageAccount] = useState('')
  const [fileSystem, setFileSystem] = useState('')
  const [filePath, setFilePath] = useState('')
  const [authType, setAuthType] = useState<AuthType>('access-key')
  const [accessKey, setAccessKey] = useState('')

  // Delta Tables fields
  const [workspaceUrl, setWorkspaceUrl] = useState('')
  const [catalogName, setCatalogName] = useState('')
  const [schemaName, setSchemaName] = useState('')
  const [tableName, setTableName] = useState('')
  const [deltaToken, setDeltaToken] = useState('')

  // OneLake fields & navigation/drill state
  const [workspaceName, setWorkspaceName] = useState('')
  const [lakehouseName, setLakehouseName] = useState('')
  const [onelakeFilePath, setOnelakeFilePath] = useState('')
  const [oneLakeMode, setOneLakeMode] = useState<OneLakeMode>('') // 'files' | 'tables'
  const [oneLakeFiles, setOneLakeFiles] = useState<OneLakeFile[]>([])
  const [oneLakeTables, setOneLakeTables] = useState<OneLakeTable[]>([])
  const [oneLakeFolders, setOneLakeFolders] = useState<string[]>([])
  const [selectedOneLakeFolder, setSelectedOneLakeFolder] = useState('')
  const [selectedOneLakeFile, setSelectedOneLakeFile] = useState('')
  const [selectedOneLakeTable, setSelectedOneLakeTable] = useState('')
  const [isOneLakeLoadingOptions, setIsOneLakeLoadingOptions] = useState(false)
  const [oneLakeOptionsError, setOneLakeOptionsError] = useState('')
  const [oneLakeCurrentPath, setOneLakeCurrentPath] = useState('') // current path e.g. Files, Tables/customer_churn

  // Local file
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')

  const handleSourceSelect = (source: ImportSource) => {
    setSelectedSource(source)
    setFormError('')
    if (source !== 'none') {
      // reset OneLake state when opening modal
      setOneLakeMode('')
      setOneLakeFiles([])
      setOneLakeTables([])
      setOneLakeFolders([])
      setSelectedOneLakeFile('')
      setSelectedOneLakeFolder('')
      setSelectedOneLakeTable('')
      setOnelakeFilePath('')
      setOneLakeCurrentPath('')
      setShowConnectionModal(true)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setFileError('Only CSV files are allowed')
        setSelectedFile(null)
        return
      }
      setFileError('')
      setSelectedFile(file)
    }
  }

  const validateConnectionParams = (): boolean => {
    setFormError('')

    if (selectedSource === 'adls') {
      if (!storageAccount || !fileSystem || !filePath || !accessKey) {
        setFormError('Please fill in all required fields.')
        return false
      }
      if (!/^[a-z0-9]+$/i.test(storageAccount)) {
        setFormError('Storage account name looks invalid.')
        return false
      }
      if (!filePath.includes('.')) {
        setFormError('File path should include a file name with extension.')
        return false
      }
      if (accessKey.length < 16) {
        setFormError('Access key seems too short.')
        return false
      }
    }

    if (selectedSource === 'delta') {
      if (
        !workspaceUrl ||
        !catalogName ||
        !schemaName ||
        !tableName ||
        !deltaToken
      ) {
        setFormError('Please fill in all required fields.')
        return false
      }
      if (!workspaceUrl.startsWith('http')) {
        setFormError('Workspace URL should start with http or https.')
        return false
      }
      if (deltaToken.length < 16) {
        setFormError('Token / PAT seems too short.')
        return false
      }
    }

    if (selectedSource === 'onelake') {
      if (!workspaceName || !lakehouseName) {
        setFormError('Please enter workspace and lakehouse names.')
        return false
      }
      if (!oneLakeMode) {
        setFormError('Please choose Files or Tables.')
        return false
      }
      if (!onelakeFilePath) {
        setFormError('Please select a file or table from the list.')
        return false
      }
    }

    if (selectedSource === 'local') {
      if (!selectedFile) {
        setFormError('Please select a CSV file.')
        return false
      }
      if (fileError) {
        setFormError(fileError)
        return false
      }
    }

    return true
  }

  // helper to read user from localStorage
  const getUserFromLocalStorage = () => {
    try {
      const raw = localStorage.getItem('aivolve_user')
      if (!raw) return null
      return JSON.parse(raw) as {
        email?: string
        session_id?: string
        user_id?: string
        agent_name?: string
        [key: string]: any
      }
    } catch {
      return null
    }
  }

  // upload helper (unchanged)
  const uploadFileToBlob = async (file: File): Promise<boolean> => {
    const user = getUserFromLocalStorage()
    const userEmail = user?.email
    const sessionId = user?.session_id

    if (!userEmail || !sessionId) {
      setFormError('User session not found. Please login again.')
      return false
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('session_id', sessionId)
    formData.append('user_email', userEmail)
    formData.append('query', 'false')
    formData.append('source', selectedSource)

    // Append remote connection params if not local
    if (selectedSource !== 'local') {
      formData.append('is_remote', 'true')
      if (selectedSource === 'adls') {
        formData.append('storage_account', storageAccount)
        formData.append('file_system', fileSystem)
        formData.append('file_path', filePath)
        formData.append('auth_type', authType)
        if (authType === 'access-key') {
          formData.append('access_key', accessKey)
        }
      } else if (selectedSource === 'delta') {
        formData.append('workspace_url', workspaceUrl)
        formData.append('catalog_name', catalogName)
        formData.append('schema_name', schemaName)
        formData.append('table_name', tableName)
        formData.append('delta_token', deltaToken)
      } else if (selectedSource === 'onelake') {
        formData.append('workspace_name', workspaceName)
        formData.append('lakehouse_name', lakehouseName)
        formData.append('onelake_file_path', onelakeFilePath)
        formData.append('one_lake_mode', oneLakeMode)
      }
    } else {
      formData.append('is_remote', 'false')
    }

    try {
      const res = await fetch(UPLOAD_FILE_URL, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        console.error('Upload failed', await res.text())
        setFormError('Failed to upload file to blob. Please try again.')
        return false
      }

      return true
    } catch (err) {
      console.error('Upload error:', err)
      setFormError('An error occurred while uploading. Please try again.')
      return false
    }
  }

  // fetch preview for files uploaded to blob (unchanged)
  const fetchDataPreview = async (fileName: string) => {
    const user = getUserFromLocalStorage()
    const userEmail = user?.email
    const userId = user?.user_id
    const agentName = user?.agent_name

    if (!userEmail || !userId || !agentName) {
      setFormError('User information missing. Please login again.')
      return {
        previewRows: [],
        totalRows: 0,
        columnsCount: 0
      }
    }

    const blobPath = `${userId}/${agentName}/${fileName}`
    const url = `${DATA_PREVIEW_URL}?blob_path=${encodeURIComponent(
      blobPath
    )}&user_email=${encodeURIComponent(userEmail)}`

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/json'
        }
      })

      if (!res.ok) {
        console.error('Data preview failed', await res.text())
        setFormError('Failed to fetch data preview. Please try again.')
        return {
          previewRows: [],
          totalRows: 0,
          columnsCount: 0
        }
      }

      const data = await res.json()

      let previewRows: any[] = []
      let columnsCount = 0
      let totalRows = 0

      if (data.preview && Array.isArray(data.preview.rows)) {
        previewRows = data.preview.rows
        totalRows = data.preview.rows.length
        if (Array.isArray(data.preview.columns)) {
          columnsCount = data.preview.columns.length
        } else if (previewRows[0]) {
          columnsCount = Object.keys(previewRows[0]).length
        }
      } else if (Array.isArray(data.preview)) {
        previewRows = data.preview
        totalRows = previewRows.length
        columnsCount = previewRows[0] ? Object.keys(previewRows[0]).length : 0
      } else {
        previewRows = []
        totalRows = 0
        columnsCount = 0
      }

      return {
        previewRows,
        totalRows,
        columnsCount
      }
    } catch (err) {
      console.error('Data preview error:', err)
      setFormError('An error occurred while fetching data preview.')
      return {
        previewRows: [],
        totalRows: 0,
        columnsCount: 0
      }
    }
  }

  // OneLake preview
  const fetchOneLakePreview = async (rows: number) => {
    const encodedWorkspace = encodeURIComponent(workspaceName)
    const encodedLakehouse = encodeURIComponent(lakehouseName)
    const encodedPath = encodeURIComponent(onelakeFilePath)
    const url = `${ONELAKE_BASE_URL}/workspaces/${encodedWorkspace}/lakehouses/${encodedLakehouse}/preview?path=${encodedPath}&rows=${rows}`

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json'
      }
    })

    if (!res.ok) {
      throw new Error('Failed to fetch OneLake preview')
    }

    const data = await res.json()
    return data
  }

  // OneLake contents fetch + drill support
  // NOTE: now returns the parsed response so callers (like table-select) can act on it immediately
  const fetchOneLakeContents = async (path: string) => {
    setIsOneLakeLoadingOptions(true)
    setOneLakeOptionsError('')
    setFormError('')
    try {
      if (!workspaceName || !lakehouseName) {
        setOneLakeOptionsError(
          'Enter workspace and lakehouse names before loading.'
        )
        setIsOneLakeLoadingOptions(false)
        return null
      }

      const encodedWorkspace = encodeURIComponent(workspaceName)
      const encodedLakehouse = encodeURIComponent(lakehouseName)
      const encodedPath = encodeURIComponent(path)
      const url = `${ONELAKE_BASE_URL}/workspaces/${encodedWorkspace}/lakehouses/${encodedLakehouse}/contents?path=${encodedPath}`

      // Record navigation
      setOneLakeCurrentPath(path)

      const res = await fetch(url, {
        method: 'GET',
        headers: { accept: 'application/json' }
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => '')
        console.error('OneLake contents fetch failed:', res.status, txt)
        throw new Error('Failed to fetch OneLake contents')
      }
      const data = await res.json()

      // reset file/folder state
      setOneLakeFiles([])
      setOneLakeTables([])
      setOneLakeFolders([])
      setSelectedOneLakeFile('')
      setSelectedOneLakeTable('')
      setSelectedOneLakeFolder('')
      setOnelakeFilePath('')

      // folders
      if (Array.isArray(data.folders) && data.folders.length > 0) {
        const folderNames = data.folders.map((f: any) => f.name ?? String(f))
        setOneLakeFolders(folderNames)
      }

      // files
      if (Array.isArray(data.files) && data.files.length > 0) {
        const files = data.files.map((f: any) => ({
          name: f.name ?? f.path ?? '',
          full_path: f.full_path ?? f.path ?? f.name ?? '',
          size_bytes: f.size_bytes ?? f.size ?? undefined,
          last_modified: f.last_modified ?? f.modified ?? undefined
        }))
        setOneLakeFiles(files)
      }

      // sometimes root 'Tables' returns folders representing table names (we map to tables)
      if (
        Array.isArray(data.folders) &&
        path.toLowerCase().startsWith('tables') &&
        data.folders.length > 0
      ) {
        const tables = data.folders.map((f: any) => ({
          name: f.name ?? String(f)
        }))
        setOneLakeTables(tables)
      }

      // fallback for items arrays
      if (
        Array.isArray((data as any).items) &&
        (data as any).items.length > 0
      ) {
        const items = (data as any).items
        const foldersFromItems = items
          .filter(
            (i: any) =>
              i.type === 'folder' || i.kind === 'folder' || i.is_folder
          )
          .map((i: any) => i.name || i.path || String(i))
        const filesFromItems = items
          .filter((i: any) => !i.type || i.type === 'file' || i.kind === 'file')
          .map((i: any) => ({
            name: i.name || i.path || '',
            full_path: i.full_path || i.path || i.name || '',
            size_bytes: i.size_bytes || i.size || undefined,
            last_modified: i.last_modified || i.modified || undefined
          }))
        if (foldersFromItems.length)
          setOneLakeFolders(prev => [...prev, ...foldersFromItems])
        if (filesFromItems.length)
          setOneLakeFiles(prev => [...prev, ...filesFromItems])
      }

      // If nothing found
      if (
        data.folders &&
        data.folders.length === 0 &&
        data.files &&
        data.files.length === 0 &&
        (!Array.isArray((data as any).items) ||
          (data as any).items.length === 0)
      ) {
        setOneLakeOptionsError('No folders or files found at this path.')
      }

      // return data for immediate use when caller needs it
      return data
    } catch (err) {
      console.error(err)
      setOneLakeOptionsError(
        'Unable to load path — check workspace/lakehouse names or permissions.'
      )
      return null
    } finally {
      setIsOneLakeLoadingOptions(false)
    }
  }

  // When user selects a top-level table (Tables root) we:
  // 1) fetch contents for Tables/<table>
  // 2) pick the latest file by last_modified
  // 3) set onelakeFilePath to that full_path
  // 4) call preview API and import dataset preview into the UI
  const handleOneLakeTableSelect = async (tableName: string) => {
    if (!tableName) return
    setSelectedOneLakeTable(tableName)
    const path = `Tables/${tableName}`

    // Fetch contents directly without resetting state
    setIsOneLakeLoadingOptions(true)
    setOneLakeOptionsError('')
    const encodedWorkspace = encodeURIComponent(workspaceName)
    const encodedLakehouse = encodeURIComponent(lakehouseName)
    const encodedPath = encodeURIComponent(path)
    const url = `${ONELAKE_BASE_URL}/workspaces/${encodedWorkspace}/lakehouses/${encodedLakehouse}/contents?path=${encodedPath}`

    let data
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { accept: 'application/json' }
      })

      if (!res.ok) {
        setOneLakeOptionsError('Unable to load selected table contents.')
        setIsOneLakeLoadingOptions(false)
        return
      }

      data = await res.json()
    } catch (err) {
      console.error('Fetch error:', err)
      setOneLakeOptionsError('Unable to load selected table contents.')
      setIsOneLakeLoadingOptions(false)
      return
    }

    // prefer data.files array (may be absent)
    const files: any[] = Array.isArray(data.files)
      ? data.files
      : Array.isArray((data as any).items)
      ? (data as any).items.filter(
          (i: any) => i.name && (i.full_path || i.path || i.name)
        )
      : []

    if (!files || files.length === 0) {
      setOneLakeOptionsError('No files found inside selected table folder.')
      return
    }

    // pick latest by last_modified (fallback to first if missing)
    const filesWithDates = files.map((f: any) => ({
      name: f.name ?? f.path ?? '',
      full_path: f.full_path ?? f.path ?? f.name ?? '',
      last_modified: f.last_modified ?? f.modified ?? null,
      raw: f
    }))

    // sort by date desc; parse missing dates as 0
    filesWithDates.sort((a, b) => {
      const ta = a.last_modified ? new Date(a.last_modified).getTime() : 0
      const tb = b.last_modified ? new Date(b.last_modified).getTime() : 0
      return tb - ta
    })

    const latest = filesWithDates[0]
    if (!latest || !latest.full_path) {
      setOneLakeOptionsError('Could not determine file path for preview.')
      return
    }

    // set selected file and onelakeFilePath
    setSelectedOneLakeFile(latest.name)
    setOnelakeFilePath(latest.full_path)

    // now call preview for this path and import preview
    try {
      setIsOneLakeLoadingOptions(true)
      const previewData = await fetchOneLakePreview(5)
      // previewData shape may vary — try to extract rows/columns
      const previewRows =
        (previewData?.preview &&
          (previewData.preview.data || previewData.preview.rows)) ||
        []
      const previewColumns = previewData?.preview?.columns || []

      // If previewRows are objects keyed by column names, use them directly.
      // Build an ImportedDataset to show preview using onDatasetImported
      const fullPreviewData = await fetchOneLakePreview(1000)
      const fullRows =
        (fullPreviewData?.preview &&
          (fullPreviewData.preview.data || fullPreviewData.preview.rows)) ||
        []
      const fullColumns =
        fullPreviewData?.preview?.columns || previewColumns || []

      // convert to CSV file (so downstream behaves same as file import)
      const colNames = fullColumns.map((c: any) => c.name)
      const csvLines = [colNames.join(',')]
      fullRows.forEach((row: any) => {
        const values = colNames.map((c: any) => {
          let val = String(row[c] ?? '')
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            val = val.replace(/"/g, '""')
            val = `"${val}"`
          }
          return val
        })
        csvLines.push(values.join(','))
      })
      const csvText = csvLines.join('\n')
      const blob = new Blob([csvText], { type: 'text/csv' })
      const fileName = `${tableName}.csv`
      const fileObj = new File([blob], fileName, { type: 'text/csv' })

      const dataset: ImportedDataset = {
        id: Date.now().toString(),
        name: fileName,
        source: 'onelake' as any,
        rows: fullPreviewData?.preview?.rows_returned || fullRows.length || 0,
        columns: fullColumns.length || 0,
        preview: previewRows || [],
        file: fileObj
      }

      // pass preview up to the parent so it will render in your preview pane
      onDatasetImported(dataset)
    } catch (err) {
      console.error('OneLake preview error:', err)
      setOneLakeOptionsError('Failed to preview selected table. Try again.')
    } finally {
      setIsOneLakeLoadingOptions(false)
    }
  }

  // When user chooses a top-level folder (Files mode), we drill similarly
  const handleOneLakeFolderSelect = async (folderName: string) => {
    if (!folderName) return
    setSelectedOneLakeFolder(folderName)
    const root = oneLakeMode === 'files' ? 'Files' : 'Tables'
    const path = `${root}/${folderName}`
    await fetchOneLakeContents(path)
  }

  // When user selects a file from files dropdown
  const handleOneLakeFileSelect = (fileName: string) => {
    setSelectedOneLakeFile(fileName)
    const match = oneLakeFiles.find(
      f => f.name === fileName || f.full_path === fileName
    )
    if (match && match.full_path) {
      setOnelakeFilePath(match.full_path)
    } else {
      const path = oneLakeCurrentPath
        ? `${oneLakeCurrentPath}/${fileName}`
        : fileName
      setOnelakeFilePath(path)
    }
  }

  const handleConnect = async () => {
    if (!validateConnectionParams()) return

    setIsLoading(true)
    setFormError('')

    // Determine dataset/file name
    let datasetName = 'Dataset'
    if (selectedSource === 'local') {
      datasetName = selectedFile?.name || 'dataset.csv'
    } else if (selectedSource === 'adls') {
      datasetName = filePath.split('/').pop() || 'adls_dataset.csv'
    } else if (selectedSource === 'delta') {
      datasetName = tableName || 'delta_table.csv'
    }  else if (selectedSource === 'onelake') {
  // Extract table name from path like "Tables/customer_churn"
  if (oneLakeMode === 'tables' && selectedOneLakeTable) {
    datasetName = `${selectedOneLakeTable}.csv`
  } else {
    datasetName = onelakeFilePath.split('/').pop() || 'onelake_dataset.csv'
  }
}

    const uploadFileName = datasetName.toLowerCase().endsWith('.csv')
      ? datasetName
      : `${datasetName}.csv`

    try {
      if (selectedSource === 'onelake') {
        // Use onelakeFilePath to preview
        const previewData = await fetchOneLakePreview(5)
        const previewRows =
          (previewData.preview && previewData.preview.data) || []
        const fullData = await fetchOneLakePreview(1000)
        const fullRows = (fullData.preview && fullData.preview.data) || []
        const fullColumns = fullData.preview?.columns || []

        const csvLines = [fullColumns.map((c: any) => c.name).join(',')]
        fullRows.forEach((row: any) => {
          const values = fullColumns.map((c: any) => {
            let val = String(row[c.name] ?? '')
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
              val = val.replace(/"/g, '""')
              val = `"${val}"`
            }
            return val
          })
          csvLines.push(values.join(','))
        })
        const csvText = csvLines.join('\n')
        const blob = new Blob([csvText], { type: 'text/csv' })
        const fullFile = new File([blob], uploadFileName, { type: 'text/csv' })

        const dataset: ImportedDataset = {
          id: Date.now().toString(),
          name: uploadFileName,
          source: selectedSource as any,
          rows: fullData.preview?.rows_returned || fullRows.length || 0,
          columns: fullColumns.length,
          preview: previewRows,
          file: fullFile
        }

        onDatasetImported(dataset)
        setShowConnectionModal(false)
      } else {
        let fileToUpload: File | null = null

        if (selectedSource === 'local' && selectedFile) {
          fileToUpload = new File([selectedFile], uploadFileName, {
            type: selectedFile.type || 'text/csv'
          })
        } else {
          const blob = new Blob([''], { type: 'text/csv' })
          fileToUpload = new File([blob], uploadFileName, { type: 'text/csv' })
        }

        if (!fileToUpload) {
          setFormError('Unable to prepare file for upload.')
          setIsLoading(false)
          return
        }

        const uploadOk = await uploadFileToBlob(fileToUpload)
        if (!uploadOk) {
          setIsLoading(false)
          return
        }

        const previewResult = await fetchDataPreview(fileToUpload.name)

        const dataset: ImportedDataset = {
          id: Date.now().toString(),
          name: uploadFileName,
          source: selectedSource as any,
          rows: previewResult.totalRows || 0,
          columns: previewResult.columnsCount || 0,
          preview: previewResult.previewRows || [],
          file: fileToUpload
        }

        onDatasetImported(dataset)
        setShowConnectionModal(false)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getSourceTitle = () => {
    switch (selectedSource) {
      case 'adls':
        return 'ADLS Gen2'
      case 'delta':
        return 'Delta Tables'
      case 'onelake':
        return 'OneLake'
      case 'local':
        return 'Local File'
      default:
        return 'Connection'
    }
  }

  const renderConnectionForm = () => {
    if (selectedSource === 'adls') {
      return (
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Storage Account Name *</Label>
            <Input
              value={storageAccount}
              onChange={e => setStorageAccount(e.target.value)}
              placeholder='mystorageaccount'
            />
          </div>
          <div className='space-y-2'>
            <Label>File System (Container) *</Label>
            <Input
              value={fileSystem}
              onChange={e => setFileSystem(e.target.value)}
              placeholder='mycontainer'
            />
          </div>
          <div className='space-y-2 md:col-span-2'>
            <Label>File Path *</Label>
            <Input
              value={filePath}
              onChange={e => setFilePath(e.target.value)}
              placeholder='data/customers.csv'
            />
          </div>
          <div className='space-y-2'>
            <Label>Authentication Type *</Label>
            <Select
              value={authType}
              onValueChange={(v: AuthType) => setAuthType(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select auth type' />
              </SelectTrigger>
              <SelectContent className='bg-background border border-border z-[400]'>
                <SelectItem value='access-key'>Access Key</SelectItem>
                <SelectItem value='sas-token'>SAS Token</SelectItem>
                <SelectItem value='service-principal'>
                  Service Principal
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label>Access Key *</Label>
            <Input
              type='password'
              value={accessKey}
              onChange={e => setAccessKey(e.target.value)}
              placeholder='Enter access key'
            />
          </div>
        </div>
      )
    }

    if (selectedSource === 'delta') {
      return (
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2 md:col-span-2'>
            <Label>Workspace URL *</Label>
            <Input
              value={workspaceUrl}
              onChange={e => setWorkspaceUrl(e.target.value)}
              placeholder='https://adb-xxx.azuredatabricks.net'
            />
          </div>
          <div className='space-y-2'>
            <Label>Catalog Name *</Label>
            <Input
              value={catalogName}
              onChange={e => setCatalogName(e.target.value)}
              placeholder='main_catalog'
            />
          </div>
          <div className='space-y-2'>
            <Label>Schema Name *</Label>
            <Input
              value={schemaName}
              onChange={e => setSchemaName(e.target.value)}
              placeholder='default'
            />
          </div>
          <div className='space-y-2'>
            <Label>Table Name *</Label>
            <Input
              value={tableName}
              onChange={e => setTableName(e.target.value)}
              placeholder='customer_data'
            />
          </div>
          <div className='space-y-2'>
            <Label>Token / PAT *</Label>
            <Input
              type='password'
              value={deltaToken}
              onChange={e => setDeltaToken(e.target.value)}
              placeholder='Enter personal access token'
            />
          </div>
        </div>
      )
    }

    if (selectedSource === 'onelake') {
      return (
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label>Workspace Name *</Label>
            <Input
              value={workspaceName}
              onChange={e => setWorkspaceName(e.target.value)}
              placeholder='MyWorkspace'
            />
          </div>
          <div className='space-y-2'>
            <Label>Lakehouse Name *</Label>
            <Input
              value={lakehouseName}
              onChange={e => setLakehouseName(e.target.value)}
              placeholder='MyLakehouse'
            />
          </div>

          <div className='space-y-2'>
            <Label>Type *</Label>
            <Select
              value={oneLakeMode}
              onValueChange={(v: OneLakeMode) => {
                setOneLakeMode(v) // ✅ SET THE MODE!
                setOneLakeFiles([])
                setOneLakeFolders([])
                setOneLakeTables([]) // ✅ RESET TABLES
                setSelectedOneLakeFile('')
                setSelectedOneLakeFolder('')
                setSelectedOneLakeTable('') // ✅ RESET SELECTION
                setOnelakeFilePath('') // ✅ RESET PATH

                // Load root listing for chosen mode
                if (v === 'files' || v === 'tables') {
                  const root = v === 'files' ? 'Files' : 'Tables'
                  void fetchOneLakeContents(root)
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select' />
              </SelectTrigger>
              <SelectContent className='bg-background border border-border z-[400]'>
                <SelectItem value='files'>Files</SelectItem>
                <SelectItem value='tables'>Tables</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* current path display
          {oneLakeCurrentPath && (
            <div className='md:col-span-2 flex items-center gap-3'>
              <p className='text-xs text-muted-foreground'>
                Current:{' '}
                <span className='font-medium text-foreground'>
                  {oneLakeCurrentPath}
                </span>
              </p>
            </div>
          )} */}
{/* 
          {/* Folders dropdown for Files mode */}
          {/* {oneLakeMode === 'files' &&
            oneLakeFolders &&
            oneLakeFolders.length > 0 && (
              <div className='md:col-span-2 space-y-2'>
                <Label>Folders</Label>
                <Select
                  value={selectedOneLakeFolder}
                  onValueChange={value => {
                    setSelectedOneLakeFolder(value)
                    void handleOneLakeFolderSelect(value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isOneLakeLoadingOptions ? 'Loading...' : 'Select folder'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className='bg-background border border-border z-[400] max-h-72'>
                    {oneLakeFolders.map(f => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}  */}

          {/* Files dropdown (when files exist) */}
          {oneLakeFiles && oneLakeFiles.length > 0 && oneLakeMode === 'files' && (
            <div className='md:col-span-2 space-y-2'>
              <Label>Files</Label>
              <Select
                value={selectedOneLakeFile}
                onValueChange={value => handleOneLakeFileSelect(value)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isOneLakeLoadingOptions ? 'Loading...' : 'Select file'
                    }
                  />
                </SelectTrigger>
                <SelectContent className='bg-background border border-border z-[400] max-h-72'>
                  {oneLakeFiles.map(f => (
                    <SelectItem key={f.full_path || f.name} value={f.name}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* <p className='text-xs text-muted-foreground'>
                Selected path:{' '}
                <span className='font-medium'>{onelakeFilePath || '—'}</span>
              </p> */}
            </div>
          )}

          {/* Tables: show table list in a single dropdown (top-level table folders). When user selects one, we automatically drill, pick latest file and preview */}
          {oneLakeMode === 'tables' &&
            oneLakeTables &&
            oneLakeTables.length > 0 && (
              <div className='md:col-span-2 space-y-2'>
                <Label>Tables</Label>
                <Select
                  value={selectedOneLakeTable}
                  onValueChange={value => {
                    setSelectedOneLakeTable(value)
                    void handleOneLakeTableSelect(value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isOneLakeLoadingOptions ? 'Loading...' : 'Select table'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className='bg-background border border-border z-[400] max-h-72'>
                    {oneLakeTables.map(t => (
                      <SelectItem key={t.name} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* <p className='text-xs text-muted-foreground'>
                  Selected path (will preview latest file):{' '}
                  <span className='font-medium'>{onelakeFilePath || '—'}</span>
                </p> */}
              </div>
            )}

          {/* {oneLakeOptionsError && (
            <p className='text-xs text-destructive flex items-center gap-1 md:col-span-2'>
              <AlertCircle className='w-3 h-3' />
              {oneLakeOptionsError}
            </p>
          )} */}
        </div>
      )
    }

    if (selectedSource === 'local') {
      return (
        <div className='space-y-4'>
          <div className='border-2 border-dashed border-border rounded-xl p-8 text-center'>
            <Upload className='w-12 h-12 mx-auto mb-4 text-muted-foreground' />
            <input
              type='file'
              accept='.csv'
              onChange={handleFileChange}
              className='hidden'
              id='file-upload'
            />
            <label htmlFor='file-upload' className='cursor-pointer'>
              <Button variant='outline' size='sm' asChild>
                <span>Choose CSV File</span>
              </Button>
            </label>
            {selectedFile && (
              <p className='mt-3 text-sm text-foreground font-medium'>
                {selectedFile.name}
              </p>
            )}
            {fileError && (
              <p className='mt-2 text-sm text-destructive flex items-center justify-center gap-1'>
                <AlertCircle className='w-4 h-4' />
                {fileError}
              </p>
            )}
          </div>
        </div>
      )
    }

    return null
  }

  const canConnect = () => {
    switch (selectedSource) {
      case 'adls':
        return !!(storageAccount && fileSystem && filePath && accessKey)
      case 'delta':
        return !!(
          workspaceUrl &&
          catalogName &&
          schemaName &&
          tableName &&
          deltaToken
        )
      case 'onelake':
        return !!(
          workspaceName &&
          lakehouseName &&
          oneLakeMode &&
          onelakeFilePath
        )
      case 'local':
        return selectedFile !== null && !fileError
      default:
        return false
    }
  }

  // Dynamic preview table using selectedDataset.preview
  const renderPreviewTable = () => {
    if (!selectedDataset?.preview || !Array.isArray(selectedDataset.preview)) {
      return (
        <div className='px-4 md:px-6 py-6 text-sm text-muted-foreground'>
          No preview data available.
        </div>
      )
    }

    const rows: any[] = selectedDataset.preview
    if (!rows.length) {
      return (
        <div className='px-4 md:px-6 py-6 text-sm text-muted-foreground'>
          No preview rows returned.
        </div>
      )
    }

    const columns = Object.keys(rows[0])

    return (
      <div className='overflow-x-auto'>
        <table className='w-full text-xs md:text-sm'>
          <thead>
            <tr className='border-b border-border bg-muted/40'>
              {columns.map(col => (
                <th
                  key={col}
                  className='px-4 md:px-6 py-3 text-left font-medium text-muted-foreground'
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className='border-b border-border/50 last:border-0 hover:bg-muted/30'
              >
                {columns.map(col => (
                  <td
                    key={col}
                    className='px-4 md:px-6 py-3 text-muted-foreground'
                  >
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className='min-h-full bg-muted/30 flex flex-col'>
      {/* Header */}
      <div className='w-full bg-background/80 backdrop-blur border-b border-border px-4 md:px-8 py-4 flex items-center gap-3'>
        <Button
          variant='ghost'
          size='icon'
          className='h-9 w-9'
          onClick={onBackToJobs}
        >
          <ArrowLeft className='w-4 h-4' />
        </Button>
        <h1 className='text-xl md:text-2xl font-semibold text-foreground'>
          Select a datasource
        </h1>
      </div>

      {/* Main content */}
      <div className='flex-1 w-full px-4 md:px-8 py-6 space-y-8'>
        {/* Source Selection */}
        <section className='w-full'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 w-full'>
            {[
              { id: 'adls', label: 'ADLS Gen2', icon: Cloud },
              { id: 'delta', label: 'Delta Tables', icon: Database },
              { id: 'onelake', label: 'OneLake', icon: FolderOpen },
              { id: 'local', label: 'Local Files', icon: Upload }
            ].map(source => (
              <motion.button
                key={source.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSourceSelect(source.id as ImportSource)}
                className={`group relative h-full text-left p-4 md:p-5 rounded-xl border transition-all w-full
                  ${
                    selectedSource === source.id
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-primary/5'
                  }`}
              >
                <div className='flex items-center gap-3 mb-3'>
                  <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                    <source.icon className='w-5 h-5 text-primary' />
                  </div>
                  <div className='min-w-0'>
                    <p className='font-semibold text-foreground text-sm md:text-base truncate'>
                      {source.label}
                    </p>
                  </div>
                </div>
                <div className='flex items-center justify-between text-[11px] md:text-xs text-muted-foreground'>
                  <span>Configure</span>
                  <span className='text-primary font-medium group-hover:underline'>
                    Open →
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Dataset Preview */}
        {selectedDataset && (
          <section className='w-full'>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-card rounded-xl border border-border overflow-hidden w-full'
            >
              <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-border'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <h2 className='text-base md:text-lg font-semibold text-foreground'>
                      Dataset Preview
                    </h2>
                    <span className='text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100'>
                      {selectedDataset.rows?.toLocaleString?.() || '—'} rows •{' '}
                      {selectedDataset.columns || '—'} columns
                    </span>
                  </div>
                  <p className='text-xs md:text-sm text-muted-foreground'>
                    <span className='text-foreground font-medium'>
                      {selectedDataset.name}
                    </span>
                  </p>
                </div>

                <div className='flex gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={onBackToJobs}
                    className='text-xs md:text-sm'
                  >
                    Back to Jobs
                  </Button>
                  <Button
                    size='sm'
                    onClick={onNext}
                    className='text-xs md:text-sm'
                  >
                    {targetTab === 'compare'
                      ? 'Continue to Compare'
                      : 'Continue to Build'}
                  </Button>
                </div>
              </div>

              {renderPreviewTable()}
            </motion.div>
          </section>
        )}
      </div>

      {/* Connection Modal */}
      <Dialog open={showConnectionModal} onOpenChange={setShowConnectionModal}>
        <DialogContent className='w-[94vw] max-w-2xl bg-background border border-border max-h-[85vh] flex flex-col overflow-visible'>
          <DialogHeader className='flex-shrink-0'>
            <DialogTitle className='flex items-center gap-2 text-foreground'>
              {selectedSource === 'adls' && (
                <Cloud className='w-5 h-5 text-primary' />
              )}
              {selectedSource === 'delta' && (
                <Database className='w-5 h-5 text-primary' />
              )}
              {selectedSource === 'onelake' && (
                <FolderOpen className='w-5 h-5 text-primary' />
              )}
              {selectedSource === 'local' && (
                <Upload className='w-5 h-5 text-primary' />
              )}
              {getSourceTitle()} connection
            </DialogTitle>
          </DialogHeader>

          <div className='flex-1 overflow-y-auto py-4 space-y-3'>
            {renderConnectionForm()}
            {formError && (
              <div className='flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive'>
                <AlertCircle className='w-4 h-4 mt-[1px]' />
                <span>{formError}</span>
              </div>
            )}
          </div>

          <div className='flex-shrink-0 flex justify-end gap-3 pt-4 border-t border-border'>
            <Button
              variant='outline'
              onClick={() => setShowConnectionModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={!canConnect() || isLoading}
            >
              {isLoading ? 'Processing…' : 'Connect & Import'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DataSourceTab
