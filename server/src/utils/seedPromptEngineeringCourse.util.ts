import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { run } from './updatePromptEngineeringCourse.util';

export { run };

if (require.main === module) {
  run();
}
