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