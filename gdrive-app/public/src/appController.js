export default class AppController {
  constructor({ connectionManager, viewManager, dragAndDropManager, modalManager }) {
    this.connectionManager = connectionManager
    this.viewManager = viewManager
    this.dragAndDropManager = dragAndDropManager
    this.modalManager = modalManager

    this.uploadingFiles = new Map()
  }

  async initialize() {
    this.viewManager.configureFileButtonClick()
    this.viewManager.configureOnFileChange(this.onFileChange.bind(this))
    
    this.connectionManager.configureEvents({
      onProgress: this.onProgress.bind(this)
    })

    this.modalManager.configureModal()
    this.modalManager.updateProgressBarModalStatus(0)

    this.dragAndDropManager.initialize({
      onDrop: this.onFileChange.bind(this)
    })

    await this.updateCurrentFiles()
  }

  async onProgress({ done, filename }) {
    const file = this.uploadingFiles.get(filename)
    const alreadyDone = Math.ceil(done / file.size * 100)

    this.updateProgress(file, alreadyDone)

    if (alreadyDone < 98) return

    return this.updateCurrentFiles()
  }

  updateProgress(file, percent) {
    const uploadingFiles = this.uploadingFiles
    file.percent = percent

    const totalProgress = [...uploadingFiles.values()]
      .map(({ percent }) => percent ?? 0)
      .reduce((total, current) => total + current, 0)
    
    this.modalManager.updateProgressBarModalStatus(totalProgress)
  }

  async onFileChange(files) {
    /**
     * bug: starting a new upload when another is running will close
     * current modal and start a new one  
     */
    this.uploadingFiles.clear()

    const requests = []

    for (const file of files) {
      this.uploadingFiles.set(file.name, file)
      requests.push(this.uploadFile(file))
    }

    this.modalManager.openModal()
    this.modalManager.updateProgressBarModalStatus(0)

    await Promise.all(requests)

    this.modalManager.updateProgressBarModalStatus(100)

    setTimeout(() => {
      this.modalManager.closeModal()
    }, 1000)

    await this.updateCurrentFiles()
  }

  async uploadFile(file) {
    const formData = new FormData()
    formData.append('files', file)
    
    const { apiUrl, socketId } = this.connectionManager.getConnectionInfo()
    const response = await fetch(`${apiUrl}?socketId=${socketId}`, {
      method: 'POST',
      body: formData
    })

    return response.json()
  }

  async updateCurrentFiles() {
    const { apiUrl } = this.connectionManager.getConnectionInfo()
    const files = await (await fetch(apiUrl)).json()

    this.viewManager.updateCurrentFiles(files)
  }
}