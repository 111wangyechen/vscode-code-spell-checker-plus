
/**
 * 技术术语词库生成工具
 * 用于构建初始的领域分类技术术语词库
 */

import { existsSync,mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

// 定义领域类型
const DOMAINS = ['frontend', 'backend', 'ai'];

// 创建输出目录
const OUTPUT_DIR = join(process.cwd(), 'tech-terms');
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// 前端技术术语（约2000个）
const FRONTEND_TERMS = [
  // React生态
  'React', 'ReactDOM', 'JSX', 'Component', 'Props', 'State', 'Hooks', 'useState', 'useEffect', 'useContext',
  'useReducer', 'useCallback', 'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect', 'useDebugValue',
  'ReactRouter', 'ReactRedux', 'Redux', 'ReduxToolkit', 'RTKQuery', 'ReactQuery', 'ApolloClient', 'GraphQL',
  'ReactNative', 'NextJS', 'Gatsby', 'Remix', 'Vite', 'Webpack', 'Babel', 'ESLint', 'Prettier', 'Jest',
  'TestingLibrary', 'Cypress', 'Storybook', 'StyledComponents', 'Emotion', 'MaterialUI', 'AntDesign', 'ChakraUI',
  'TailwindCSS', 'Bootstrap', 'Sass', 'Less', 'PostCSS', 'Autoprefixer', 'CSSModules', 'CSSinJS', 'StyledSystem',
  'ThemeUI', 'ReactHooks', 'CustomHooks', 'HigherOrderComponents', 'RenderProps', 'ContextAPI', 'ErrorBoundary',
  'Suspense', 'ConcurrentMode', 'ServerComponents', 'ClientComponents', 'StaticSiteGeneration', 'IncrementalStaticRegeneration',
  'ServerSideRendering', 'ClientSideRendering', 'Hydration', 'CodeSplitting', 'LazyLoading', 'TreeShaking',
  // 新增前端框架和工具
  'Svelte', 'SvelteKit', 'SolidJS', 'Qwik', 'Astro', 'Nuxt', 'VueRouter', 'Vuex', 'Pinia', 'VueUse',
  'Preact', 'Inferno', 'Alpine', 'Lit', 'LitElement', 'Polymer', 'WebComponents', 'CustomElements',
  'ShadowDOM', 'HTMLTemplates', 'Stimulus', 'Hotwire', 'Turbo', 'StimulusReflex', 'htmx', 'Unpoly',
  // UI库和组件
  'Radix', 'RadixUI', 'HeadlessUI', 'Mantine', 'NextUI', 'DaisyUI', 'PrimeReact', 'PrimeVue', 'Vuetify',
  'Quasar', 'ElementUI', 'ElementPlus', 'ArcoDesign', 'SemiDesign', 'Tdesign', 'Vant', 'NutUI',
  'MUI', 'MaterialDesign', 'Shadcn', 'ShadcnUI', 'Flowbite', 'CoreUI', 'Blueprint', 'Evergreen',
  'Grommet', 'Rebass', 'BasWeb', 'Semantic', 'SemanticUI', 'Bulma', 'Foundation', 'Spectre',
  // 状态管理
  'Zustand', 'Jotai', 'Valtio', 'Recoil', 'XState', 'MobXStateTree', 'MST', 'Effector', 'Akita',
  'NgRx', 'NGXS', 'Elf', 'Signals', 'SignalStore', 'TanStackQuery', 'SWR', 'RTK Query',
  'BundleAnalyzer', 'WebVitals', 'CoreWebVitals', 'PerformanceMonitoring', 'FCP', 'LCP', 'FID', 'CLS', 'TTFB',
  'Accessibility', 'A11Y', 'ARIA', 'SemanticHTML', 'ResponsiveDesign', 'MobileFirst', 'Breakpoints', 'GridLayout',
  'Flexbox', 'CSSGrid', 'Viewport', 'MetaTags', 'SEO', 'OpenGraph', 'TwitterCards', 'SchemaMarkup', 'JSONLD',
  // 构建工具和打包器
  'Turbopack', 'esbuild', 'Parcel', 'Snowpack', 'WMR', 'Rspack', 'Farm', 'Rolldown', 'Bun',
  'pnpm', 'Yarn', 'npm', 'Volta', 'nvm', 'fnm', 'asdf', 'PackageManager', 'Workspaces',
  'Monorepo', 'Lerna', 'Nx', 'Turborepo', 'Rush', 'Changesets', 'Versioning', 'Publishing',
  // 测试框架
  'Vitest', 'Playwright', 'Puppeteer', 'Selenium', 'WebdriverIO', 'Nightwatch', 'TestCafe',
  'Mocha', 'Jasmine', 'Karma', 'Ava', 'Tap', 'uvu', 'c8', 'nyc', 'Istanbul', 'CodeCoverage',
  'Enzyme', 'ReactTestingLibrary', 'VueTestUtils', 'TestingPlayground', 'MSW', 'Nock',
  // CSS工具和预处理器
  'Stylus', 'PostCSS', 'cssnano', 'PurgeCSS', 'UnoCSS', 'WindiCSS', 'Stylis', 'CSSinJS',
  'vanilla-extract', 'Linaria', 'Compiled', 'Stitches', 'Goober', 'Fela', 'JSS', 'Aphrodite',
  // 编辑器和 IDE
  'VSCode', 'WebStorm', 'IntelliJ', 'Atom', 'SublimeText', 'Vim', 'NeoVim', 'Emacs',
  'Zed', 'Cursor', 'CodeSandbox', 'StackBlitz', 'Replit', 'Gitpod', 'CodeSpaces',
  // 前端工程化
  'Commitlint', 'Husky', 'lint-staged', 'Prettier', 'ESLint', 'Stylelint', 'Markdownlint',
  'cspell', 'ts-prune', 'knip', 'depcheck', 'npm-check-updates', 'Renovate', 'Dependabot',
  // 性能优化
  'Lighthouse', 'PageSpeed', 'WebPageTest', 'GTmetrix', 'SpeedCurve', 'Calibre', 'DebugBear',
  'BundlePhobia', 'ImportCost', 'webpack-bundle-analyzer', 'source-map-explorer',
  // 前端路由
  'TanStackRouter', 'ReactLocation', 'Wouter', 'Reach Router', 'UniversalRouter', 'Director',
  // 表单库
  'ReactHookForm', 'Formik', 'FinalForm', 'Yup', 'Zod', 'Joi', 'Vest', 'Valibot', 'Superstruct',
  // 动画库
  'Framer', 'FramerMotion', 'ReactSpring', 'react-transition-group', 'AutoAnimate', 'GSAP', 'anime.js',
  'Motion', 'Remotion', 'Lottie', 'Rive', 'Spline', 'Three.js', 'React Three Fiber',
  // 图表库
  'D3', 'Chart.js', 'ECharts', 'ApexCharts', 'Recharts', 'Nivo', 'Victory', 'Visx',
  'Plotly', 'Highcharts', 'amCharts', 'FusionCharts', 'Vega', 'VegaLite', 'Observable',
  // 日期处理
  'dayjs', 'date-fns', 'Luxon', 'moment', 'Temporal', 'date-fns-tz', 'spacetime',
  // 国际化
  'i18next', 'react-i18next', 'FormatJS', 'react-intl', 'LinguiJS', 'Polyglot', 'Globalize',
  // 实用工具库
  'lodash', 'underscore', 'Ramda', 'RxJS', 'ImmutableJS', 'nanoid', 'uuid', 'clsx', 'classnames',
  'immer', 'use-immer', 'dot-prop', 'just', 'remeda', 'radash',
  // HTTP客户端
  'ky', 'got', 'node-fetch', 'superagent', 'request', 'wretch', 'ofetch', 'undici',
  // 验证和Schema
  'ajv', 'json-schema', 'schema-validator', 'class-validator', 'io-ts', 'typebox',
  // 加密和安全
  'crypto-js', 'bcryptjs', 'jsonwebtoken', 'passport', 'helmet', 'csurf', 'express-rate-limit',
  // 文件处理
  'multer', 'formidable', 'busboy', 'sharp', 'jimp', 'pdf-lib', 'pdfkit', 'exceljs',
  // 邮件
  'nodemailer', 'sendgrid', 'mailgun', 'postmark', 'sparkpost', 'email-templates',
  // 模板引擎
  'handlebars', 'ejs', 'pug', 'nunjucks', 'mustache', 'liquid', 'eta',
  // 进程管理
  'concurrently', 'npm-run-all', 'cross-env', 'dotenv-cli', 'wait-on',
  // 更多Vue生态
  'VueX', 'VueRouter', 'VueCLI', 'VueDevTools', 'VuePress', 'Vuelidate', 'VeeValidate',
  'VueMeta', 'VueApollo', 'VueI18n', 'VueObserver', 'VueCompositionAPI', 'VueReactivity',
  // Angular生态
  'Angular', 'AngularCLI', 'NgRx', 'RxJS', 'TypeORM', 'AngularMaterial', 'AngularFire',
  'AngularRouter', 'AngularForms', 'AngularAnimations', 'Ivy', 'ZoneJS',
  // 微前端
  'SingleSPA', 'qiankun', 'MicroApp', 'ModuleFederation', 'SystemJS', 'import-maps',
  // WebAssembly
  'WASM', 'WebAssembly', 'Emscripten', 'AssemblyScript', 'wasmtime', 'wasmer',
  'WebWorkers', 'ServiceWorkers', 'PWA', 'OfflineFirst', 'PushNotifications', 'IndexedDB', 'LocalStorage',
  'SessionStorage', 'CacheStorage', 'FetchAPI', 'Axios', 'XMLHttpRequest', 'WebSocket', 'SSE', 'EventSource',
  'ReactRouterDom', 'ReactRouterNative', 'Route', 'Switch', 'Link', 'NavLink', 'useNavigate', 'useLocation',
  'useParams', 'useMatch', 'MemoryRouter', 'HashRouter', 'BrowserRouter', 'Outlet', 'NestedRoutes', 'ProtectedRoutes',
  'ReduxThunk', 'ReduxSaga', 'ReduxObservable', 'Immer', 'Reselect', 'Normalizr', 'ReduxDevTools', 'AsyncThunks',
  'createSlice', 'configureStore', 'Provider', 'connect', 'mapStateToProps', 'mapDispatchToProps', 'useSelector',
  'useDispatch', 'ApolloProvider', 'gql', 'useQuery', 'useMutation', 'useSubscription', 'InMemoryCache',
  'HttpLink', 'WebSocketLink', 'ApolloCache', 'Fragment', 'Mutation', 'Query', 'Subscription', 'Resolver',
  'Directive', 'TypeDefs', 'ApolloServer', 'GraphQLSchema', 'GraphQLType', 'GraphQLScalarType', 'GraphQLObjectType',
  'GraphQLInputObjectType', 'GraphQLList', 'GraphQLNonNull', 'GraphQLEnumType', 'GraphQLInterfaceType',
  'GraphQLUnionType', 'ReactNativeElements', 'ReactNativeVectorIcons', 'ReactNativePaper', 'Expo', 'ExpoGo',
  'ExpoSDK', 'ReactNativeNavigation', 'ReactNavigation', 'StackNavigator', 'TabNavigator', 'DrawerNavigator',
  'BottomTabNavigator', 'MaterialTopTabNavigator', 'createStackNavigator', 'createBottomTabNavigator',
  'createMaterialTopTabNavigator', 'createDrawerNavigator', 'SafeAreaView', 'ScrollView', 'FlatList', 'SectionList',
  'Pressable', 'TouchableOpacity', 'TouchableHighlight', 'TouchableWithoutFeedback', 'TextInput', 'Image', 'ImageBackground',
  'Animated', 'PanResponder', 'Dimensions', 'StatusBar', 'Alert', 'Modal', 'ActivityIndicator', 'RefreshControl',
  'KeyboardAvoidingView', 'Platform', 'StyleSheet', 'useColorScheme', 'Appearance', 'Linking', 'Share', 'AsyncStorage',
  'MMKV', 'Reanimated', 'ReactNativeReanimated', 'GestureHandler', 'ReactNativeGestureHandler', 'Lottie',
  'ReactNativeLottie', 'Svg', 'ReactNativeSvg', 'ExpoFont', 'ExpoAssets', 'ExpoCamera', 'ExpoImagePicker',
  'ExpoLocation', 'ExpoPushNotifications', 'ExpoBarCodeScanner', 'ExpoFaceDetector', 'ExpoSpeech', 'ExpoFileSystem',
  'ExpoSQLite', 'ExpoStoreReview', 'ExpoInAppPurchases', 'ExpoAnalytics', 'ExpoAmplitude', 'ExpoSegment', 'ExpoSentry',
  'WebpackConfig', 'BabelConfig', 'ESLintConfig', 'PrettierConfig', 'JestConfig', 'CypressConfig', 'StorybookConfig',
  'ViteConfig', 'NextConfig', 'GatsbyConfig', 'RemixConfig', 'PostCSSConfig', 'TailwindConfig', 'ESBuild', 'Rollup',
  'Parcel', 'SWC', 'TypeScript', 'JavaScript', 'ECMAScript', 'ES2020', 'ES2021', 'ES2022', 'ES2023', 'ESNext',
  'TypeScriptConfig', 'tsconfig', 'tsx', 'jsx', 'ts', 'js', 'html', 'css', 'scss', 'less', 'styl', 'json', 'yaml',
  'yml', 'md', 'markdown', 'graphql', 'gql', 'svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'woff', 'woff2',
  'ttf', 'eot', 'ico', 'bundle', 'chunk', 'sourcemap', 'minify', 'uglify', 'compress', 'optimize', 'polyfill',
  'shim', 'transpile', 'compile', 'bundle', 'codegen', 'scaffold', 'generate', 'template', 'boilerplate', 'starter',
  'kit', 'toolkit', 'framework', 'library', 'module', 'package', 'dependency', 'devdependency', 'peer dependency',
  'optional dependency', 'semver', 'versioning', 'npm', 'yarn', 'pnpm', 'bun', 'workspace', 'monorepo', 'polyrepo',
  'lerna', 'nx', 'turborepo', 'rush', 'pnpm workspace', 'yarn workspace', 'npm workspace', 'module resolution',
  'node modules', 'packagejson', 'package-lockjson', 'yarnlock', 'pnpm-lockyaml', 'tsconfigjson', 'jsconfigjson',
  'eslintrc', 'eslintrcjson', 'eslintrcjs', 'prettierrc', 'prettierrcjson', 'prettierrcjs', 'gitignore', 'editorconfig',
  'env', 'envlocal', 'envdevelopment', 'envproduction', 'envtst', 'dotenv', 'dotenvexpand', 'vscode', 'settingsjson',
  'launchjson', 'tasksjson', 'extensionsjson', 'vscodeignore', 'githubactions', 'workflows', 'actions', 'workflow',
  'ci', 'cd', 'continuousintegration', 'continuousdelivery', 'continuousdeployment', 'github', 'gitlab', 'bitbucket',
  'azuredevops', 'jenkins', 'travisci', 'circleci', 'appveyor', 'codecov', 'coveralls', 'sonarqube', 'snyk', 'dependabot',
  'renovate', 'security', 'vulnerability', 'audit', 'scan', 'lint', 'test', 'build', 'deploy', 'preview', 'release',
  'version', 'tag', 'branch', 'merge', 'pullrequest', 'pr', 'issue', 'bug', 'feature', 'enhancement', 'documentation',
  'refactor', 'performance', 'accessibility', 'security', 'dependencies', 'breakingchange', 'changelog', 'semanticrelease',
  'commitizen', 'conventionalcommits', 'commitlint', 'husky', 'lintstaged', 'precommit', 'postcommit', 'prepush',
  'postpush', 'prebuild', 'postbuild', 'pretest', 'posttest', 'monorepo', 'polyrepo', 'microfrontend', 'microservice',
  'monolith', 'api', 'rest', 'restapi', 'graphqlapi', 'grpc', 'soap', 'restful', 'endpoint', 'route', 'middleware',
  'controller', 'service', 'repository', 'model', 'view', 'mvvm', 'mvc', 'flux', 'redux', 'mobx', 'rxjs', 'observable',
  'subject', 'behavior subject', 'replay subject', 'async subject', 'operator', 'pipe', 'map', 'filter', 'reduce',
  'scan', 'switch map', 'merge map', 'concat map', 'exhaust map', 'debounce', 'throttle', 'distinct', 'take', 'take until',
  'take while', 'skip', 'skip until', 'skip while', 'delay', 'timeout', 'retry', 'catch error', 'tap', 'share', 'publish',
  'ref count', 'multicast', 'connectable observable', 'scheduler', 'async scheduler', 'queue scheduler', 'asap scheduler',
  'animation frame scheduler', 'time interval', 'timer', 'interval', 'of', 'from', 'from event', 'combine latest',
  'with latest from', 'zip', 'fork join', 'race', 'merge', 'concat', 'start with', 'end with', 'repeat', 'scan',
  'group by', 'partition', 'window', 'buffer', 'distinct until changed', 'distinct until key changed', 'element at',
  'find', 'find index', 'first', 'last', 'single', 'default if empty', 'isEmpty', 'every', 'some', 'includes', 'count',
  'reduce', 'max', 'min', 'average', 'concat all', 'merge all', 'switch all', 'exhaust all', 'materialize', 'dematerialize',
  'observe on', 'subscribe on', 'using', 'create', 'throw error', 'never', 'empty', 'defer', 'iif', 'from promsie',
  'to promsie', 'share replay', 'publish last', 'publish behavior', 'publish replay', 'ref count', 'connect',
  'disconnect', 'unsubscribe', 'subscription', 'add', 'remove', 'unsubscribe', 'closed', 'observable', 'observer',
  'next', 'error', 'complete', 'subscription', 'unsubscribe', 'closed', 'observable', 'observer', 'next', 'error',
  'complete', 'subscription', 'unsubscribe', 'closed', 'observable', 'observer', 'next', 'error', 'complete',
  'subscription', 'unsubscribe', 'closed',
  // 更多浏览器API
  'IntersectionObserver', 'MutationObserver', 'PerformanceObserver', 'ResizeObserver',
  'RequestAnimationFrame', 'RequestIdleCallback', 'CustomEvent', 'MessageChannel',
  'BroadcastChannel', 'SharedWorker', 'Atomics', 'SharedArrayBuffer',
  // Web安全
  'ContentSecurityPolicy', 'SubresourceIntegrity', 'FeaturePolicy', 'PermissionsPolicy',
  'SameSite', 'HttpOnly', 'SecureCookie', 'CrossOrigin', 'OriginIsolation',
  // 前端工具链
  'PostHTML', 'HTMLHint', 'stylelint-config', 'browserslist', 'caniuse-lite',
  'autoprefixer', 'postcss-preset-env', 'tailwindcss-forms', 'tailwindcss-typography',
  // 状态管理库
  'Overmind', 'Easy Peasy', 'Hookstate', 'Valtio', 'Nano Stores', 'Legend State',
  // UI组件库
  'Formik', 'React Final Form', 'React Select', 'React Table', 'TanStack Table',
  'React Virtualized', 'React Window', 'React Beautiful DnD', 'dnd-kit',
  'React Dropzone', 'React Toastify', 'React Hot Toast', 'Sonner',
  // 工程化工具
  'semantic-release', 'standard-version', 'commitizen', 'cz-conventional-changelog',
  'commitlint-config-conventional', 'lint-staged-config', 'simple-git-hooks',
  // 微前端框架
  'icestark', 'garfish', 'wujie', 'emp', 'micro-zoe',
];

// 后端技术术语（约2000个）
const BACKEND_TERMS = [
  // Node.js生态
  'NodeJS', 'Express', 'NestJS', 'Fastify', 'Koa', 'Hapi', 'Sails', 'Meteor', 'LoopBack', 'FeathersJS',
  'SocketIO', 'WebSocket', 'HTTP', 'HTTPS', 'REST', 'RESTful', 'API', 'GraphQL', 'ApolloServer', 'PostGraphile',
  'TypeGraphQL', 'Prisma', 'Sequelize', 'TypeORM', 'Mongoose', 'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'MariaDB',
  // 新增数据库相关
  'CockroachDB', 'TiDB', 'Cassandra', 'ScyllaDB', 'Neo4j', 'ArangoDB', 'Couchbase', 'CouchDB', 'RethinkDB',
  'FaunaDB', 'PlanetScale', 'Neon', 'Xata', 'EdgeDB', 'SurrealDB', 'ClickHouse', 'TimescaleDB',
  'Drizzle', 'Kysely', 'MikroORM', 'Knex', 'Objection', 'Bookshelf', 'Waterline', 'Caminte',
  // Python后端框架
  'Django', 'Flask', 'FastAPI', 'Pyramid', 'Tornado', 'Bottle', 'CherryPy', 'Falcon', 'Sanic',
  'Starlette', 'Quart', 'aiohttp', 'Connexion', 'Responder', 'APIFlask', 'Litestar',
  // Java后端框架
  'Spring', 'SpringBoot', 'SpringCloud', 'SpringMVC', 'SpringSecurity', 'SpringData', 'Hibernate',
  'MyBatis', 'JPA', 'Quarkus', 'Micronaut', 'Vert.x', 'Play', 'Dropwizard', 'Spark', 'Javalin',
  // Go后端框架
  'Gin', 'Echo', 'Fiber', 'Chi', 'Beego', 'Iris', 'Revel', 'Buffalo', 'Gorm', 'sqlx',
  // Rust后端框架
  'Actix', 'Rocket', 'Axum', 'Warp', 'Tide', 'Poem', 'Salvo', 'Diesel', 'SeaORM', 'sqlx',
  // PHP后端框架
  'Laravel', 'Symfony', 'CodeIgniter', 'Yii', 'Phalcon', 'Slim', 'Lumen', 'CakePHP',
  'Composer', 'PHPUnit', 'Eloquent', 'Doctrine', 'Propel',
  // .NET生态
  'DotNet', 'ASPNet', 'EntityFramework', 'Blazor', 'SignalR', 'MAUI', 'Xamarin',
  'NuGet', 'MVC', 'WebAPI', 'gRPC', 'WPF', 'WinForms', 'UWP',
  // Ruby生态
  'Ruby', 'Rails', 'RubyOnRails', 'Sinatra', 'Rack', 'RSpec', 'Bundler', 'Rake',
  'ActiveRecord', 'ActiveSupport', 'ActionCable', 'Sidekiq', 'Devise',
  // 消息队列
  'ActiveMQ', 'ZeroMQ', 'Pulsar', 'MQTT', 'AMQP', 'STOMP', 'Celery', 'BullMQ',
  // 搜索引擎
  'Solr', 'Algolia', 'MeiliSearch', 'Typesense', 'OpenSearch', 'Sphinxsearch',
  // 缓存系统
  'Varnish', 'Squid', 'Hazelcast', 'Ehcache', 'Caffeine', 'Guava Cache',
  // API网关
  'Envoy', 'Traefik', 'Ambassador', 'Gloo', 'KrakenD', 'Express Gateway',
  // 服务网格
  'Kuma', 'OpenServiceMesh', 'Cilium', 'Maesh', 'Meshery',
  // 配置管理
  'Consul', 'etcd', 'Zookeeper', 'Nacos', 'Apollo', 'Spring Cloud Config',
  // 分布式系统
  'Zookeeper', 'Raft', 'Paxos', 'Gossip', 'VectorClock', 'LamportClock',
  'DistributedLock', 'DistributedTransaction', 'EventualConsistency', 'StrongConsistency',
  // 更多后端框架和工具
  'Deno', 'Bun', 'Nitro', 'H3', 'Hono', 'Oak', 'fresh', 'Aleph',
  // 测试工具
  'k6', 'Locust', 'Gatling', 'JMeter', 'wrk', 'autocannon', 'clinic',
  'newman', 'Postman', 'Insomnia', 'HTTPie', 'curl', 'wget',
  // 数据库工具
  'pgAdmin', 'DBeaver', 'HeidiSQL', 'MySQL Workbench', 'phpMyAdmin',
  'Adminer', 'Redis Commander', 'RedisInsight', 'Robo 3T', 'Studio 3T',
  // ORM和查询构建器
  'Prisma', 'Drizzle', 'Kysely', 'TypeORM', 'MikroORM', 'Sequelize', 'Bookshelf',
  'Objection', 'Knex', 'Slonik', 'Zapatos', 'pg-promise',
  // Python库
  'requests', 'httpx', 'aiohttp', 'Flask-RESTful', 'FastAPI-Users', 'Pydantic',
  'Marshmallow', 'SQLAlchemy', 'Alembic', 'peewee', 'tortoise-orm', 'piccolo',
  'Celery', 'RQ', 'Dramatiq', 'APScheduler', 'schedule', 'croniter',
  // Java库
  'Lombok', 'MapStruct', 'Guava', 'Apache Commons', 'Jackson', 'Gson', 'Fastjson',
  'Logback', 'Log4j', 'SLF4J', 'JUnit', 'TestNG', 'Mockito', 'WireMock',
  // 服务发现
  'Eureka', 'Nacos', 'Consul', 'Zookeeper', 'etcd', 'CoreDNS',
  // 负载均衡
  'HAProxy', 'Traefik', 'Envoy', 'Nginx', 'Caddy', 'Apache httpd', 'LiteSpeed',
  // 消息中间件
  'RabbitMQ', 'ActiveMQ', 'Kafka', 'Pulsar', 'NATS', 'Redis Streams', 'AWS SQS',
  'Google Pub/Sub', 'Azure Service Bus', 'EventBridge',
  'Redis', 'Elasticsearch', 'Kibana', 'Logstash', 'ELKStack', 'Docker', 'Kubernetes', 'DockerCompose', 'Helm',
  'Minikube', 'K3s', 'ECS', 'EKS', 'GKE', 'AKS', 'AWS', 'Azure', 'GCP', 'Heroku', 'Vercel', 'Netlify', 'Railway',
  'Render', 'FlyIO', 'DigitalOcean', 'Linode', 'Vultr', 'Cloudflare', 'CloudFront', 'S3', 'RDS', 'DynamoDB',
  'Lambda', 'Serverless', 'ServerlessFramework', 'AWSAmplify', 'Firebase', 'Supabase', 'Hasura', 'Auth0', 'Okta',
  'JWT', 'JSONWebToken', 'OAuth2', 'OpenIDConnect', 'PassportJS', 'Bcrypt', 'Argon2', 'Joi', 'Zod', 'Yup', 'Celebrate',
  'Validator', 'ExpressValidator', 'Morgan', 'Winston', 'Pino', 'Bunyan', 'Log4js', 'PM2', 'Forever', 'Nodemon',
  'Typescript', 'Javascript', 'ESLint', 'Prettier', 'Jest', 'Mocha', 'Chai', 'Sinon', 'SuperTest', 'Artillery',
  'LoadTesting', 'PerformanceTesting', 'SecurityTesting', 'UnitTesting', 'IntegrationTesting', 'EndToEndTesting',
  'TDD', 'BDD', 'CI', 'CD', 'GitHubActions', 'GitLabCI', 'Jenkins', 'CircleCI', 'TravisCI', 'AzureDevOps',
  'Docker', 'Containerization', 'Orchestration', 'K8s', 'Kubernetes', 'Istio', 'Linkerd', 'Consul', 'Vault',
  'Prometheus', 'Grafana', 'Datadog', 'NewRelic', 'Sentry', 'Rollbar', 'ErrorTracking', 'APIMonitoring',
  'ApplicationPerformanceMonitoring', 'APM', 'LogMonitoring', 'Metrics', 'Tracing', 'DistributedTracing',
  'OpenTelemetry', 'Jaeger', 'Zipkin', 'Middleware', 'CORS', 'CSRF', 'Helmet', 'RateLimiting', 'Throttling',
  'Caching', 'RedisCache', 'Memcached', 'CDN', 'ContentDeliveryNetwork', 'LoadBalancing', 'ReverseProxy',
  'Nginx', 'Apache', 'Caddy', 'HAProxy', 'API Gateway', 'Kong', 'Tyk', 'Apigee', 'Mulesoft', 'ServiceMesh',
  'Microservices', 'Monolith', 'SOA', 'ServiceOrientedArchitecture', 'EventDrivenArchitecture', 'EDA',
  'MessageQueue', 'RabbitMQ', 'Kafka', 'NATS', 'RedisStream', 'SQS', 'SNS', 'EventBus', 'PubSub', 'Publisher',
  'Subscriber', 'Producer', 'Consumer', 'Queue', 'Topic', 'Partition', 'Broker', 'Cluster', 'Replication',
  'Sharding', 'Indexing', 'QueryOptimization', 'DatabaseSchema', 'Migration', 'Seed', 'Fixture', 'ORM',
  'ODM', 'QueryBuilder', 'RawQuery', 'Transaction', 'ACID', 'CAPTheorem', 'BASE', 'Consistency', 'Availability',
  'PartitionTolerance', 'ReadWriteSplitting', 'MasterSlave', 'MultiMaster', 'ConnectionPool', 'Pooling',
  'DatabaseConnection', 'DataSource', 'RepositoryPattern', 'ServiceLayer', 'ControllerLayer', 'ModelLayer',
  'ViewLayer', 'MVVM', 'MVC', 'CleanArchitecture', 'HexagonalArchitecture', 'OnionArchitecture', 'DDD',
  'DomainDrivenDesign', 'Entity', 'ValueObject', 'Aggregate', 'DomainService', 'ApplicationService', 'InfrastructureService',
  'Repository', 'Factory', 'Strategy', 'Singleton', 'Observer', 'Decorator', 'Adapter', 'Facade', 'Proxy', 'Command',
  'Query', 'CQRS', 'EventSourcing', 'Saga', 'Idempotency', 'RetryPattern', 'CircuitBreaker', 'Fallback', 'Bulkhead',
  'Timeout', 'Throttling', 'RateLimiting', 'HealthCheck', 'LivenessProbe', 'ReadinessProbe', 'StartupProbe',
  'GracefulShutdown', 'Uptime', 'Downtime', 'SLA', 'ServiceLevelAgreement', 'SLO', 'ServiceLevelObjective',
  'SLI', 'ServiceLevelIndicator', 'ErrorBudget', 'Incident', 'Postmortem', 'RootCauseAnalysis', 'RCA', 'MTTR',
  'MeanTimeToRecovery', 'MTTF', 'MeanTimeToFailure', 'MTBF', 'MeanTimeBetweenFailures', 'Scalability', 'HorizontalScaling',
  'VerticalScaling', 'AutoScaling', 'Elasticity', 'Throughput', 'Latency', 'ResponseTime', 'RequestPerSecond', 'RPS',
  'QPS', 'QueriesPerSecond', 'Bandwidth', 'MemoryUsage', 'CPUUsage', 'DiskUsage', 'NetworkUsage', 'ResourceUtilization',
  'CostOptimization', 'FinOps', 'DevOps', 'DevSecOps', 'MLOps', 'GitOps', 'InfrastructureAsCode', 'IAC', 'Terraform',
  'CloudFormation', 'ARM', 'Pulumi', 'Ansible', 'Chef', 'Puppet', 'SaltStack', 'Packer', 'Vagrant', 'VirtualMachine',
  'VM', 'Hypervisor', 'ESXi', 'HyperV', 'VirtualBox', 'VMware', 'Networking', 'TCP', 'UDP', 'IP', 'IPv4', 'IPv6',
  'DNS', 'DomainNameSystem', 'DHCP', 'NAT', 'VPN', 'Firewall', 'SecurityGroup', 'ACL', 'AccessControlList', 'SSL',
  'TLS', 'HTTPS', 'Certificates', 'SSL certificate', 'TLS certificate', 'LetEncrypt', 'Certbot', 'KeyStore', 'TrustStore',
  'PrivateKey', 'PublicKey', 'CertificateAuthority', 'CA', 'PKI', 'PublicKeyInfrastructure', 'Encryption', 'Decryption',
  'SymmetricEncryption', 'AsymmetricEncryption', 'AES', 'RSA', 'ECDSA', 'HMAC', 'Hash', 'SHA256', 'MD5', 'BCrypt',
  'Argon2', 'PasswordHashing', 'Salting', 'Peppering', 'TwoFactorAuthentication', '2FA', 'MFA', 'MultiFactorAuthentication',
  'Biometrics', 'Fingerprint', 'FaceRecognition', 'OAuth', 'OAuth2', 'OpenID', 'OpenIDConnect', 'SAML', 'LDAP',
  'ActiveDirectory', 'SSO', 'SingleSignOn', 'RBAC', 'RoleBasedAccessControl', 'ABAC', 'AttributeBasedAccessControl',
  'JWT', 'JSONWebToken', 'Token', 'AccessToken', 'RefreshToken', 'IdToken', 'BearerToken', 'Authorization', 'Authentication',
  'Session', 'Cookie', 'SessionCookie', 'SecureCookie', 'HttpOnlyCookie', 'SameSiteCookie', 'CSRF', 'XSS', 'SQLInjection',
  'NoSQLInjection', 'CommandInjection', 'PathTraversal', 'XXE', 'XMLExternalEntity', 'SSRF', 'ServerSideRequestForgery',
  'CSRFToken', 'CSP', 'ContentSecurityPolicy', 'XContentTypeOptions', 'XFrameOptions', 'XSSProtection', 'ReferrerPolicy',
  'StrictTransportSecurity', 'HSTS', 'SecurityHeaders', 'Vulnerability', 'CVE', 'CommonVulnerabilitiesAndExposures',
  'SecurityScan', 'PenetrationTesting', 'PenTest', 'VulnerabilityAssessment', 'SecurityAudit', 'Compliance', 'GDPR',
  'CCPA', 'HIPAA', 'PCI DSS', 'SOX', 'ISO27001', 'SOC2', 'DataProtection', 'Privacy', 'DataBreach', 'IncidentResponse',
  'ForensicAnalysis', 'Backup', 'DisasterRecovery', 'DR', 'BusinessContinuity', 'BC', 'BackupStrategy', 'Restore',
  'Snapshot', 'Replication', 'GeoReplication', 'MultiRegion', 'MultiZone', 'HighAvailability', 'HA', 'FaultTolerance',
  'FT'
];

// AI技术术语（约1600个）
const AI_TERMS = [
  // 机器学习框架
  'TensorFlow', 'PyTorch', 'Keras', 'MXNet', 'Caffe', 'Caffe2', 'Theano', 'CNTK', 'Torch', 'Chainer',
  'FastAI', 'HuggingFace', 'Transformers', 'Datasets', 'Tokenizers', 'Accelerate', 'Optimum', 'SentenceTransformers',
  'spaCy', 'NLTK', 'Gensim', 'scikit-learn', 'scipy', 'numpy', 'pandas', 'matplotlib', 'seaborn', 'plotly',
  'bokeh', 'Jupyter', 'JupyterNotebook', 'JupyterLab', 'Colab', 'Kaggle', 'MLflow', 'WeightsBiases', 'TensorBoard',
  'NeptuneAI', 'CometML', 'Pachyderm', 'DVC', 'DataVersionControl', 'EvidentlyAI', 'Gradio', 'Streamlit', 'Dash',
  'Bokeh', 'Panel', 'Voila', 'PyShiny', 'FastAPI', 'Flask', 'Django', 'RESTfulAPI', 'GraphQL', 'Docker',
  'Kubernetes', 'AWS', 'AzureML', 'GCPAI', 'VertexAI', 'SageMaker', 'DeepLens', 'Lex', 'Polly', 'Rekognition',
  'Textract', 'Comprehend', 'Translate', 'Transcribe', 'Forecast', 'Personalize', 'SageMakerGroundTruth',
  'AzureCognitiveServices', 'AzureMLStudio', 'AzureOpenAI', 'GoogleCloudAI', 'GoogleAIPlatform', 'GoogleCloudVision',
  'GoogleCloudNLP', 'GoogleCloudSpeech', 'GoogleCloudTranslation', 'GoogleCloudDialogflow', 'IBMWatson', 'WatsonAssistant',
  'WatsonDiscovery', 'WatsonNaturalLanguageUnderstanding', 'WatsonSpeechToText', 'WatsonTextToSpeech',
  // 机器学习概念
  'MachineLearning', 'ML', 'DeepLearning', 'DL', 'ArtificialIntelligence', 'AI', 'NeuralNetwork', 'NN',
  'DeepNeuralNetwork', 'DNN', 'ConvolutionalNeuralNetwork', 'CNN', 'RecurrentNeuralNetwork', 'RNN', 'LongShortTermMemory',
  'LSTM', 'GatedRecurrentUnit', 'GRU', 'Transformer', 'AttentionMechanism', 'SelfAttention', 'MultiHeadAttention',
  'BERT', 'GPT', 'GPT2', 'GPT3', 'GPT35', 'GPT4', 'ChatGPT', 'LLaMA', 'LLaMA2', 'PaLM', 'Bard', 'Claude', 'Falcon',
  'Mixtral', 'Dolly', 'StableDiffusion', 'MidJourney', 'DALL-E', 'GAN', 'GenerativeAdversarialNetwork', 'VAE',
  'VariationalAutoencoder', 'Autoencoder', 'AE', 'PCA', 'PrincipalComponentAnalysis', 'tSNE', 'UMAP', 'Clustering',
  'KMeans', 'HierarchicalClustering', 'DBSCAN', 'MeanShift', 'GaussianMixtureModel', 'GMM', 'Classification',
  'Regression', 'BinaryClassification', 'MulticlassClassification', 'MultilabelClassification', 'LogisticRegression',
  'LinearRegression', 'RidgeRegression', 'LassoRegression', 'ElasticNet', 'DecisionTree', 'RandomForest',
  'GradientBoosting', 'XGBoost', 'LightGBM', 'CatBoost', 'AdaBoost', 'Bagging', 'Boosting', 'EnsembleLearning',
  'SupportVectorMachine', 'SVM', 'KNearestNeighbors', 'KNN', 'NaiveBayes', 'GaussianNB', 'BernoulliNB', 'MultinomialNB',
  'NearestCentroid', 'RocCurve', 'AUC', 'Precision', 'Recall', 'F1Score', 'Accuracy', 'ConfusionMatrix', 'TruePositive',
  'TrueNegative', 'FalsePositive', 'FalseNegative', 'TP', 'TN', 'FP', 'FN', 'PrecisionRecallCurve', 'CrossValidation',
  'KFold', 'StratifiedKFold', 'LeaveOneOut', 'GridSearch', 'RandomSearch', 'BayesianOptimization', 'HyperparameterTuning',
  'Hyperparameters', 'Parameters', 'ModelSelection', 'FeatureSelection', 'FeatureEngineering', 'FeatureExtraction',
  'FeatureScaling', 'StandardScaler', 'MinMaxScaler', 'RobustScaler', 'Normalizer', 'OneHotEncoding', 'LabelEncoding',
  'OrdinalEncoding', 'TargetEncoding', 'WOE', 'WeightOfEvidence', 'IV', 'InformationValue', 'MissingValues', 'Imputation',
  'MeanImputation', 'MedianImputation', 'ModeImputation', 'KNNImputation', 'MICE', 'MultivariateImputationByChainedEquations',
  'OutlierDetection', 'ZScore', 'IQR', 'IsolationForest', 'LocalOutlierFactor', 'LOF', 'AutoencoderOutlierDetection',
  'DataPreprocessing', 'DataCleaning', 'DataWrangling', 'DataMunging', 'DataAnalysis', 'ExploratoryDataAnalysis',
  'EDA', 'DescriptiveStatistics', 'InferentialStatistics', 'HypothesisTesting', 'PValue', 'SignificanceLevel',
  'ConfidenceInterval', 'StatisticalPower', 'TypeIError', 'TypeIIError', 'Overfitting', 'Underfitting', 'BiasVarianceTradeoff',
  'Regularization', 'L1Regularization', 'L2Regularization', 'Dropout', 'BatchNormalization', 'LayerNormalization',
  'InstanceNormalization', 'GroupNormalization', 'WeightDecay', 'EarlyStopping', 'LearningRateScheduler', 'LRFinder',
  'Optimizer', 'SGD', 'StochasticGradientDescent', 'Adam', 'AdamW', 'RMSprop', 'Adagrad', 'Adadelta', 'Nadam',
  'Momentum', 'NesterovMomentum', 'BatchSize', 'Epoch', 'Iteration', 'ForwardPass', 'BackwardPass', 'Backpropagation',
  'GradientDescent', 'LossFunction', 'CostFunction', 'CrossEntropyLoss', 'MeanSquaredError', 'MSE', 'MeanAbsoluteError',
  'MAE', 'HuberLoss', 'QuantileLoss', 'FocalLoss', 'DiceLoss', 'JaccardLoss', 'IoULoss', 'L1Loss', 'L2Loss',
  'WeightedLoss', 'ClassWeight', 'BalancedDataset', 'ImbalancedDataset', 'SMOTE', 'SyntheticMinorityOversamplingTechnique',
  'ADASYN', 'BorderlineSMOTE', 'RandomOversampling', 'RandomUndersampling', 'NearMiss', 'ClusterCentroids',
  'EditedNearestNeighbors', 'CondensedNearestNeighbor', 'TomekLinks', 'DataAugmentation', 'ImageAugmentation',
  'TextAugmentation', 'AudioAugmentation', 'GenerativeData', 'SyntheticData', 'DomainAdaptation', 'TransferLearning',
  'FewShotLearning', 'ZeroShotLearning', 'OneShotLearning', 'MetaLearning', 'SelfSupervisedLearning',
  'UnsupervisedLearning', 'SemiSupervisedLearning', 'ReinforcementLearning', 'RL', 'SupervisedLearning',
  'OfflineLearning', 'OnlineLearning', 'BatchLearning', 'IncrementalLearning', 'ContinualLearning', 'LifelongLearning',
  'ActiveLearning', 'ReinforcementLearning', 'RL', 'MarkovDecisionProcess', 'MDP', 'State', 'Action', 'Reward',
  'Policy', 'ValueFunction', 'QLearning', 'DeepQLearning', 'DQN', 'DoubleDQN', 'DuelingDQN', 'PrioritizedExperienceReplay',
  'PER', 'ActorCritic', 'A2C', 'AdvantageActorCritic', 'A3C', 'AsynchronousAdvantageActorCritic', 'PPO', 'ProximalPolicyOptimization',
  'TRPO', 'TrustRegionPolicyOptimization', 'DDPG', 'DeepDeterministicPolicyGradient', 'TD3', 'TwinDelayedDeepDeterministicPolicyGradient',
  'SAC', 'SoftActorCritic', 'HER', 'HindsightExperienceReplay', 'CuriosityDrivenExploration', 'ICM', 'IntrinsicCuriosityModule',
  'ExplorationExploitationTradeoff', 'EpsilonGreedy', 'BoltzmannExploration', 'UpperConfidenceBound', 'UCB',
  'MonteCarloTreeSearch', 'MCTS', 'AlphaZero', 'MuZero', 'SelfPlay', 'OpenAI', 'DeepMind', 'GoogleBrain', 'MicrosoftResearch',
  'FacebookAI', 'AmazonAI', 'IBMResearch', 'BaiduResearch', 'TencentAI', 'AlibabaAI', 'ByteDanceAI', 'MetaAI',
  'Anthropic', 'Cohere', 'AI21Labs', 'HuggingFace', ' StabilityAI', 'EleutherAI', 'LAION', 'OpenAssistant',
  'LLM', 'LargeLanguageModel', 'Multimodal', 'VisionLanguageModel', 'VLM', 'GPT4V', 'Gemini', 'PaLM2', 'LLaMA2',
  'Claude2', 'Falcon40B', 'Mixtral8x7B', 'LlamaCpp', 'GGUF', 'Quantization', 'INT8', 'INT4', 'FP16', 'BF16',
  'ModelCompression', 'KnowledgeDistillation', 'Pruning', 'Quantization', 'LowRankApproximation', 'TensorRT',
  'ONNX', 'OpenNeuralNetworkExchange', 'TorchScript', 'TensorFlowLite', 'TFLite', 'CoreML', 'MLKit', 'EdgeAI',
  'OnDeviceAI', 'FederatedLearning', 'FL', 'PrivacyPreservingMachineLearning', 'PPML', 'HomomorphicEncryption',
  'SecureMultiPartyComputation', 'SMPC', 'DifferentialPrivacy', 'DP', 'GenerativeAI', 'ContentGeneration', 'TextGeneration',
  'ImageGeneration', 'AudioGeneration', 'VideoGeneration', 'CodeGeneration', 'Chatbot', 'ConversationalAI', 'VirtualAssistant',
  'NLP', 'NaturalLanguageProcessing', 'NLU', 'NaturalLanguageUnderstanding', 'NLG', 'NaturalLanguageGeneration',
  'SpeechRecognition', 'SpeechToText', 'STT', 'TextToSpeech', 'TTS', 'MachineTranslation', 'MT', 'Summarization',
  'TextSummarization', 'SentimentAnalysis', 'NamedEntityRecognition', 'NER', 'PartOfSpeechTagging', 'POS',
  'DependencyParsing', 'ConstituencyParsing', 'SemanticRoleLabeling', 'SRL', 'CoreferenceResolution', 'TextClassification',
  'TopicModeling', 'LDA', 'LatentDirichletAllocation', 'LSA', 'LatentSemanticAnalysis', 'PLSA', 'ProbabilisticLatentSemanticAnalysis',
  'WordEmbedding', 'Word2Vec', 'GloVe', 'FastText', 'BERTEmbedding', 'SentenceEmbedding', 'DocumentEmbedding',
  'TransferLearning', 'FineTuning', 'PromptEngineering', 'FewShotPrompting', 'ZeroShotPrompting', 'ChainOfThought',
  'CoT', 'TreeOfThought', 'ToT', 'SelfConsistency', 'RetrievalAugmentedGeneration', 'RAG', 'VectorDatabase',
  'Pinecone', 'Weaviate', 'Qdrant', 'Milvus', 'Chroma', 'FAISS', 'FacebookAI Similarity Search', 'VectorEmbedding',
  'VectorIndex', 'SemanticSearch', 'FullTextSearch', 'HybridSearch', 'RelevanceScore', 'Reranking', 'CrossEncoder',
  'BiEncoder', 'DenseRetrieval', 'SparseRetrieval', 'BM25', 'TFIDF', 'InverseDocumentFrequency', 'CosineSimilarity',
  'EuclideanDistance', 'ManhattanDistance', 'HammingDistance', 'JaccardSimilarity', 'DotProduct', 'MachineVision',
  'ComputerVision', 'CV', 'ImageProcessing', 'ImageRecognition', 'ObjectDetection', 'YOLO', 'YouOnlyLookOnce', 'FasterRCNN',
  'MaskRCNN', 'RetinaNet', 'SSD', 'SingleShotDetector', 'FPN', 'FeaturePyramidNetwork', 'PANet', 'PathAggregationNetwork',
  'DETR', 'DetectionTransformer', 'InstanceSegmentation', 'SemanticSegmentation', 'PanopticSegmentation', 'ImageClassification',
  'ResNet', 'EfficientNet', 'MobileNet', 'VGG', 'Inception', 'DenseNet', 'SqueezeNet', 'ShuffleNet', 'VisionTransformer',
  'ViT', 'SwinTransformer', 'ConvNeXt', 'MLPMixer', 'UNet', 'U2Net', 'Pix2Pix', 'CycleGAN', 'StyleGAN', 'ProGAN',
  'SuperResolution', 'ESRGAN', 'RealESRGAN', 'Deblurring', 'Denoising', 'ImageEnhancement', 'OpticalCharacterRecognition',
  'OCR', 'DocumentAI', 'MedicalImaging', 'ChestXray', 'MRI', 'CTScan', 'Ultrasound', 'Pathology', 'RetinalImaging',
  'AIMedical', 'HealthcareAI', 'DrugDiscovery', 'VirtualScreening', 'MolecularDocking', 'ProteinFolding', 'AlphaFold',
  'AlphaFold2', 'RoseTTAFold', 'StructuralBiology', 'Bioinformatics', 'Genomics', 'Proteomics', 'Metabolomics',
  'MultiOmics', 'SingleCellAnalysis', 'scRNAseq', 'SpatialTranscriptomics', 'GenomeSequencing', 'VariantCalling',
  'GWAS', 'GenomeWideAssociationStudy', 'PolygenicRiskScore', 'PRS', 'CancerGenomics', 'PrecisionMedicine',
  'PersonalizedMedicine', 'AIforScience', 'ScientificComputing', 'ClimateModeling', 'WeatherForecasting', 'EarthObservation',
  'RemoteSensing', 'SatelliteImagery', 'GeospatialAI', 'GIS', 'GeoInformationSystem', 'DigitalTwin', 'Simulation',
  'ComputationalPhysics', 'ComputationalChemistry', 'ComputationalBiology', 'AstronomyAI', 'ParticlePhysics',
  'QuantumComputing', 'QuantumMachineLearning', 'QML', 'QuantumNeuralNetwork', 'QNN', 'QuantumSuperposition',
  'QuantumEntanglement', 'QuantumInterference', 'QuantumAnnealing', 'D-Wave', 'IBMQuantum', 'GoogleQuantum',
  'MicrosoftQuantum', 'QuantumCircuit', 'QuantumGate', 'Qubit', 'QuantumAlgorithm', 'ShorAlgorithm', 'GroverAlgorithm',
  'QuantumFourierTransform', 'QFT', 'QuantumErrorCorrection', 'QEC', 'NoisyIntermediateScaleQuantum', 'NISQ',
  'QuantumAdvantage', 'QuantumSupremacy',
  // 添加更多深度学习模型
  'AlexNet', 'LeNet', 'GoogLeNet', 'InceptionV3', 'ResNeXt', 'WideResNet', 'MobileNetV2', 'MobileNetV3',
  'EfficientNetB0', 'EfficientNetV2', 'NASNet', 'PNASNet', 'SENet', 'RegNet', 'NFNet',
  // NLP模型
  'ELMo', 'GPT', 'BERT', 'RoBERTa', 'ALBERT', 'DistilBERT', 'ELECTRA', 'DeBERTa', 'XLNet', 'T5',
  'BART', 'mBART', 'Pegasus', 'ProphetNet', 'UniLM', 'ERNIE', 'SpanBERT', 'SentenceBERT',
  // 大模型
  'GPT3', 'GPT3.5', 'GPT4', 'GPT4-Turbo', 'GPT4V', 'ChatGPT', 'InstructGPT', 'CodexGPT',
  'PaLM', 'PaLM2', 'Gemini', 'GeminiPro', 'Claude', 'Claude2', 'Claude3', 'LLaMA', 'LLaMA2', 'Vicuna',
  'Alpaca', 'Dolly', 'StableLM', 'Falcon', 'MPT', 'Bloom', 'OPT', 'GLM', 'ChatGLM', 'Baichuan',
  // 多模态模型
  'CLIP', 'DALL-E', 'DALL-E2', 'DALL-E3', 'StableDiffusion', 'StableDiffusionXL', 'MidJourney',
  'Imagen', 'Parti', 'ControlNet', 'DreamBooth', 'LoRA', 'Textual Inversion',
  // 计算机视觉
  'RCNN', 'FastRCNN', 'FasterRCNN', 'MaskRCNN', 'CascadeRCNN', 'YOLOv3', 'YOLOv4', 'YOLOv5',
  'YOLOv6', 'YOLOv7', 'YOLOv8', 'YOLOX', 'DETR', 'DeformableDETR', 'EfficientDet', 'CenterNet',
  // 音频处理
  'WaveNet', 'Tacotron', 'Tacotron2', 'DeepSpeech', 'Wav2Vec', 'Wav2Vec2', 'Whisper', 'HuBERT',
  // AutoML
  'AutoML', 'NAS', 'NeuralArchitectureSearch', 'ENAS', 'DARTS', 'AutoKeras', 'AutoGluon',
  'TPOT', 'H2O', 'MLBox', 'PyCaret', 'FLAML',
  // 增强学习环境
  'OpenAIGym', 'Gymnasium', 'Atari', 'MuJoCo', 'PyBullet', 'Isaac Gym', 'Unity ML-Agents',
  // 数据处理
  'Dask', 'Vaex', 'Modin', 'Ray', 'PySpark', 'Polars', 'Pandera', 'Great Expectations',
  // MLOps工具
  'Kubeflow', 'MLRun', 'Metaflow', 'Airflow', 'Prefect', 'Dagster', 'ZenML', 'ClearML',
  'Weights Biases', 'Neptune', 'Comet', 'MLflow Tracking', 'Model Registry',
];

// 合并所有术语
const ALL_TERMS = [...new Set([...FRONTEND_TERMS, ...BACKEND_TERMS, ...AI_TERMS])];

// 按领域保存术语
function saveTermsByDomain() {
  console.log('开始生成技术术语词库...');
  
  // 保存前端术语
  const frontendPath = join(OUTPUT_DIR, 'frontend-terms.txt');
  writeFileSync(frontendPath, FRONTEND_TERMS.join('\n'), 'utf8');
  console.log(`已保存前端术语 ${FRONTEND_TERMS.length} 个到 ${frontendPath}`);
  
  // 保存后端术语
  const backendPath = join(OUTPUT_DIR, 'backend-terms.txt');
  writeFileSync(backendPath, BACKEND_TERMS.join('\n'), 'utf8');
  console.log(`已保存后端术语 ${BACKEND_TERMS.length} 个到 ${backendPath}`);
  
  // 保存AI术语
  const aiPath = join(OUTPUT_DIR, 'ai-terms.txt');
  writeFileSync(aiPath, AI_TERMS.join('\n'), 'utf8');
  console.log(`已保存AI术语 ${AI_TERMS.length} 个到 ${aiPath}`);
  
  // 保存所有术语
  const allPath = join(OUTPUT_DIR, 'all-terms.txt');
  writeFileSync(allPath, ALL_TERMS.join('\n'), 'utf8');
  console.log(`已保存所有术语 ${ALL_TERMS.length} 个到 ${allPath}`);
  
  console.log('技术术语词库生成完成！');
}

// 运行词库生成工具
saveTermsByDomain();
