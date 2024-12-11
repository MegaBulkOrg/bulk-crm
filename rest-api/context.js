import UsersModel from './models/users-model.js';
import UsersService from './services/users-service.js';
import ClientsModel from './models/clients-model.js';
import ClientsService from './services/clients-service.js';
import DealsModel from './models/deals-model.js';
import DealsService from './services/deals-service.js';
import NotesModel from './models/notes-model.js';
import DirectoriesModel from './models/directories-model.js';
import AuthModel from './models/auth-model.js';
import AuthService from './services/auth-service.js';
import FilesService from './services/files-service.js';
import SearchModel from './models/search-model.js';

import SearchService from './services/search-service.js';

export default {
  models: { UsersModel, ClientsModel, DealsModel, NotesModel, DirectoriesModel, AuthModel, SearchModel },
  services: { UsersService, ClientsService, DealsService, AuthService, FilesService, SearchService }
}