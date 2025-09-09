import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next/image
jest.mock('next/image', () => {
  const MockImage = ({ src, alt, ...props }) => {
    return <img src={src} alt={alt} {...props} />;
  };
  MockImage.displayName = 'MockImage';
  return MockImage;
});

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, ...props }) => {
    return <a {...props}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: namespace => key => `${namespace}.${key}`,
  useLocale: () => 'en-US',
}));

// Global fetch mock
global.fetch = jest.fn();

// Web API mocks for Next.js API routes
global.Request = class MockRequest {
  constructor(input, init = {}) {
    // Handle NextRequest compatibility
    if (typeof input === 'string') {
      Object.defineProperty(this, 'url', { value: input, writable: false });
    } else if (input && input.url) {
      Object.defineProperty(this, 'url', { value: input.url, writable: false });
    }

    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this._body = init?.body;

    // NextRequest needs nextUrl property
    Object.defineProperty(this, 'nextUrl', {
      value: new URL(this.url),
      writable: false,
      configurable: false,
    });
  }

  async json() {
    return JSON.parse(this._body || '{}');
  }

  async text() {
    return this._body || '';
  }
};

global.Response = class MockResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Headers(init.headers);
  }

  async json() {
    return JSON.parse(this.body || '{}');
  }

  async text() {
    return this.body || '';
  }

  static json(data, init = {}) {
    return new MockResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });
  }
};

global.Headers = class MockHeaders {
  constructor(init = {}) {
    this._headers = {};
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this._headers[key.toLowerCase()] = value;
      });
    }
  }

  get(name) {
    return this._headers[name.toLowerCase()];
  }

  set(name, value) {
    this._headers[name.toLowerCase()] = value;
  }

  entries() {
    return Object.entries(this._headers);
  }

  keys() {
    return Object.keys(this._headers);
  }

  values() {
    return Object.values(this._headers);
  }

  forEach(callback) {
    Object.entries(this._headers).forEach(([key, value]) => {
      callback(value, key, this);
    });
  }
};

global.URL = class MockURL {
  constructor(url, base) {
    const fullUrl = base ? new URL(url, base).href : url;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const parsed = new (require('url').URL)(fullUrl);
    this.href = parsed.href;
    this.origin = parsed.origin;
    this.protocol = parsed.protocol;
    this.host = parsed.host;
    this.hostname = parsed.hostname;
    this.port = parsed.port;
    this.pathname = parsed.pathname;
    this.search = parsed.search;
    this.searchParams = new URLSearchParams(parsed.search);
    this.hash = parsed.hash;
  }
};

global.URLSearchParams = class MockURLSearchParams {
  constructor(init = '') {
    this._params = new Map();
    if (typeof init === 'string') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const params = new (require('url').URLSearchParams)(init);
      for (const [key, value] of params.entries()) {
        this._params.set(key, value);
      }
    }
  }

  get(name) {
    return this._params.get(name);
  }

  set(name, value) {
    this._params.set(name, value);
  }

  entries() {
    return this._params.entries();
  }
};

// Mock Supabase client
jest.mock('@lib/supabase/api-client', () => ({
  createAPIClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
  }),
}));

// Mock notification database functions
jest.mock('@lib/db/notification-center', () => ({
  getNotificationsWithReadStatus: jest.fn().mockResolvedValue({
    notifications: [],
    total_count: 0,
  }),
  getUserUnreadCount: jest.fn().mockResolvedValue({
    changelog: 0,
    message: 0,
    total: 0,
  }),
  createNotification: jest
    .fn()
    .mockResolvedValue({ id: 'test-notification-id' }),
  canUserAccessNotification: jest.fn().mockResolvedValue(true),
  getNotificationById: jest
    .fn()
    .mockResolvedValue({ id: 'test-notification-id' }),
  updateNotification: jest
    .fn()
    .mockResolvedValue({ id: 'test-notification-id' }),
  deleteNotification: jest.fn().mockResolvedValue(undefined),
}));

// Mock profile functions
jest.mock('@lib/db/profiles', () => ({
  getUserProfileByIdLegacy: jest.fn().mockResolvedValue({
    id: 'test-user-id',
    role: 'user',
  }),
}));

// Mock Supabase browser client for database layer tests
jest.mock('@lib/supabase/client', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    eq: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
  }),
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
