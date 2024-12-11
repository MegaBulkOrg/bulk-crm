export default ({
    models: { SearchModel },
    services: { SearchService }
  }) => ({
    async getSearchResults (req, res) {  
      const service = SearchService({models:{SearchModel}})
      const result = await service.getSearchResults(req.query)
      res.json(result)
    }
  })