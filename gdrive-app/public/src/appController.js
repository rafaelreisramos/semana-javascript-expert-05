export default class AppController {
  constructor({ connectionManager, viewManager, dragAndDropManager }) {
    this.connectionManager = connectionManager
    this.viewManager = viewManager
    this.dragAndDropManager = dragAndDropManager

    this.uploadingFiles = new Map()
  }

  async initialize() {
    this.viewManager.configureFileButtonClick()
    this.viewManager.configureOnFileChange(this.onFileChange.bind(this))
    
    this.connectionManager.configureEvents({
      onProgress: this.onProgress.bind(this)
    })

    this.viewManager.configureModal()
    this.viewManager.updateProgressBarModalStatus(0)

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
    
    this.viewManager.updateProgressBarModalStatus(totalProgress)
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
      requests.push(this.connectionManager.uploadFile(file))
    }

    this.viewManager.openModal()
    this.viewManager.updateProgressBarModalStatus(0)

    await Promise.all(requests)

    this.viewManager.updateProgressBarModalStatus(100)

    setTimeout(() => {
      this.viewManager.closeModal()
    }, 1000)

    await this.updateCurrentFiles()
  }

  async updateCurrentFiles() {
    const files = await this.connectionManager.currentFiles()
    this.viewManager.updateCurrentFiles(files)
  }
}