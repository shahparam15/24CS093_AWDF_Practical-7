export function requestLogger(req, res, next) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  res.on("finish", () => {
    const elapsed = Date.now() - startTime;
    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl || req.url} - Status: ${res.statusCode} (${elapsed}ms)`
    );
  });

  next();
}
