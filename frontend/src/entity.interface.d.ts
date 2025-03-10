export interface BaseEntity {
  id: number;
}
export interface ContactDetails extends BaseEntity {
  name: string;
  fatherName: string;
  nidInfo: string;
  phone: string;
  address: string;
}
