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
  plan: string;
  subscription_status: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  financial_account_id: string | null;
  financial_session_id: string | null;
  financial_sync_month: string | null;
  financial_sync_count: number;
  financial_last_sync_at: string | null;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    | 'id'
    | 'notification_days'
    | 'plan'
    | 'subscription_status'
    | 'stripe_customer_id'
    | 'stripe_subscription_id'
    | 'financial_account_id'
    | 'financial_session_id'
    | 'financial_sync_month'
    | 'financial_sync_count'
    | 'financial_last_sync_at'
  > {}

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
  public plan!: string;
  public subscription_status!: string;
  public stripe_customer_id!: string | null;
  public stripe_subscription_id!: string | null;
  public financial_account_id!: string | null;
  public financial_session_id!: string | null;
  public financial_sync_month!: string | null;
  public financial_sync_count!: number;
  public financial_last_sync_at!: string | null;

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
    plan: {
      type: DataTypes.STRING,
      defaultValue: 'free',
    },
    subscription_status: {
      type: DataTypes.STRING,
      defaultValue: 'none',
    },
    stripe_customer_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripe_subscription_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    financial_account_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    financial_session_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    financial_sync_month: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    financial_sync_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    financial_last_sync_at: {
      type: DataTypes.STRING,
      allowNull: true,
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

// Financial Transactions model
interface FinancialTransactionAttributes {
  id: number;
  user_id: number;
  account_id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  transacted_at: string;
  linked_subscription_id: number | null;
}

interface FinancialTransactionCreationAttributes
  extends Optional<FinancialTransactionAttributes, 'id' | 'linked_subscription_id'> {}

export class FinancialTransaction
  extends Model<FinancialTransactionAttributes, FinancialTransactionCreationAttributes>
  implements FinancialTransactionAttributes
{
  public id!: number;
  public user_id!: number;
  public account_id!: string;
  public transaction_id!: string;
  public amount!: number;
  public currency!: string;
  public description!: string;
  public status!: string;
  public transacted_at!: string;
  public linked_subscription_id!: number | null;
}

FinancialTransaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    account_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transacted_at: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    linked_subscription_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'financial_transactions',
    timestamps: false,
  }
);

// Define associations
User.hasMany(Subscription, { foreignKey: 'user_id' });
Subscription.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(FinancialTransaction, { foreignKey: 'user_id' });
FinancialTransaction.belongsTo(User, { foreignKey: 'user_id' });

// Initialize database
export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    await ensureColumns();
    console.log('Database models synchronized.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

const ensureColumns = async () => {
  const qi = sequelize.getQueryInterface();
  const ensure = async (table: string, column: string, definition: any) => {
    const desc = await qi.describeTable(table);
    if (!desc[column]) {
      await qi.addColumn(table, column, definition);
    }
  };

  await ensure('users', 'plan', { type: DataTypes.STRING, defaultValue: 'free' });
  await ensure('users', 'subscription_status', { type: DataTypes.STRING, defaultValue: 'none' });
  await ensure('users', 'stripe_customer_id', { type: DataTypes.STRING, allowNull: true });
  await ensure('users', 'stripe_subscription_id', { type: DataTypes.STRING, allowNull: true });
  await ensure('users', 'financial_account_id', { type: DataTypes.STRING, allowNull: true });
  await ensure('users', 'financial_session_id', { type: DataTypes.STRING, allowNull: true });
  await ensure('users', 'financial_sync_month', { type: DataTypes.STRING, allowNull: true });
  await ensure('users', 'financial_sync_count', { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 });
  await ensure('users', 'financial_last_sync_at', { type: DataTypes.STRING, allowNull: true });

  await ensure('financial_transactions', 'linked_subscription_id', { type: DataTypes.INTEGER, allowNull: true });
};
