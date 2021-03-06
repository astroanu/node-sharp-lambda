FROM amazonlinux
WORKDIR /deploy
RUN yum -y install make gcc*
RUN curl --silent --location https://rpm.nodesource.com/setup_10.x | bash -
RUN yum -y install nodejs
RUN npm install -g serverless
COPY . .
RUN npm install

RUN ["chmod", "+x", "deploy.sh"]
CMD ./deploy.sh ; sleep 2m
