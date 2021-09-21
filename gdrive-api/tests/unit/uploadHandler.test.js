import { jest } from '@jest/globals'
import fs from 'fs'
import { resolve } from 'path'
import { pipeline } from 'stream/promises'
import { logger } from '../../src/logger.js'
import UploadHandler from '../../src/uploadHandler.js'
import TestUtils from '../utils/testUtils.js'

describe('#UploadHandler test suite', () => {
  const downloadsFolder = '/tmp'

  beforeEach(() => {
    jest.spyOn(logger, 'info').mockImplementation()
  })

  describe('#registerEvents', () => {
    it('should call onFile and onFinish on Busboy instance', () => {
      const uploadHandler = new UploadHandler({ downloadsFolder })
      
      jest.spyOn(uploadHandler, uploadHandler.onFile.name)
        .mockResolvedValue()

      const headers = {
        'content-type': 'multipart/form-data; boundary='
      }

      const onFinish = jest.fn()
      const busboy = uploadHandler.registerEvents(headers, onFinish)

      const fileStream = TestUtils.generateReadableStream([ 'chunk', 'of', 'data' ])

      busboy.emit('file', 'fieldname', fileStream, 'filename.txt')
      busboy.listeners('finish')[0].call()

      expect(uploadHandler.onFile).toHaveBeenCalled()
      expect(onFinish).toHaveBeenCalled()
    })    
  })

  describe('#onFile', () => {
    it('should save on disk given a stream file', async () => {
      const chunks = ['hey', 'dude']

      const uploadHandler = new UploadHandler({ downloadsFolder })

      const onData = jest.fn()
      jest.spyOn(fs, fs.createWriteStream.name)
        .mockImplementation(() => TestUtils.generateWritableStream(onData))

      const onTransform = jest.fn()
      jest.spyOn(uploadHandler, uploadHandler.onData.name)
        .mockImplementation(() => TestUtils.generateTransformStream(onTransform))

      const params = {
        fieldname: 'image',
        file: TestUtils.generateReadableStream(chunks),
        filename: 'filename.png'
      }

      await uploadHandler.onFile(...Object.values(params))
      expect(onData.mock.calls.join()).toEqual(chunks.join())
      expect(onTransform.mock.calls.join()).toEqual(chunks.join())

      const filename = resolve(uploadHandler.downloadsFolder, params.filename)
      expect(fs.createWriteStream).toHaveBeenCalledWith(filename)
    })
  })

  describe('#onData', () => {
    it('should call emit and it is a transform stream', async () => {
      const ioObj = {
        to: (id) => ioObj,
        emit: (event, message) => {}
      }

      jest.spyOn(ioObj, ioObj.to.name)
      jest.spyOn(ioObj, ioObj.emit.name)

      const uploadHandler = new UploadHandler({
        io: ioObj,
        socketId: '1'
      })

      jest.spyOn(uploadHandler, uploadHandler.canExecute.name)
        .mockReturnValueOnce(true)

      const messages = ['hello']
      const source = TestUtils.generateReadableStream(messages)
      const onWrite = jest.fn()
      const target = TestUtils.generateWritableStream(onWrite)

      await pipeline(
        source,
        uploadHandler.onData(),
        target
      )
      
      expect(ioObj.to).toHaveBeenCalledTimes(messages.length)
      expect(ioObj.emit).toHaveBeenCalledTimes(messages.length)

      /**
       * se onData for um transform stream, o pipeline vai continuar o processo,
       * passar os dados para a frente e chamar a função no target a cada chunk.
       */
      expect(onWrite).toHaveBeenCalledTimes(messages.length)
      expect(onWrite.mock.calls.join()).toEqual(messages.join())
    })

    it('should emit only two messages in a 3sec period given a timerDelay of 2secs', async () => {
      const ioObj = {
        to: (id) => ioObj,
        emit: (event, message) => {}
      }

      const uploadHandler = new UploadHandler({
        io: ioObj,
        socketId: '1',
        messageTimeDelay: 2000
      })

      const messages = ['chunk', 'of', 'messages']
      const filename = 'filename.mp4'
      const source = TestUtils.generateReadableStream(messages)

      jest.spyOn(ioObj, ioObj.emit.name)   
      
      const onFirstLastMessageSent = TestUtils.getTimeFromDate('2021-07-01 00:00:00')
      
      const onFirstCanExecute = TestUtils.getTimeFromDate('2021-07-01 00:00:02')
      const onSecondUpdateLastMessageSent = onFirstCanExecute
      
      const onSecondCanExecute = TestUtils.getTimeFromDate('2021-07-01 00:00:03')
      
      const onThirdCanExecute = TestUtils.getTimeFromDate('2021-07-01 00:00:04')
      
      TestUtils.mockDateNow([
        onFirstLastMessageSent,
        onFirstCanExecute,
        onSecondUpdateLastMessageSent,
        onSecondCanExecute,
        onThirdCanExecute
      ])

      await pipeline(
        source,
        uploadHandler.onData(filename),
      )

      expect(ioObj.emit).toHaveBeenCalledTimes(2)

      const [firstCallResult, secondCallResult] = ioObj.emit.mock.calls

      expect(firstCallResult).toEqual([
        uploadHandler.ON_UPLOAD_EVENT, 
        { done: 'chunk'.length, filename }
      ])
      expect(secondCallResult).toEqual([
        uploadHandler.ON_UPLOAD_EVENT, 
        { done: messages.join('').length, filename }
      ])
    })
  })

  describe('#canExecute', () => {
    it('should return true if the time delay has passed', () => {
      const uploadHandler = new UploadHandler({
        messageTimeDelay: 1000
      })

      const elapsedTime = TestUtils.getTimeFromDate('2021-07-01 00:00:03')
      TestUtils.mockDateNow([elapsedTime])

      const startTime = TestUtils.getTimeFromDate('2021-07-01 00:00:00')
      const canExecute = uploadHandler.canExecute(startTime)

      expect(canExecute).toBeTruthy()
    })

    it('should return false if the time delay has not passed', () => {
      const uploadHandler = new UploadHandler({
        messageTimeDelay: 2000
      })

      const elapsedTime = TestUtils.getTimeFromDate('2021-07-01 00:00:01')
      TestUtils.mockDateNow([elapsedTime])

      const startTime = TestUtils.getTimeFromDate('2021-07-01 00:00:00')
      const canExecute = uploadHandler.canExecute(startTime)

      expect(canExecute).toBeFalsy()
    })
  })
})