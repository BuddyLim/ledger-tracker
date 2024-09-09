CREATE TABLE account (
  id uuid NOT NULL PRIMARY KEY,
  name varchar NOT NULL,
  currency varchar NOT NULL,
  description varchar,
  creation_date timestamp with time zone NOT NULL,
  user_id uuid NOT NULL
);


CREATE TABLE category (
  id uuid NOT NULL PRIMARY KEY,
  category_name varchar NOT NULL,
  user_id uuid NOT NULL,
  type_id uuid NOT NULL
);


CREATE TABLE ledger_user (
  id uuid NOT NULL PRIMARY KEY,
  name varchar NOT NULL,
  hash_password varchar NOT NULL,
  email varchar NOT NULL
);


CREATE TABLE sub_category (
  id uuid NOT NULL PRIMARY KEY,
  category_id uuid NOT NULL,
  sub_category_name varchar NOT NULL,
  user_id uuid NOT NULL,
  type_id uuid NOT NULL
);


CREATE TABLE transactions (
  id uuid NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL,
  amount decimal NOT NULL,
  account_id uuid NOT NULL,
  sub_category_id uuid NOT NULL,
  sub_category_name varchar NOT NULL,
  category_id uuid NOT NULL,
  category_name varchar NOT NULL,
  description varchar,
  date timestamp with time zone NOT NULL,
  image varchar,
  type_id uuid
);


CREATE TABLE type (
  id uuid NOT NULL PRIMARY KEY,
  type varchar NOT NULL
);


ALTER TABLE account ADD CONSTRAINT account_user_id_fk FOREIGN KEY (user_id) REFERENCES ledger_user (id);
ALTER TABLE category ADD CONSTRAINT category_type_id_fk FOREIGN KEY (type_id) REFERENCES type (id);
ALTER TABLE category ADD CONSTRAINT category_user_id_fk FOREIGN KEY (user_id) REFERENCES ledger_user (id);
ALTER TABLE sub_category ADD CONSTRAINT sub_category_category_id_fk FOREIGN KEY (category_id) REFERENCES category (id);
ALTER TABLE sub_category ADD CONSTRAINT sub_category_type_id_fk FOREIGN KEY (type_id) REFERENCES type (id);
ALTER TABLE sub_category ADD CONSTRAINT sub_category_user_id_fk FOREIGN KEY (user_id) REFERENCES ledger_user (id);
ALTER TABLE transactions ADD CONSTRAINT transactions_account_id_fk FOREIGN KEY (account_id) REFERENCES account (id);
ALTER TABLE transactions ADD CONSTRAINT transactions_category_id_fk FOREIGN KEY (category_id) REFERENCES category (id);
ALTER TABLE transactions ADD CONSTRAINT transactions_sub_category_id_fk FOREIGN KEY (sub_category_id) REFERENCES sub_category (id);
ALTER TABLE transactions ADD CONSTRAINT transactions_user_id_fk FOREIGN KEY (user_id) REFERENCES ledger_user (id);
ALTER TABLE transactions ADD CONSTRAINT type_id_fk FOREIGN KEY (type_id) REFERENCES type (id);