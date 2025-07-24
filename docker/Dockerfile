FROM openjdk:26-slim AS navicell-base

USER root
WORKDIR /var/navicell

RUN apt-get update -qq && apt-get install -yq --no-install-recommends curl maven apache2 libapache2-mod-php chromium-driver \
    && curl -sL https://deb.nodesource.com/setup_12.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean -y
    
COPY factory/lib /var/navicell/lib 

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

COPY src/main/resources /var/navicell/src/main/resources

RUN cd /var/navicell/src/main/resources \
   && npm install \
   && npm run build-bundle-js

RUN rm -r /var/www/html && ln -s /var/navicell/site/docroot/navicell /var/www/html
COPY docker/apache_config.sh .
RUN a2enmod php7.3 proxy proxy_http cgi
   
RUN /bin/sh ./apache_config.sh \
   && cat /etc/apache2/sites-available/navicell.conf 
   
RUN a2dissite 000-default \
   && a2ensite navicell \
   && service apache2 start
   


# Exposing port 8080 for server access
EXPOSE 80




FROM navicell-base AS navicell

# COPY . /var/navicell
COPY site /var/navicell/site
COPY src /var/navicell/src
COPY .mvn /var/navicell/.mvn
COPY mvnw mvnw.cmd pom.xml /var/navicell

RUN rm -fr /var/navicell/site/docroot/navicell/maps/* \
 && rm -fr /var/navicell/maps_src

VOLUME /var/navicell/site/docroot/navicell/maps
VOLUME /var/navicell/site/docroot/navicell/data
CMD service apache2 start && ./mvnw spring-boot:run

FROM navicell-base AS navicell-dev

CMD bash -c "tail -f /dev/null"

## Now the production part, with WAR file compilation and tomcat server
## First, we produce a WAR file from this navicell-maven image
FROM openjdk:26-slim AS navicell-maven

USER root
WORKDIR /var/navicell

RUN apt-get update -qq && apt-get install -yq --no-install-recommends curl maven \
    && curl -sL https://deb.nodesource.com/setup_12.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean -y
    
COPY factory/lib /var/navicell/lib 

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

COPY src /var/navicell/src
    
RUN cd /var/navicell/src/main/resources \
   && npm install \
   && npm run build-bundle-js
COPY pom.xml mvnw mvnw.cmd /var/navicell
COPY .mvn /var/navicell/.mvn
RUN ./mvnw clean install

## Then we copy this WAR file inside a tomcat image

FROM tomcat:9.0.65-jdk11-openjdk-buster AS navicell-tomcat

USER root
WORKDIR /var/navicell

COPY --from=navicell-maven /var/navicell/target/navicell-0.0.1.war /usr/local/tomcat/webapps

RUN apt-get update -qq && apt-get install -yq --no-install-recommends apache2 libapache2-mod-php chromium-driver \
    && apt-get clean -y

RUN rm -r /var/www/html && ln -s /var/navicell/site/docroot/navicell /var/www/html
COPY docker/apache_config.sh .
RUN a2enmod php7.3 proxy proxy_http cgi
   
RUN /bin/sh ./apache_config.sh \
   && cat /etc/apache2/sites-available/navicell.conf 
   
RUN a2dissite 000-default \
   && a2ensite navicell \
   && service apache2 start
   


# Exposing port 8080 for server access
EXPOSE 80
EXPOSE 8080


## Finally, we build the prod image from the tomcat image
## This step is probably useless

FROM navicell-tomcat AS navicell-prod

#COPY site /var/navicell/site
#COPY src /var/navicell/src
#COPY .mvn /var/navicell/.mvn
#COPY mvnw mvnw.cmd xrefs.txt pom.xml /var/navicell

RUN rm -fr /var/navicell/site/docroot/navicell/maps/* \
 && rm -fr /var/navicell/maps_src

VOLUME /var/navicell/site/docroot/navicell/maps


RUN chown -R www-data:www-data /var/navicell/ && chown -R www-data:www-data /usr/local/tomcat/

#COPY docker/tomcat.service /etc/systemd/system/
CMD bash -c "tail -f /dev/null"
#CMD ["/lib/systemd/systemd"]
# CMD service apache2 start && service tomcat start && bash -c "tail -f /dev/null"
#/usr/local/tomcat9/bin/catalina.sh start 
#&& ./mvnw spring-boot:run
