import mongoose from 'mongoose';
import Sequelize from 'sequelize';

import { AppointmentModel, FileModel, UserModel } from '../app/models';
import { databaseConfig } from '../config';

const models = [UserModel, FileModel, AppointmentModel];

class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
}

export default new Database();
