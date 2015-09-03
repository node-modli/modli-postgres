FROM postgres

MAINTAINER TechnologyAdvice

ENV DB_NAME modli
ENV DB_USER modli
ENV DB_PASS modli

EXPOSE 5432

ADD setup-database.sh /docker-entrypoint-initdb.d/
RUN chmod 755 /docker-entrypoint-initdb.d/setup-database.sh
