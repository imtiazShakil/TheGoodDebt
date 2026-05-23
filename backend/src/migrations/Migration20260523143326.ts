import { Migration } from '@mikro-orm/migrations';

export class Migration20260523143326 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table \`contact_details\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`version\` integer not null default 1, \`name\` text not null, \`father_name\` text not null, \`nid_info\` text not null, \`phone\` text not null, \`address\` text not null);`);
    this.addSql(`create unique index \`contact_details_name_unique\` on \`contact_details\` (\`name\`);`);
    this.addSql(`create unique index \`contact_details_nid_info_unique\` on \`contact_details\` (\`nid_info\`);`);
    this.addSql(`create unique index \`contact_details_phone_unique\` on \`contact_details\` (\`phone\`);`);

    this.addSql(`create table \`borrowing_contract\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`version\` integer not null default 1, \`contact_id\` integer not null, \`amount\` integer not null, \`duration_days\` integer not null, \`return_date\` datetime not null, \`finance_category_type\` text not null, \`purpose_of_loan\` text null, \`guarantor1_id\` integer null, \`guarantor2_id\` integer null, \`first_reminder\` datetime null, \`second_reminder\` datetime null, \`third_reminder\` datetime null, \`guarantors_reminder\` datetime null, \`contract_status\` text not null default 'Active', \`adjustment_with_transaction_id\` integer null, \`file_name\` text null, \`file_blob\` blob null, constraint \`borrowing_contract_contact_id_foreign\` foreign key (\`contact_id\`) references \`contact_details\` (\`id\`), constraint \`borrowing_contract_guarantor1_id_foreign\` foreign key (\`guarantor1_id\`) references \`contact_details\` (\`id\`) on delete set null, constraint \`borrowing_contract_guarantor2_id_foreign\` foreign key (\`guarantor2_id\`) references \`contact_details\` (\`id\`) on delete set null);`);
    this.addSql(`create index \`borrowing_contract_contact_id_index\` on \`borrowing_contract\` (\`contact_id\`);`);
    this.addSql(`create index \`borrowing_contract_guarantor1_id_index\` on \`borrowing_contract\` (\`guarantor1_id\`);`);
    this.addSql(`create index \`borrowing_contract_guarantor2_id_index\` on \`borrowing_contract\` (\`guarantor2_id\`);`);

    this.addSql(`create table \`lending_contract\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`version\` integer not null default 1, \`contact_id\` integer not null, \`amount\` integer not null, \`duration_days\` integer not null, \`return_date\` datetime not null, \`finance_category_type\` text not null, \`reason_for_lending\` text null, \`contract_status\` text not null default 'Active', \`file_name\` text null, \`file_blob\` blob null, constraint \`lending_contract_contact_id_foreign\` foreign key (\`contact_id\`) references \`contact_details\` (\`id\`));`);
    this.addSql(`create index \`lending_contract_contact_id_index\` on \`lending_contract\` (\`contact_id\`);`);

    this.addSql(`create table \`vault\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`version\` integer not null default 1, \`name\` text not null, \`description\` text null);`);
    this.addSql(`create unique index \`vault_name_unique\` on \`vault\` (\`name\`);`);

    this.addSql(`create table \`transaction\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`version\` integer not null default 1, \`description\` text not null, \`amount\` integer not null, \`transaction_type\` text not null, \`expense_type\` text null, \`vault_id\` integer not null, \`contact_id\` integer null, \`finance_category_type\` text not null, \`lending_contract_id\` integer null, \`borrowing_contract_id\` integer null, \`balance\` integer not null, constraint \`transaction_vault_id_foreign\` foreign key (\`vault_id\`) references \`vault\` (\`id\`), constraint \`transaction_contact_id_foreign\` foreign key (\`contact_id\`) references \`contact_details\` (\`id\`) on delete set null, constraint \`transaction_lending_contract_id_foreign\` foreign key (\`lending_contract_id\`) references \`lending_contract\` (\`id\`) on delete set null, constraint \`transaction_borrowing_contract_id_foreign\` foreign key (\`borrowing_contract_id\`) references \`borrowing_contract\` (\`id\`) on delete set null);`);
    this.addSql(`create index \`transaction_vault_id_index\` on \`transaction\` (\`vault_id\`);`);
    this.addSql(`create index \`transaction_contact_id_index\` on \`transaction\` (\`contact_id\`);`);
    this.addSql(`create index \`transaction_lending_contract_id_index\` on \`transaction\` (\`lending_contract_id\`);`);
    this.addSql(`create index \`transaction_borrowing_contract_id_index\` on \`transaction\` (\`borrowing_contract_id\`);`);

    this.addSql(`create table \`vault_balance_history\` (\`id\` integer not null primary key autoincrement, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`version\` integer not null default 1, \`vault_id\` integer not null, \`transaction_id\` integer null, \`qard_al_hasan_balance\` integer not null default 0, \`zakat_balance\` integer not null default 0, \`sadaqa_balance\` integer not null default 0, \`waqf_balance\` integer not null default 0, \`total_balance\` integer not null default 0, constraint \`vault_balance_history_vault_id_foreign\` foreign key (\`vault_id\`) references \`vault\` (\`id\`), constraint \`vault_balance_history_transaction_id_foreign\` foreign key (\`transaction_id\`) references \`transaction\` (\`id\`) on delete set null);`);
    this.addSql(`create index \`vault_balance_history_vault_id_index\` on \`vault_balance_history\` (\`vault_id\`);`);
    this.addSql(`create index \`vault_balance_history_transaction_id_index\` on \`vault_balance_history\` (\`transaction_id\`);`);
  }

}
