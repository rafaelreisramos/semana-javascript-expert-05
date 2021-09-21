import { jest } from '@jest/globals'
import { Readable, Transform, Writable } from 'stream'

export default class TestUtils {
  
  static generateReadableStream(data) {
    return new Readable({
      objectMode: true,
      read() {
        for(const chunk of data) {
          this.push(chunk)
        }

        this.push(null)
      }
    })
  }

  static generateWritableStream(onData) {
    return new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        onData(chunk)

        callback(null, chunk)
      }
    })
  }

  static generateTransformStream(onData) {
    return new Transform({
      objectMode: true,
      transform(chunk, encoding, callback) {
        onData(chunk)

        callback(null, chunk)
      }
    })
  }

  static getTimeFromDate(date) {
    return new Date(date).getTime()    
  }

  static mockDateNow(mockImplementationPeriods) {
    const now = jest.spyOn(global.Date, global.Date.now.name)

    mockImplementationPeriods.forEach(time => {
      now.mockReturnValueOnce(time)
    })
  }
}