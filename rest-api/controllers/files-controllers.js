export default ({
    services: { FilesService }
  }) => ({
    uploadSinglePhoto (req, res) {  
      const service = FilesService()
      service.uploadSinglePhoto(req, res)
    },
    getImg (req, res) {  
      const service = FilesService()
      service.getImg(req.params.folder, req.params.filename, res)
    }
  })