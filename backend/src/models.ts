import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

// Database connection configuration
const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL || 'sqlite:./db.sqlite';

// Initialize Sequelize
export const sequelize = new Sequelize(databaseUrl, {
  dialect: isProduction ? 'postgres' : 'sqlite',
  storage: isProduction ? undefined : './db.sqlite',
  logging: false,
  dialectOptions: isProduction ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

// User model interfaces
interface UserAttributes {
  id: number;
  email: string;
  password: string;
  notification_days: number;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'notification_days'> {}

// Subscription model interfaces
interface SubscriptionAttributes {
  id: number;
  user_id: number;
  name: string;
  billing_cycle: string;
  start_date: string;
  next_payment_date: string;
  amount: number;
  category: string;
  status: string;
}

interface SubscriptionCreationAttributes extends Optional<SubscriptionAttributes, 'id' | 'category' | 'status'> {}

// User Model
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string;
  public notification_days!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notification_days: {
      type: DataTypes.INTEGER,
      defaultValue: 7,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: false,
  }
);

// Subscription Model
export class Subscription extends Model<SubscriptionAttributes, SubscriptionCreationAttributes> implements SubscriptionAttributes {
  public id!: number;
  public user_id!: number;
  public name!: string;
  public billing_cycle!: string;
  public start_date!: string;
  public next_payment_date!: string;
  public amount!: number;
  public category!: string;
  public status!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Subscription.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    billing_cycle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    next_payment_date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'Other',
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    tableName: 'subscriptions',
    timestamps: false,
  }
);

// Define associations
User.hasMany(Subscription, { foreignKey: 'user_id' });
Subscription.belongsTo(User, { foreignKey: 'user_id' });

// Initialize database
export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: false });
    console.log('Database models synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};
