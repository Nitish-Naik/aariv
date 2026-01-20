/**
 * Database migration system
 * Tracks and executes schema migrations
 */

import { supabase } from '../config/supabase';
import { logger } from './logger';

interface Migration {
  version: string;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

class MigrationRunner {
  private migrations: Map<string, Migration> = new Map();

  /**
   * Register a migration
   */
  register(migration: Migration) {
    this.migrations.set(migration.version, migration);
  }

  /**
   * Run pending migrations
   */
  async runPending() {
    try {
      logger.info('🔄 Checking for pending migrations...');

      // Get applied migrations from Supabase
      const { data: applied } = await supabase
        .from('schema_migrations')
        .select('version')
        .order('version', { ascending: true });

      const appliedVersions = new Set((applied || []).map(m => m.version));

      // Get pending migrations
      const pending = Array.from(this.migrations.entries())
        .filter(([version]) => !appliedVersions.has(version))
        .sort((a, b) => a[0].localeCompare(b[0]));

      if (pending.length === 0) {
        logger.info('✓ No pending migrations');
        return;
      }

      logger.info(`📝 Found ${pending.length} pending migrations`);

      // Run each migration
      for (const [version, migration] of pending) {
        try {
          logger.info(`🏃 Running migration: ${migration.name}`);
          await migration.up();

          // Record migration
          await supabase.from('schema_migrations').insert({
            version,
            name: migration.name,
            applied_at: new Date().toISOString(),
          });

          logger.info(`✓ Migration completed: ${migration.name}`);
        } catch (error) {
          logger.error(`✗ Migration failed: ${migration.name}`, error as Error);
          throw error; // Stop on first failure
        }
      }

      logger.info('✅ All migrations completed successfully');
    } catch (error) {
      logger.error('Migration runner failed', error as Error);
      // Don't throw - allow app to start even if migrations fail
    }
  }

  /**
   * Rollback last migration
   */
  async rollback() {
    try {
      const { data } = await supabase
        .from('schema_migrations')
        .select('version, name')
        .order('version', { ascending: false })
        .limit(1);

      if (!data || data.length === 0) {
        logger.warn('No migrations to rollback');
        return;
      }

      const [last] = data;
      const migration = this.migrations.get(last.version);

      if (!migration) {
        logger.error(`Migration not found: ${last.version}`);
        return;
      }

      logger.info(`🔙 Rolling back: ${migration.name}`);
      await migration.down();

      await supabase
        .from('schema_migrations')
        .delete()
        .eq('version', last.version);

      logger.info(`✓ Rollback completed: ${migration.name}`);
    } catch (error) {
      logger.error('Rollback failed', error as Error);
    }
  }
}

// Export singleton
export const migrationRunner = new MigrationRunner();

/**
 * Example migrations - add your own
 */
export const migrations = {
  // Migration template
  // register({
  //   version: '001',
  //   name: 'Create users table',
  //   up: async () => {
  //     await supabase.rpc('exec_sql', {
  //       sql: `CREATE TABLE IF NOT EXISTS users (
  //         id TEXT PRIMARY KEY,
  //         email TEXT UNIQUE,
  //         created_at TIMESTAMP DEFAULT NOW()
  //       )`
  //     });
  //   },
  //   down: async () => {
  //     await supabase.rpc('exec_sql', { sql: 'DROP TABLE users' });
  //   }
  // });
};
