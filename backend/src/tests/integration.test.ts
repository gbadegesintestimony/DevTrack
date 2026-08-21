import http from 'http';
import { app } from '../app';

interface JsonResponse<T = any> {
  status: number;
  headers: http.IncomingHttpHeaders;
  cookies: string[];
  body: T;
}

function makeRequest(
  server: http.Server,
  options: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: any;
    cookie?: string;
  }
): Promise<JsonResponse> {
  return new Promise((resolve, reject) => {
    const address = server.address() as { port: number; address: string };
    if (!address || typeof address.port !== 'number') {
      return reject(new Error('Server port not available'));
    }

    const payload = options.body ? JSON.stringify(options.body) : null;
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'host': `127.0.0.1:${address.port}`,
      ...(options.headers || {}),
    };

    if (options.cookie) {
      reqHeaders['Cookie'] = options.cookie;
    }
    if (payload) {
      reqHeaders['Content-Length'] = Buffer.byteLength(payload).toString();
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: address.port,
        method: options.method,
        path: options.path,
        headers: reqHeaders,
        timeout: 4000,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsedBody: any = rawData;
          try {
            parsedBody = JSON.parse(rawData);
          } catch {
            // Keep rawData string if not JSON
          }
          resolve({
            status: res.statusCode || 500,
            headers: res.headers,
            cookies: res.headers['set-cookie'] || [],
            body: parsedBody,
          });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error(`Request timed out for ${options.method} ${options.path}`));
    });

    req.on('error', (err) => reject(err));
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

export async function runIntegrationTests() {
  console.log('--- Starting Phase 6 End-to-End API Integration Tests ---');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  try {
    // 1. CSRF Token Handshake
    const csrfRes = await makeRequest(server, {
      method: 'GET',
      path: '/api/v1/auth/csrf-token',
    });
    console.log('1. CSRF Handshake (Status 200 & Token Received):', csrfRes.status === 200 && !!csrfRes.body?.data?.csrfToken);
    if (csrfRes.status !== 200 || !csrfRes.body?.data?.csrfToken) {
      throw new Error(`CSRF handshake failed with status ${csrfRes.status}`);
    }

    // 2. Security Check: Mutating protected endpoint without CSRF token is rejected with 403 Forbidden
    const rejectNoCsrf = await makeRequest(server, {
      method: 'POST',
      path: '/api/v1/technologies',
      body: { name: 'React', category: 'FRAMEWORK', status: 'IN_PROGRESS' },
    });
    console.log('2. CSRF Protection Gate (403 Forbidden without CSRF):', rejectNoCsrf.status === 403);
    if (rejectNoCsrf.status !== 403) {
      throw new Error(`Expected 403 without CSRF token, got ${rejectNoCsrf.status}`);
    }

    // 3. Security Headers Verification
    const hasNosniff = csrfRes.headers['x-content-type-options'] === 'nosniff';
    const hasFrameDeny = csrfRes.headers['x-frame-options'] === 'DENY';
    console.log('3. Security Headers (nosniff & Frame-Options: DENY):', hasNosniff && hasFrameDeny);
    if (!hasNosniff || !hasFrameDeny) {
      throw new Error('Missing expected Helmet security headers');
    }

    // 4. Protected Route Guard (401 Unauthorized for guests)
    const unauthDashboard = await makeRequest(server, {
      method: 'GET',
      path: '/api/v1/dashboard/summary',
    });
    console.log('4. Protected Route Guard (401 Unauthorized for guests):', unauthDashboard.status === 401);
    if (unauthDashboard.status !== 401) {
      throw new Error(`Expected 401 on protected endpoint, got ${unauthDashboard.status}`);
    }

    // 5. Protected Technologies Route Guard (401 Unauthorized)
    const unauthTech = await makeRequest(server, {
      method: 'GET',
      path: '/api/v1/technologies',
    });
    console.log('5. Technologies Guard (401 Unauthorized for guests):', unauthTech.status === 401);
    if (unauthTech.status !== 401) {
      throw new Error(`Expected 401 on technologies endpoint, got ${unauthTech.status}`);
    }

    // 6. Non-existent Route (404 Not Found)
    const notFoundRes = await makeRequest(server, {
      method: 'GET',
      path: '/api/v1/non-existent-endpoint',
    });
    console.log('6. 404 Route Handler:', notFoundRes.status === 404);
    if (notFoundRes.status !== 404) {
      throw new Error(`Expected 404 on missing route, got ${notFoundRes.status}`);
    }

    console.log('--- All Phase 6 End-to-End API Integration Tests PASSED Successfully! ---');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

if (require.main === module) {
  runIntegrationTests().catch((err) => {
    console.error('Integration Test Failed:', err);
    process.exit(1);
  });
}
