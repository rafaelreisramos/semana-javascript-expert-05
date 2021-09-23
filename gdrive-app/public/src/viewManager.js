export default class ViewManager {
  constructor() {
    this.tbody = document.getElementById('tbody')
    
    this.newFileButton = document.getElementById('newFileButton')
    this.fileElem = document.getElementById('fileElem')
    
    this.modal = {}
    this.progressModal = document.getElementById('progressModal')
    this.progressBar = document.getElementById('progressBar')
    this.output = document.getElementById('output')

    this.formatter = new Intl.DateTimeFormat('pt', {
      locale: 'pt-br',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  configureFileButtonClick() {
    this.newFileButton.onclick = () => this.fileElem.click()
  }

  configureOnFileChange(fn) {
    this.fileElem.onchange = e => fn(e.target.files)
  }

  configureModal() {
    this.modal = M.Modal.init(this.progressModal, {
      opacity: 0,
      dismissable: false,
      
      onOpenEnd() { // allow click outside modal when open
        this.$overlay[0].remove()
      }
    })
  }

  openModal() {
    this.modal.open()
  }

  closeModal() {
    this.modal.close()
  }

  updateProgressBarModalStatus(size) {
    this.output.innerHTML = `
      Uploading <b>${Math.floor(size)}%</b>
    `
    this.progressBar.value = size
  }

  getFileType(file) {
    return file.match(/\.mp4|avi/i) ? 'movie' 
      : file.match(/\.jp|png/i) ? 'image' : 'content_copy'
  }

  getIcon(file) {
    const icon = this.getFileType(file)
    const colors = {
      image: 'yellow600',
      movie: 'red600',
      file: ''
    }

    return `
      <i class="material-icons ${colors[icon]} left">${icon}</i>
    `
  }

  updateCurrentFiles(files) { 
    const template = (item) => `
      <tr>
        <td>${this.getIcon(item.file)} ${item.file}</td>
        <td>${item.owner}</td>
        <td>${this.formatter.format(new Date(item.lastModified))}</td>
        <td>${item.size}</td>
      </tr>
    `

    this.tbody.innerHTML = files.map(template).join('')
  }
}