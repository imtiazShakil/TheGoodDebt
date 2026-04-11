# The Good Debt

Built your Society with Halal Finance. The idea of this application is to provide a platform for people to lend and borrow money without interest. The application will also provide a platform for people to donate money to charity.

## Models

#### FinanceCategory

This is the main model of transaction in the application. It will be used to categorize the transactions. The categories are Kard E Hasana, Zakat, Sadaka and Waqf.

No Table is needed for this model as the categories are fixed and will not change. We can use an Enum to represent the categories.

Enum: finance_category_type
Values:

- Qard al-Hasan
- Zakat
- Sadaqa
- Waqf

#### Transaction

This model will be used to record the transactions. Any cash going in or out of the vault will be recorded as a transaction. The transaction will have a description, amount, type, and category. The transaction type will be used to determine if the transaction is a lending, borrowing, or an expense. The finance_category_type will be used to determine which category the transaction belongs to. We will also record the contact and the contract (if any) associated with the transaction to provide better insights and reporting. The balance represents the final balance which must match with total_balance of the vaults after the transaction is recorded. This will help us to ensure that the transactions are recorded correctly and the balance is updated accordingly.

Table: Transaction
Columns:

- Id
- created_at
- updated_at
- description
- amount
- transaction_type
- expense_type
- vault_id
- contact_id
- finance_category_type
- borrowing_contract_id
- lending_contract_id
- balance

expense_type values:

- Bank Charge
- Conveyance
- Phone Expenses
- Entertainment
- Miscellaneous
- Legal Expenses

transaction_type values:

- Lend
- Borrow
- Expense
- LendRepay
- BorrowRepay

#### Vault

The vault is where the physical money is stored. Vault can be a person or an entity. The vault will have a balance which will be updated based on the transactions. The total Balance must be sum of Kard E Hasana balance, Zakat Balance, Sadaka Balance and Waqf Balance. We record the balance of each category on a specific date separately to provide better insights and reporting.

Table: Vault
Columns:

- Id
- created_at
- updated_at
- name
- description

Table: VaultBalanceHistory
Columns:

- Id
- created_at
- updated_at
- vault_id
- transaction_id
- qard_al_hasan_balance
- zakat_balance
- sadaqa_balance
- waqf_balance
- total_balance

#### Contact

Human or Entity with whom we have financial transactions. We will record the contact details to provide better insights and reporting. We will also record if the contact is blacklisted or not.

Table: Contact  
Columns:

- Id
- name
- father_name
- nid
- phone
- email
- address
- is_blacklisted
- blacklist_reason
- created_at
- updated_at

#### Lending Contract

This is a financial contract between the lender and the manager of the application. The contract will have the details of the lending amount, the return date and the category of the loan.

Table: Lending_Contract
Columns:

- Id
- created_at
- updated_at
- contact_id
- amount
- duration_days
- return_date
- finance_category_type
- reason_for_lending
- contract_status

Values for contract_status:

- Active
- Completed
- Defaulted

#### Borrowing Contract

This loan agreement outlines the terms between the Borrower and the Application Manager. It specifies the loan amount, category, and maturity date. Additionally, the contract details Guarantor obligations, Default/Recall procedures, and documented Transaction Adjustments.

Table: Borrowing_Contract
Columns:

- Id
- created_at
- updated_at
- contact_id
- amount
- duration_days
- return_date
- finance_category_type
- purpose_of_loan
- guarantor_id1
- guarantor_id2
- loan_recall_status
- contract_status
- adjustment_with_transaction_id

Values for contract_status:

- Active
- Completed
- Defaulted

Values for loan_recall_status:

- 1st Reminder
- 2nd Reminder
- 3rd Reminder
- Guarators reminder
