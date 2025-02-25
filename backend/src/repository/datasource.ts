import "reflect-metadata";
import { DataSource } from "typeorm";
import { ContactDetails } from "./entity/contact-details";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "tgd.sqlite",
  entities: [ContactDetails],
  synchronize: true,
  logging: true,
});
