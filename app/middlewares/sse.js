export const sse = (req, res, next) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  res.write('\n');

  req.on('close', () => {
    console.log('end')
    res.end();
  })
  
  next();
}