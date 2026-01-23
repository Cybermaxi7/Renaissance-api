import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (configService: ConfigService): DataSourceOptions => {
  // Extraemos la configuración base
  const dbConfig = configService.get<DataSourceOptions>('database');

  // Retornamos el objeto asegurando que las propiedades requeridas existan
  return {
    ...dbConfig,
    type: 'postgres', // Forzamos el tipo para satisfacer a TypeScript
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    logging: configService.get<string>('NODE_ENV') === 'development',
    synchronize: configService.get<string>('NODE_ENV') === 'development',
  } as DataSourceOptions;
};

// Exportación para CLI y DataSource manual
export const AppDataSource = (configService: ConfigService) => 
  new DataSource(getTypeOrmConfig(configService));