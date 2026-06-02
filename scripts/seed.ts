import { connectDB } from '../src/lib/db';
import { User } from '../src/models/User';
import { Setting } from '../src/models/Setting';
import { Category } from '../src/models/Category';

async function main() {
  await connectDB();
  await Setting.getOrCreate();

  const eventCat = await Category.findOne({ link: 'events' });
  if (!eventCat) await Category.create({ title: 'Events', link: 'events', description: 'Site events' });
  const newsCat = await Category.findOne({ link: 'news' });
  if (!newsCat) await Category.create({ title: 'News', link: 'news', description: 'General news' });

  const email = process.env.ADMIN_EMAIL || 'uririnathaniel@gmail.com';
  const password = process.env.ADMIN_PASSWORD || 'XQ9v9yDFqfspqjh!';
  let admin = await User.findOne({ email });
  if (admin) {
    console.log('super admin exists:', email);
  } else {
    admin = await User.create({
      name: 'Super Admin',
      email,
      phone: '08000000000',
      password,
      role: 'super admin',
      isBlocked: false,
    });
    console.log('seeded super admin:', email);
  }
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
