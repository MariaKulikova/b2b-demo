export default {
  import: [
    'features/step-definitions/**/*.js',
    'features/support/**/*.js'
  ],
  format: [
    'progress-bar',
    'html:reports/cucumber-report.html',
    'json:reports/cucumber-report.json'
  ],
  formatOptions: {
    snippetInterface: 'async-await'
  },
  publishQuiet: true,
  dryRun: false,
  failFast: false,
  snippets: true,
  source: false,
  strict: true,
  tagExpression: '',
  timeout: 30000,
  language: 'ru'
};