### What is this repository for? ###

A static site generator. Gulp, Twig, Stylus, JSON, Front Matter. Testing and deployment agnostic.

### How do I get set up? ###

* Install Node and npm
* Clone Repository
* cd src & npm install
* gulp build

### Testing and Deployment Workflow ###

Testing and deployment is agnostic but this has been used with Browsersync.io (visual testing)
and Surge.sh (deployment/hosting). The generator will build files to a /deploy directory which
can be used to serve the site locally and as a repository for file deployment.

### Content ###

Content can be stored per page in the /data directory or inside the template using front matter.
See the repository for examples.
