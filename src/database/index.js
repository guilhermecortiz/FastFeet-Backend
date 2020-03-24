import Sequelize from 'sequelize';
import mongoose from 'mongoose';

import User from '../app/models/User';
import File from '../app/models/File';
import Recipient from '../app/models/Recipient';
import Deliveryman from '../app/models/Deliveryman';
import Signature from '../app/models/Signature';
import Delivery from '../app/models/Delivery';

import databaseConfig from '../config/database';

const models = [User, File, Recipient, Deliveryman, Signature, Delivery];

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
    this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/FastFeet',
      { useNewUrlParser: true, useFindAndModify: true }
    );
  }
}

export default new Database();
