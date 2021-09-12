import { jest } from '@jest/globals'

import Routes from "../../src/routes"

describe('#Routes test suite', () => {
  const defaultParams = {
    request: {
      headers: {
        'Content-Type': 'multpart/form-data'
      },
      method: '',
      body: {}
    },
    response: {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn()
    },
    values: () => Object.values(defaultParams)
  }

  describe('#handler', () => {
    it('should choose default route given an inexistent route', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }

      params.request.method = 'inexistent'
      await routes.handler(...params.values())

      expect(params.response.end).toHaveBeenCalledWith('hello world')
    })

    it('should set any request with CORS enabled', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }

      params.request.method = 'inexistent'
      await routes.handler(...params.values())

      expect(params.response.setHeader)
        .toHaveBeenCalledWith('Access-Control-Allow-Origin', '*')
    })

    it('should choose options route given method OPTIONS', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }

      params.request.method = 'OPTIONS'
      await routes.handler(...params.values())

      expect(params.response.writeHead).toHaveBeenCalledWith(204)
      expect(params.response.end).toHaveBeenCalled()
    })

    it('should choose post route given method POST', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }

      jest.spyOn(routes, routes.post.name).mockResolvedValue()

      params.request.method = 'POST'
      await routes.handler(...params.values())

      expect(routes.post).toHaveBeenCalled()
    })

    it('should choose get route given method GET', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }

      jest.spyOn(routes, routes.get.name).mockResolvedValue()

      params.request.method = 'GET'
      await routes.handler(...params.values())

      expect(routes.get).toHaveBeenCalled()
    })
  })

  describe('#get', () => {
    it('should list all files downloaded given method GET', async () => {
      const routes = new Routes()
      const params = {
        ...defaultParams
      }

      const fileStatusesMock = [
        {
          size: '196 kB',
          lastModified: '2021-09-10T18:52:59.714Z',
          owner: 'owner',
          file: 'filename.png'
        }
      ]     

      jest.spyOn(routes.fileHelper, routes.fileHelper.getFilesStatus.name)
        .mockResolvedValue(fileStatusesMock)

      params.request.method = 'GET'
      await routes.handler(...params.values())
      
      expect(params.response.writeHead).toHaveBeenCalledWith(200)
      expect(params.response.end).toHaveBeenCalledWith(JSON.stringify(fileStatusesMock))   
    })  
  })
})