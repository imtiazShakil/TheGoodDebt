import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity()
export class ContactDetails {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  @Index({ unique: true })
  name!: string;

  @Column()
  fatherName!: string;

  @Column()
  @Index({ unique: true })
  nidInfo!: string;

  @Column()
  @Index({ unique: true })
  phone!: string;

  @Column()
  address!: string;
}
