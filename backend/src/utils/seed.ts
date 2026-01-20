/**
 * Development seed data
 * Populates database with sample data for testing
 */

import { supabase } from '../config/supabase';
import { logger } from './logger';

export async function seedDatabase() {
  if (process.env.NODE_ENV !== 'development') {
    logger.warn('Seed data only runs in development');
    return;
  }

  try {
    logger.info('🌱 Seeding database...');

    // Check if already seeded
    const { count } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    if ((count || 0) > 0) {
      logger.info('✓ Database already seeded');
      return;
    }

    // Seed users
    const seedUsers = [
      {
        id: 'user-demo-1',
        email: 'demo@aariv.app',
        name: 'Demo User',
        subscription_tier: 'pro',
      },
      {
        id: 'user-test-1',
        email: 'test@aariv.app',
        name: 'Test User',
        subscription_tier: 'free',
      },
    ];

    for (const user of seedUsers) {
      await supabase.from('users').insert(user);
      logger.info(`Created user: ${user.email}`);
    }

    // Seed integrations
    const seedConnections = [
      {
        user_id: 'user-demo-1',
        app_name: 'gmail',
        status: 'active',
      },
      {
        user_id: 'user-demo-1',
        app_name: 'google-calendar',
        status: 'active',
      },
    ];

    for (const conn of seedConnections) {
      await supabase.from('connections').insert(conn);
      logger.info(`Connected ${conn.app_name}`);
    }

    logger.info('✅ Database seeded successfully');
  } catch (error) {
    logger.warn('Seed failed (OK if tables don\'t exist):', error as Error);
  }
}

export async function clearDatabase() {
  if (process.env.NODE_ENV !== 'development') {
    logger.error('Can only clear database in development');
    return;
  }

  try {
    logger.info('🗑️  Clearing database...');

    // Delete in reverse order of dependencies
    await supabase.from('schema_migrations').delete();
    await supabase.from('connections').delete();
    await supabase.from('users').delete();

    logger.info('✅ Database cleared');
  } catch (error) {
    logger.error('Clear database failed', error as Error);
  }
}
