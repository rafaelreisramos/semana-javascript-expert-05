import { jest } from '@jest/globals'
import FormData from 'form-data'
import fs from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { logger } from '../../src/logger.js'
import TestUtils from '../utils/testUtils.js'
import Routes from '../../src/routes.js'

describe('#Routes Integration Test', () => {
  let downloadsFolder = ''

  beforeAll(async () => {
    downloadsFolder = await fs.promises.mkdtemp(join(tmpdir(), 'downloads-'))
  })

  afterAll(async () => {
    downloadsFolder = await fs.promises.rm(downloadsFolder, { recursive: true })
  })

  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation()
  })
  
  describe('#getFileStatus', () => {   
    const ioObj = {
      to: (id) => ioObj,
      emit: (event, message) => {}
    }

    it('should upload the file to the folder', async () => {
      const filename = 'semanajsexpert.png'
      const fileStream = fs.createReadStream(`./tests/integration/mocks/${filename}`)
      const response = TestUtils.generateWritableStream(() => {})

      const form = new FormData()
      form.append('photo', fileStream)

      const defaultParams = {
        request: Object.assign(form, {
          headers: form.getHeaders(),
          method: 'POST',
          url: '?socketId=1'
        }),
        response: Object.assign(response, {
          setHeader: jest.fn(),
          writeHead: jest.fn(),
          end: jest.fn()
        }),
        values: () => Object.values(defaultParams)
      }

      const routes = new Routes(downloadsFolder)
      routes.setSocketInstance(ioObj)

      let dir = await fs.promises.readdir(downloadsFolder)
      expect(dir).toEqual([])
      await routes.handler(...defaultParams.values())
      dir = await fs.promises.readdir(downloadsFolder)
      expect(dir).toEqual([filename])

      expect(defaultParams.response.writeHead).toHaveBeenCalledWith(200)
      expect(defaultParams.response.end)
        .toHaveBeenCalledWith(
          JSON.stringify({ result: 'Files uploaded with success.' })
        )
    })
  })
})