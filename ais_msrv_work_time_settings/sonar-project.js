const sonarqubeScanner = require('sonarqube-scanner');

sonarqubeScanner(
  {
    serverUrl: 'http://10.11.10.10:9090',
    options: {
      'sonar.projectName':'template',//change name
      'sonar.login': 'admin',
      'sonar.password': 'adminadmin',
      'sonar.sources': 'src',
      'sonar.tests': 'src',
      'sonar.inclusions': 'src/**/*.ts', // Entry point of your code
      'sonar.test.inclusions':
        'src/**/*.spec.ts,src/**/*.spec.jsx,src/**/*.test.js,src/**/*.test.jsx',
    },
  },
  () => {
    console.log('Error Occurred while scanning');
  },
);