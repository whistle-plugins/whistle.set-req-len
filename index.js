const NO_BODY_METHODS = ['GET', 'HEAD', 'OPTIONS'];

const setLength = (headers, len) => {
  delete headers['transfer-encoding'];
  headers['content-length'] = len;
}

exports.server = (server) => {
  server.on('request', (req) => {
    const { method, headers, originalReq: { ruleValue } } = req;
    if (NO_BODY_METHODS.includes(method) || headers['content-length']) {
      return req.passThrough();
    }
    if (ruleValue >= 0) {
      setLength(req.headers, ruleValue);
      return req.passThrough();
    }
    let body;
    req.on('data', (chunk) => {
      body = body ? Buffer.concat([body, chunk]) : chunk;
    });
    req.on('end', () => {
      if (body) {
        setLength(req.headers, body.length);
      } else if (ruleValue !== 'no-empty') {
        setLength(req.headers, body.length);
      }
      req.request().end(body);
    });
  });
};
