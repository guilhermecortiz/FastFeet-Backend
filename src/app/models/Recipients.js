import Sequelize, { Model } from 'sequelize';

class Recipients extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      }
    );

    return this;
  }
}

export default Recipients;
