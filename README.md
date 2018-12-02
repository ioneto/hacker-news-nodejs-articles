# hacker-news-nodejs-articles

### Running instructions:
- The database password must be edited in the 'src/config/db.config.js' file (\<db-password\> tag)
- The appliction will insert new articles only if they are not registered already as documents in the database (searching by the objectID property)
- If the database is empty, it will be populated automatically when the application starts and an interval function will be updating the data once an hour
- To run the application, install the dependencies with 'npm install' and then execute application with 'node bin/www' from the root directory
- To view the application, open http://localhost:3000 in the browser

