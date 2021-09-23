export default class ConnectionManager {
  constructor({ apiUrl }) {
    this.apiUrl = apiUrl
    
    this.ioClient = io.connect(apiUrl, { withCredentials: false })
    this.socketId = ''
  }

  configureEvents({ onProgress }) {
    this.ioClient.on('connect', this.onConnect.bind(this))
    this.ioClient.on('file-upload', onProgress)
  }

  onConnect() {
    console.log('connected', this.ioClient.id)
    this.socketId = this.ioClient.id
  }

  getConnectionInfo() {
    return {
      apiUrl: this.apiUrl,
      socketId: this.socketId
    }
  }
}