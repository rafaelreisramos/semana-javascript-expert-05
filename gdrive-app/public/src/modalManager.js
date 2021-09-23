export default class ModalManager {
  constructor() {
    this.modal = {}
    this.progressModal = document.getElementById('progressModal')
    this.progressBar = document.getElementById('progressBar')
    this.output = document.getElementById('output')
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
}