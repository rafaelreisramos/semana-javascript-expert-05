import AppController from './src/appController.js'
import ConnectionManager from './src/connectionManager.js'
import DragAndDropManager from './src/dragAndDropManager.js'
import ViewManager from './src/viewManager.js'
import ModalManager from './src/modalManager.js'

const API_URL = "https://localhost:3000"

const appController = new AppController({
  connectionManager: new ConnectionManager({
    apiUrl: API_URL,
  }),
  viewManager: new ViewManager(),
  dragAndDropManager: new DragAndDropManager(),
  modalManager: new ModalManager()
})

try {
  await appController.initialize()
} catch (error) {
  console.error('error on initializing', error)
}