FROM openjdk:26-slim AS navicell-base

USER root
WORKDIR /var/navicell

RUN apt-get update -qq && apt-get install -yq --no-install-recommends curl maven apache2 libapache2-mod-php git chromium-driver \
    && curl -sL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean -y
    
COPY factory/lib /var/navicell/lib 
COPY site /var/navicell/site
COPY src /var/navicell/src
COPY .mvn /var/navicell/.mvn
COPY mvnw mvnw.cmd pom.xml /var/navicell

RUN mvn install:install-file \
   -Dfile=./lib/navicell.jar \
   -DgroupId=fr.curie \
   -DartifactId=BiNoM \
   -Dversion=2.5 \
   -Dpackaging=jar \
   -DgeneratePom=true

RUN mvn install:install-file \
   -Dfile=./lib/cd4.jar \
   -DgroupId=org.sbml.x2001.ns \
   -DartifactId=celldesigner \
   -Dversion=4 \
   -Dpackaging=jar \
   -DgeneratePom=true

RUN mvn install:install-file \
   -Dfile=./lib/binomlibext.jar \
   -DgroupId=org.apache \
   -DartifactId=xmlbeans \
   -Dversion=1 \
   -Dpackaging=jar \
   -DgeneratePom=true
   
RUN mvn install:install-file \
   -Dfile=./lib/xgmml.jar \
   -DgroupId=edu.rpi.cs \
   -DartifactId=xgmml \
   -Dversion=1 \
   -Dpackaging=jar \
   -DgeneratePom=true
   
RUN mvn install:install-file \
   -Dfile=./lib/cd2sbgnml-0.4.5.jar \
   -DgroupId=fr.curie \
   -DartifactId=cd2sbgnml \
   -Dversion=0.4.5 \
   -Dpackaging=jar \
   -DgeneratePom=true

RUN mvn install:install-file \
   -Dfile=./lib/sbfc-1.3.7.jar \
   -DgroupId=org.sbfc \
   -DartifactId=converter \
   -Dversion=1.3.7 \
   -Dpackaging=jar \
   -DgeneratePom=true
   
RUN mvn install:install-file \
   -Dfile=./lib/org.sbgn.jar \
   -DgroupId=org.sbgn \
   -DartifactId=org.sbgn \
   -Dversion=0.2 \
   -Dpackaging=jar \
   -DgeneratePom=true

#COPY src/main/resources /var/navicell/src/main/resources

RUN cd /var/navicell/src/main/resources \
   && npm install --legacy-peer-deps\
   && npm run build-bundle-js

RUN rm -r /var/www/html && ln -s /var/navicell/site/docroot/navicell /var/www/html
COPY docker/apache_config.sh .
RUN a2enmod php8.2 proxy proxy_http cgi
   
RUN /bin/sh ./apache_config.sh \
   && cat /etc/apache2/sites-available/navicell.conf 
   
RUN a2dissite 000-default \
   && a2ensite navicell \
   && service apache2 start
   



# COPY . /var/navicell

RUN rm -fr /var/navicell/site/docroot/navicell/maps/* \
 && rm -fr /var/navicell/maps_src

VOLUME /var/navicell/site/docroot/navicell/maps
VOLUME /var/navicell/site/docroot/navicell/data



# Exposing port 8080 for server access
EXPOSE 80

CMD service apache2 start && ./mvnw spring-boot:run

