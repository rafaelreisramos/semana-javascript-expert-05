import { jest } from '@jest/globals'
import fs from 'fs'
import FileHelper from '../../src/fileHelper.js'

describe('#FileHelper test suite', () => {
  describe('#getFileStatus', () => {
    it('should return files statuses in correct format', async () => {
      const statMock = {
        dev: 64769,
        mode: 33204,
        nlink: 1,
        uid: 1000,
        gid: 1000,
        rdev: 0,
        blksize: 4096,
        ino: 13245419,
        size: 196068,
        blocks: 384,
        atimeMs: 1631299979713.7454,
        mtimeMs: 1631299979713.7454,
        ctimeMs: 1631299979713.7454,
        birthtimeMs: 1631299979713.7454,
        atime: '2021-09-10T18:52:59.714Z',
        mtime: '2021-09-10T18:52:59.714Z',
        ctime: '2021-09-10T18:52:59.714Z',
        birthtime: '2021-09-10T18:52:59.714Z'
      }

      const mockOwner = 'owner'
      process.env.USER = mockOwner
      const filename = 'filename.png'

      jest.spyOn(fs.promises, fs.promises.stat.name)
        .mockResolvedValue(statMock)

      jest.spyOn(fs.promises, fs.promises.readdir.name)
        .mockResolvedValue([filename])
      
      const result = await FileHelper.getFilesStatus('/tmp')
      const expectedResult = [
        {
          size: "196 kB",
          lastModified: statMock.birthtime,
          owner: mockOwner,
          file: filename
        }
      ]

      expect(fs.promises.stat).toHaveBeenCalledWith(`/tmp/${filename}`)
      expect(result).toMatchObject(expectedResult)
    })
  })
})
