DROP DATABASE IF EXISTS store;
CREATE DATABASE IF NOT EXISTS store;
USE store;

CREATE TABLE IF NOT EXISTS categories(
	id int AUTO_INCREMENT NOT NULL,
	name varchar(30) NOT NULL,
	description varchar(800) NOT NULL,

	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS products(
	id int AUTO_INCREMENT NOT NULL,
	name varchar(30) NOT NULL,
	description varchar(800) NOT NULL,
	price double NOT NULL,
	miniature_route varchar(100),
	id_category int NOT NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (id_category) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS users(
	id int AUTO_INCREMENT NOT NULL,
	identifier varchar(20) NOT NULL,
	name varchar(20) NOT NULL,
	email varchar(40) NOT NULL,
	pass varchar(60) NOT NULL,
	permision_group varchar(10) NOT NULL,

	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS sales(
	id int AUTO_INCREMENT NOT NULL,
	percentage double NOT NULL,
	until timestamp NOT NULL,
	
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS sales_products(
	id int AUTO_INCREMENT NOT NULL,
	id_product int NOT NULL,
	id_sale int NOT NULL,
	
	PRIMARY KEY (id),
	FOREIGN KEY (id_product) REFERENCES products(id),
	FOREIGN KEY (id_sale) REFERENCES sales(id)
);

CREATE TABLE IF NOT EXISTS shopping_cart(
	id int AUTO_INCREMENT NOT NULL,
	cuantity int NOT NULL,
	id_user int NOT NULL,
	id_product int NOT NULL,
	
	PRIMARY KEY (id),
	FOREIGN KEY (id_product) REFERENCES products(id),
	FOREIGN KEY (id_user) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS images(
	id int AUTO_INCREMENT NOT NULL,
	image_route varchar(100) NOT NULL,
	
	PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS images_products(
	id int AUTO_INCREMENT NOT NULL,
	id_image int NOT NULL,
	id_product int NOT NULL,
	
	PRIMARY KEY (id),
	FOREIGN KEY (id_image) REFERENCES images(id),
	FOREIGN KEY (id_product) REFERENCES products(id)
);



