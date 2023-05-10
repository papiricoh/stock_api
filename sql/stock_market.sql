USE es_extended;

DROP TABLE IF EXISTS stock_history;
DROP TABLE IF EXISTS stock_shares;
DROP TABLE IF EXISTS stock_wallet;
DROP TABLE IF EXISTS stock_companies;
DROP TABLE IF EXISTS stock_groups;

CREATE TABLE IF NOT EXISTS stock_groups(
	id int AUTO_INCREMENT,
	group_name VARCHAR(60) NOT NULL,
	group_label VARCHAR(60) NOT NULL,
	owner_id VARCHAR(100) NOT NULL,
	money INT DEFAULT 0,
	UNIQUE (group_label),
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS stock_companies(
	id int AUTO_INCREMENT,
	company_name VARCHAR(60) NOT NULL,
	company_label VARCHAR(4) NOT NULL,
	owner_id VARCHAR(100) NOT NULL,
	money INT DEFAULT 0,
	total_shares INT NOT NULL,
	UNIQUE (company_label),
	PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS stock_history(
	id int AUTO_INCREMENT,
	price DOUBLE NOT NULL,
	volume DOUBLE NOT NULL,
	company_id INT NOT NULL,
	movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (id),
	FOREIGN KEY (company_id) REFERENCES stock_companies(id)
);

CREATE TABLE IF NOT EXISTS stock_shares(
	id INT AUTO_INCREMENT,
	owner_id VARCHAR(100) NOT NULL,
	quantity INT NOT NULL,
	company_id INT NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (company_id) REFERENCES stock_companies(id)
);

CREATE TABLE IF NOT EXISTS stock_wallet(
	id INT AUTO_INCREMENT,
	owner_id VARCHAR(100) NOT NULL,
	money INT DEFAULT '0',
	total_deposit INT DEFAULT '0',
	PRIMARY KEY (id),
	UNIQUE (owner_id)
);

INSERT INTO stock_companies (id, company_name, company_label, owner_id, total_shares)
VALUES (1, 'Los Santos National Index', 'LSNI', 'Index', 200000);
INSERT INTO stock_history (price, volume, company_id, movement_date)
VALUES (2000, 2358023.23, 1, '1980-01-01 00:00:00.1');
INSERT INTO stock_history (price, volume, company_id, movement_date)
VALUES (15000, 2358023.23, 1, '1990-01-01 00:00:00.1');
INSERT INTO stock_history (price, volume, company_id, movement_date)
VALUES (12000, 2358023.23, 1, '2000-01-01 00:00:00.1');
INSERT INTO stock_history (price, volume, company_id, movement_date)
VALUES (17000, 2358023.23, 1, '2010-01-01 00:00:00.1');
INSERT INTO stock_history (price, volume, company_id, movement_date)
VALUES (20000, 2358023.23, 1, '2020-01-01 00:00:00.1');

INSERT INTO stock_shares (owner_id, quantity, company_id)
VALUES ('steam:2019302', 1000, 1);
INSERT INTO stock_shares (owner_id, quantity, company_id)
VALUES ('steam:2024302', 3000, 1);

INSERT INTO stock_groups (id, group_name, group_label, owner_id)
VALUES (1, 'Blaine National Services Group', 'BNS', 'NPC');
INSERT INTO stock_companies (id, company_name, company_label, owner_id, total_shares)
VALUES (2, 'Blaine National Quarry Company', 'BNQC', 'group:1', 20000);
INSERT INTO stock_history (price, volume, company_id, movement_date)
VALUES (62000, 2358023.23, 2, '1980-01-01 00:00:00.1');
INSERT INTO stock_history (price, volume, company_id, movement_date)
VALUES (63000, 2358023.23, 2, '1990-01-01 00:00:00.1');
INSERT INTO stock_history (price, volume, company_id, movement_date)
VALUES (23000, 2358023.23, 2, '2000-01-01 00:00:00.1');
INSERT INTO stock_history (price, volume, company_id, movement_date)
VALUES (12000, 2358023.23, 2, '2010-01-01 00:00:00.1');
INSERT INTO stock_history (price, volume, company_id, movement_date)
VALUES (5000, 2358023.23, 2, '2020-01-01 00:00:00.1');

INSERT INTO stock_shares (owner_id, quantity, company_id)
VALUES ('group:1', 15000, 2);
INSERT INTO stock_shares (owner_id, quantity, company_id)
VALUES ('steam:2019302', 1000, 2);
INSERT INTO stock_shares (owner_id, quantity, company_id)
VALUES ('steam:2024302', 3000, 2);
INSERT INTO stock_wallet (owner_id, money)
VALUES ('steam:2024302', 3200000);
INSERT INTO stock_wallet (owner_id, money)
VALUES ('steam:202430', 320000);

INSERT INTO stock_companies (id, company_name, company_label, owner_id, total_shares)
VALUES (3, 'Test', 'TEST', 'steam:2019302', 200000);
INSERT INTO stock_history (price, company_id, volume, movement_date)
VALUES (20000, 3, 2000.32, '1980-01-01 00:00:00.1');
INSERT INTO stock_history (price, company_id, volume, movement_date)
VALUES (24000, 3, 2000.32, '1984-01-01 00:00:00.1');