import { input, password } from '@inquirer/prompts';
import { callTsProxy, findAdminInstance } from "./callTsProxy.js";

async function createSuperuser() {
  try {
    const email = await input({
      message: 'Enter superuser email:',
      validate: (value) => {
        if (!value) return 'Email is required';
        return true;
      },
    });

    const pw = await password({
      message: 'Enter superuser password:',
      mask: '*',
      validate: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return true;
      },
    });

    const confirm = await password({
      message: 'Confirm the password:',
      mask: '*',
      validate: (value) => {
        if (value !== pw) return 'Passwords do not match';
        return true;
      },
    });
    const instance = await findAdminInstance();
    try {
        await callTsProxy(`
          import { admin } from './${instance.file}.js';
    
          admin.discoverDatabases().then(async () => {
            if (!await admin.resource('users').get([Filters.EQ('${email}', '${pw}')])) {
            await admin.resource('users').create({
                email: '${email}',
                password_hash: await AdminForth.Utils.generatePasswordHash('${pw}'),
                role: 'superadmin',
            });
            }
            await seedDatabase();
         });
        `);
    
      } catch (e) {
        console.log(`Running file ${file} failed`, e);
      }
    console.log('✅ Superuser created successfully:', createdRecord);
  } catch (err) {
    console.error('❌ Error creating superuser:', err.message);
  }
}

export default createSuperuser;
