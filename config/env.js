import { config } from 'dotenv';
import { resolve, join } from 'path';
import { exit } from 'process';

resolve();

// Set config variables in .env
if (process.env.NODE_ENV === 'production') {
  config({ path: join(__dirname, '.env.production')});
}
else if (process.env.NODE_ENV === 'develop') {
  config({ path: join(__dirname, '.env.develop')});
}
else {
  console.log('.env 파일을 찾을 수 없습니다. 서버를 종료합니다.');
  exit(1);
}
