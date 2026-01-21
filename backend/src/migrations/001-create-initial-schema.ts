import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateInitialSchema1640000000001 implements MigrationInterface {
  name = 'CreateInitialSchema1640000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'username',
            type: 'varchar',
            length: '255',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'avatar',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'moderator', 'user'],
            default: `'user'`,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'suspended', 'pending'],
            default: `'active'`,
          },
          {
            name: 'bio',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'website',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'email_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'last_login_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create posts table
    await queryRunner.createTable(
      new Table({
        name: 'posts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'excerpt',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isNullable: true,
            isUnique: true,
          },
          {
            name: 'featured_image',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['draft', 'published', 'archived', 'deleted'],
            default: `'draft'`,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['article', 'tutorial', 'news', 'blog'],
            default: `'article'`,
          },
          {
            name: 'views',
            type: 'int',
            default: 0,
          },
          {
            name: 'likes',
            type: 'int',
            default: 0,
          },
          {
            name: 'tags',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'published_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'seo_title',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'seo_description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'author_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create categories table
    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'slug',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'color',
            type: 'varchar',
            length: '7',
            isNullable: true,
          },
          {
            name: 'parent_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 0,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'archived'],
            default: `'active'`,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create comments table
    await queryRunner.createTable(
      new Table({
        name: 'comments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'content',
            type: 'text',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'approved', 'rejected', 'deleted'],
            default: `'pending'`,
          },
          {
            name: 'likes',
            type: 'int',
            default: 0,
          },
          {
            name: 'parent_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'author_id',
            type: 'uuid',
          },
          {
            name: 'post_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create media table
    await queryRunner.createTable(
      new Table({
        name: 'media',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'filename',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'original_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'size',
            type: 'bigint',
          },
          {
            name: 'path',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'url',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['image', 'video', 'document', 'audio'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['uploading', 'processing', 'completed', 'failed'],
            default: `'uploading'`,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'alt',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'caption',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'uploaded_by_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create junction table for post-categories relationship
    await queryRunner.createTable(
      new Table({
        name: 'post_categories',
        columns: [
          {
            name: 'post_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'category_id',
            type: 'uuid',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    // Create foreign key constraints
    await queryRunner.query(`
      ALTER TABLE posts 
      ADD CONSTRAINT FK_posts_author_id 
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE comments 
      ADD CONSTRAINT FK_comments_author_id 
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE comments 
      ADD CONSTRAINT FK_comments_post_id 
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE comments 
      ADD CONSTRAINT FK_comments_parent_id 
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE categories 
      ADD CONSTRAINT FK_categories_parent_id 
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE media 
      ADD CONSTRAINT FK_media_uploaded_by_id 
      FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE post_categories 
      ADD CONSTRAINT FK_post_categories_post_id 
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE post_categories 
      ADD CONSTRAINT FK_post_categories_category_id 
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    `);

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_USERS_EMAIL ON users(email)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_USERS_USERNAME ON users(username)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_USERS_STATUS ON users(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_USERS_ROLE ON users(role)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_POSTS_AUTHOR_ID ON posts(author_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_POSTS_STATUS ON posts(status)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_POSTS_TYPE ON posts(type)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_POSTS_SLUG ON posts(slug)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_POSTS_PUBLISHED_AT ON posts(published_at)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_POSTS_CREATED_AT ON posts(created_at)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_COMMENTS_POST_ID ON comments(post_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_COMMENTS_AUTHOR_ID ON comments(author_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_COMMENTS_PARENT_ID ON comments(parent_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_COMMENTS_STATUS ON comments(status)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_CATEGORIES_SLUG ON categories(slug)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_CATEGORIES_PARENT_ID ON categories(parent_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_CATEGORIES_STATUS ON categories(status)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_MEDIA_UPLOADED_BY_ID ON media(uploaded_by_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_MEDIA_TYPE ON media(type)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_MEDIA_STATUS ON media(status)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_POST_CATEGORIES_POST_ID ON post_categories(post_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_POST_CATEGORIES_CATEGORY_ID ON post_categories(category_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('post_categories');
    await queryRunner.dropTable('media');
    await queryRunner.dropTable('comments');
    await queryRunner.dropTable('categories');
    await queryRunner.dropTable('posts');
    await queryRunner.dropTable('users');
  }
}
