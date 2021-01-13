
CREATE TABLE USERS (	
    id          SERIAL PRIMARY KEY,
	name        TEXT, 
    surname     TEXT,
    username    TEXT,
    password    TEXT
);


INSERT INTO USERS (name, surname, username, password) VALUES ('Tom', 'Manson', 'tomi7lav', '1234');
INSERT INTO USERS (name, surname, username, password) VALUES ('Mark', 'Markson', 'mark7lav', '1234');
INSERT INTO USERS (name, surname, username, password) VALUES ('Jack', 'Jackson', 'jack7lav', '1234');
INSERT INTO USERS (name, surname, username, password) VALUES ('Dan', 'Danson', 'dan7lav', '1234');

