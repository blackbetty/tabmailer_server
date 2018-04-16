# LinkMeLater

## Introduction

The primary web application for the linkmelater.win application. You can run this repo locally in Node 8. Deployments are handled using a Docker container.


## Application Features

All LinkMeLater parts will have 3 main components:

1. A VueJS application
2. A browser bundle to render the Vue application
3. A NodeJS-based app server that will handle routing, and responses to requests. 

Additional features include: (wip)

- Bootstrap 4 for basic templating
- Winston server logging

## Getting Started

In order to get the front end up and running, please follow these steps:

1. Clone the directory, and `cd` to the `server` directory.
2. Run a `npm install` to install all needed dependencies for runtime.
3. Once your packages are installed, run `npm run startdev` in your console to get the server up and running

### Important things for development

- This repo **does not** include environment variables. If you want to get them in order to run our Postgres instance, you will need to speak to Dan Golant.
- We do not use HTTP for any requests in developmnent or in production. In order to access the front end, once the server is running make sure you navigate to `https://localhost:9145` or `https://localhost:[env_var_port]`
- If there is anything related to platform development, please speak to Dan and we can talk about getting it added!


## Contributing

If you would like to contribute to the project, feel free to open a pull request against the master, and I'll review it when I get the chance!

Thanks for stopping by, I hope you enjoy LinkMeLater!