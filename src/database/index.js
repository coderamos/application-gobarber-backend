import Sequelize from 'sequelize';

import { UserModel } from '../app/models';
import { databaseConfig } from '../config';

const models = [UserModel];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models.map(model => model.init(this.connection));
  }
}

export default new Database();
