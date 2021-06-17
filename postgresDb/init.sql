
CREATE TABLE USERS (	
    id          SERIAL PRIMARY KEY,
	name            TEXT, 
    surname         TEXT,
    username        TEXT,
    password        TEXT
);


INSERT INTO USERS (name, surname, username, password) VALUES ('Tom', 'Manson', 'tomi7lav', '1234');
INSERT INTO USERS (name, surname, username, password) VALUES ('Mark', 'Markson', 'mark7lav', '1234');
INSERT INTO USERS (name, surname, username, password) VALUES ('Jack', 'Jackson', 'jack7lav', '1234');
INSERT INTO USERS (name, surname, username, password) VALUES ('Dan', 'Danson', 'dan7lav', '1234');


CREATE TABLE POSTS (	
    postid          SERIAL PRIMARY KEY,
    authorid        INT REFERENCES users(id),
    timestamp       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    BODY            TEXT
);


CREATE TABLE FOLLOWERS (
    follower_id      INT REFERENCES users(id),
    following_id     INT REFERENCES users(id)
);

CREATE TABLE POST_LIKES (
    postid          INT REFERENCES posts(postid),
    userid          INT REFERENCES users(id)
);