USE es_extended;

DROP TABLE IF EXISTS stock_history;
DROP TABLE IF EXISTS stock_shares;
DROP TABLE IF EXISTS stock_companies;

CREATE TABLE IF NOT EXISTS stock_companies(
	id int AUTO_INCREMENT,
	company_name VARCHAR(60) NOT NULL,
	company_label VARCHAR(4) NOT NULL,
	owner_id VARCHAR(100) NOT NULL,
	total_shares INT NOT NULL,
	UNIQUE (company_label),
	PRIMARY KEY (id)
);


CREATE TABLE IF NOT EXISTS stock_history(
	id int AUTO_INCREMENT,
	price DOUBLE NOT NULL,
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

INSERT INTO stock_companies (id, company_name, company_label, owner_id, total_shares)
VALUES (1, 'Los Santos National Index', 'LSNI', 'Index', 200000);
INSERT INTO stock_history (price, company_id, movement_date)
VALUES (20000, 1, '1980-01-01 00:00:00.1');
INSERT INTO stock_history (price, company_id, movement_date)
VALUES (22000, 1, '1990-01-01 00:00:00.1');
INSERT INTO stock_history (price, company_id, movement_date)
VALUES (18000, 1, '2000-01-01 00:00:00.1');
INSERT INTO stock_history (price, company_id, movement_date)
VALUES (23000, 1, '2010-01-01 00:00:00.1');
INSERT INTO stock_history (price, company_id, movement_date)
VALUES (28000, 1, '2020-01-01 00:00:00.1');

INSERT INTO stock_shares (owner_id, quantity, company_id)
VALUES ('steam:2019302', 1000, 1);
INSERT INTO stock_shares (owner_id, quantity, company_id)
VALUES ('steam:2024302', 3000, 1);

INSERT INTO stock_companies (id, company_name, company_label, owner_id, total_shares)
VALUES (2, 'Blaine National Quarry Company', 'BNQC', 'NPC', 20000);
INSERT INTO stock_history (price, company_id, movement_date)
VALUES (20000, 2, '1980-01-01 00:00:00.1');
INSERT INTO stock_history (price, company_id, movement_date)
VALUES (22000, 2, '1990-01-01 00:00:00.1');
INSERT INTO stock_history (price, company_id, movement_date)
VALUES (18000, 2, '2000-01-01 00:00:00.1');
INSERT INTO stock_history (price, company_id, movement_date)
VALUES (23000, 2, '2010-01-01 00:00:00.1');
INSERT INTO stock_history (price, company_id, movement_date)
VALUES (28000, 2, '2020-01-01 00:00:00.1');

INSERT INTO stock_shares (owner_id, quantity, company_id)
VALUES ('steam:2019302', 1000, 2);
INSERT INTO stock_shares (owner_id, quantity, company_id)
VALUES ('steam:2024302', 3000, 2);