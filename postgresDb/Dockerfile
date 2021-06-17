FROM library/postgres

ENV POSTGRES_USER docker
ENV POSTGRES_PASSWORD secret
ENV POSTGRES_DB riftterdb

COPY init.sql /docker-entrypoint-initdb.d/
