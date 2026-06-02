/**
 * One-shot migration: Laravel/MySQL → Mongo (Mongoose).
 *
 * Usage:
 *   tsx scripts/migrate-mysql-to-mongo.ts \
 *     --mysql-uri="mysql://user:pass@host:3306/tsgweb" \
 *     [--mongo-uri="mongodb+srv://..."] \
 *     [--dry-run] [--only=users,posts]
 *
 * Idempotent on `_oldId`: re-runs upsert into Mongo by the original MySQL id.
 * Order matters — see `ORDER` array. bcrypt password hashes are preserved verbatim.
 */
import mysql from 'mysql2/promise';
import { connectDB } from '../src/lib/db';
import { User } from '../src/models/User';
import { Profile } from '../src/models/Profile';
import { Category } from '../src/models/Category';
import { Post } from '../src/models/Post';
import { Image } from '../src/models/Image';
import { Slider } from '../src/models/Slider';
import { Gallery } from '../src/models/Gallery';
import { Setting } from '../src/models/Setting';
import { Page } from '../src/models/Page';
import { Faq } from '../src/models/Faq';
import { EventModel } from '../src/models/Event';
import { Comment } from '../src/models/Comment';
import { CommentResponse } from '../src/models/CommentResponse';
import { Subscription } from '../src/models/Subscription';
import { SiteView } from '../src/models/SiteView';

interface Args { mysqlUri: string; mongoUri?: string; dryRun: boolean; only: string[] }
function parseArgs(): Args {
  const out: Args = { mysqlUri: '', dryRun: false, only: [] };
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--mysql-uri=')) out.mysqlUri = arg.slice('--mysql-uri='.length);
    else if (arg.startsWith('--mongo-uri=')) out.mongoUri = arg.slice('--mongo-uri='.length);
    else if (arg === '--dry-run') out.dryRun = true;
    else if (arg.startsWith('--only=')) out.only = arg.slice('--only='.length).split(',');
  }
  if (!out.mysqlUri) throw new Error('--mysql-uri is required');
  return out;
}

const ORDER = [
  'users', 'profiles', 'categories', 'posts', 'images', 'sliders', 'galleries',
  'settings', 'pages', 'faqs', 'events', 'comments', 'comment_responses',
  'subscriptions', 'site_views',
] as const;
type Table = (typeof ORDER)[number];

const userIds = new Map<number, string>();
const categoryIds = new Map<number, string>();
const imageIds = new Map<number, string>();
const postIds = new Map<number, string>();
const commentIds = new Map<number, string>();

async function migrateUsers(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT id, name, email, phone, email_verified_at, password, role, isBlocked, remember_token, created_at, updated_at FROM users');
  for (const u of rows as Array<Record<string, unknown>>) {
    const oldId = Number(u.id);
    if (dry) { console.log('user', oldId, u.email); continue; }
    const doc = await User.findOneAndUpdate(
      { _oldId: oldId },
      {
        _oldId: oldId,
        name: String(u.name),
        email: String(u.email).toLowerCase(),
        phone: String(u.phone),
        emailVerifiedAt: u.email_verified_at ? new Date(u.email_verified_at as string) : null,
        password: String(u.password),
        role: String(u.role || 'member'),
        rememberToken: u.remember_token ? String(u.remember_token) : null,
        isBlocked: Boolean(u.isBlocked),
        createdAt: u.created_at ? new Date(u.created_at as string) : new Date(),
        updatedAt: u.updated_at ? new Date(u.updated_at as string) : new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, timestamps: false },
    );
    userIds.set(oldId, doc._id.toHexString());
  }
  console.log(`users: ${userIds.size}`);
}

async function migrateProfiles(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM profiles');
  for (const p of rows as Array<Record<string, unknown>>) {
    const userMongoId = userIds.get(Number(p.user_id));
    if (!userMongoId) continue;
    if (dry) { console.log('profile for user', p.user_id); continue; }
    await Profile.findOneAndUpdate(
      { _oldId: Number(p.id) },
      {
        _oldId: Number(p.id),
        user: userMongoId,
        state: p.state, lga: p.lga, ward: p.ward, vid: p.vid,
        address: p.address, zone: p.zone,
        organization: p.organization, headquarter: p.headquarter,
        orgAddress: p.org_address, position: p.position, stateOrigin: p.state_origin,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

async function migrateCategories(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM categories');
  for (const c of rows as Array<Record<string, unknown>>) {
    if (dry) continue;
    const doc = await Category.findOneAndUpdate(
      { _oldId: Number(c.id) },
      { _oldId: Number(c.id), title: c.title, link: c.link, description: c.description },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    categoryIds.set(Number(c.id), doc._id.toHexString());
  }
  console.log(`categories: ${categoryIds.size}`);
}

async function migratePosts(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM posts');
  for (const p of rows as Array<Record<string, unknown>>) {
    const user = userIds.get(Number(p.user_id));
    const cat = categoryIds.get(Number(p.category_id));
    if (!user || !cat) continue;
    if (dry) continue;
    const doc = await Post.findOneAndUpdate(
      { _oldId: Number(p.id) },
      {
        _oldId: Number(p.id),
        title: p.title, link: p.link, description: p.description, content: p.content,
        excerpt: p.excerpt, thumbnail: p.thumbnail, user, category: cat,
        tags: p.tags || '', commentsCount: Number(p.comments_count || 0),
        status: String(p.status || '0'), views: Number(p.views || 0), newsLetter: Number(p.news_letter || 0),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true, timestamps: false },
    );
    postIds.set(Number(p.id), doc._id.toHexString());
  }
  console.log(`posts: ${postIds.size}`);
}

async function migrateImages(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM images');
  for (const i of rows as Array<Record<string, unknown>>) {
    if (dry) continue;
    const link = String(i.link || '');
    const url = link.startsWith('/') || link.startsWith('http') ? link : `/storage/images/${link}`;
    const doc = await Image.findOneAndUpdate(
      { _oldId: Number(i.id) },
      { _oldId: Number(i.id), title: i.title || link, description: i.description, link: url },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    imageIds.set(Number(i.id), doc._id.toHexString());
  }
  console.log(`images: ${imageIds.size}`);
}

async function migrateSliders(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM sliders');
  for (const s of rows as Array<Record<string, unknown>>) {
    const img = imageIds.get(Number(s.image_id));
    if (!img) continue;
    if (dry) continue;
    await Slider.findOneAndUpdate(
      { _oldId: Number(s.id) },
      { _oldId: Number(s.id), image: img, status: String(s.status || '0') },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

async function migrateGalleries(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM galleries');
  for (const g of rows as Array<Record<string, unknown>>) {
    const img = imageIds.get(Number(g.image_id));
    if (!img) continue;
    if (dry) continue;
    await Gallery.findOneAndUpdate(
      { _oldId: Number(g.id) },
      { _oldId: Number(g.id), image: img },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

async function migrateSettings(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM settings LIMIT 1');
  for (const s of rows as Array<Record<string, unknown>>) {
    if (dry) continue;
    await Setting.findOneAndUpdate(
      {},
      {
        title: s.title, description: s.description, keywords: s.keywords,
        mission: s.mission, vision: s.vision, coreValues: s.core_values,
        email: s.email, phone: s.phone, address: s.address,
        bankName: s.bank_name, accountName: s.account_name, accountNumber: s.account_number,
        logo: s.logo, fbLink: s.fb_link, twLink: s.tw_link, igLink: s.ig_link, ytLink: s.yt_link,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

async function migratePages(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM pages');
  for (const p of rows as Array<Record<string, unknown>>) {
    if (dry) continue;
    await Page.findOneAndUpdate(
      { _oldId: Number(p.id) },
      { _oldId: Number(p.id), title: p.title, link: p.link, thumbnail: p.thumbnail,
        description: p.description, keywords: p.keywords, content: p.content, status: String(p.status || '0') },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

async function migrateFaqs(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM faqs');
  for (const f of rows as Array<Record<string, unknown>>) {
    if (dry) continue;
    await Faq.findOneAndUpdate(
      { _oldId: Number(f.id) },
      { _oldId: Number(f.id), question: f.question, answer: f.answer },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

async function migrateEvents(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM events');
  for (const e of rows as Array<Record<string, unknown>>) {
    if (dry) continue;
    await EventModel.findOneAndUpdate(
      { _oldId: Number(e.id) },
      { _oldId: Number(e.id), name: e.name, start: new Date(e.start as string), end: new Date(e.end as string), description: e.description, status: Boolean(e.status) },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

async function migrateComments(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM comments');
  for (const c of rows as Array<Record<string, unknown>>) {
    const post = postIds.get(Number(c.post_id));
    if (!post) continue;
    if (dry) continue;
    const doc = await Comment.findOneAndUpdate(
      { _oldId: Number(c.id) },
      { _oldId: Number(c.id), post, author: c.author, email: c.email, commentBody: c.comment_body, status: String(c.status || '0'), ipAddress: c.ip_address },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    commentIds.set(Number(c.id), doc._id.toHexString());
  }
}

async function migrateCommentResponses(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM comment_responses');
  for (const r of rows as Array<Record<string, unknown>>) {
    const comment = commentIds.get(Number(r.comment_id));
    if (!comment) continue;
    if (dry) continue;
    await CommentResponse.findOneAndUpdate(
      { _oldId: Number(r.id) },
      { _oldId: Number(r.id), comment, response: r.response, author: r.author, email: r.email },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

async function migrateSubscriptions(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM subscriptions');
  for (const s of rows as Array<Record<string, unknown>>) {
    if (dry || !s.email) continue;
    await Subscription.updateOne(
      { email: String(s.email).toLowerCase() },
      { $setOnInsert: { _oldId: Number(s.id), email: String(s.email).toLowerCase() } },
      { upsert: true },
    );
  }
}

async function migrateSiteViews(conn: mysql.Connection, dry: boolean) {
  const [rows] = await conn.query('SELECT * FROM site_views');
  for (const v of rows as Array<Record<string, unknown>>) {
    if (dry) continue;
    await SiteView.findOneAndUpdate(
      { _oldId: Number(v.id) },
      { _oldId: Number(v.id), count: Number(v.count || 0) },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }
}

const RUNNERS: Record<Table, (conn: mysql.Connection, dry: boolean) => Promise<void>> = {
  users: migrateUsers,
  profiles: migrateProfiles,
  categories: migrateCategories,
  posts: migratePosts,
  images: migrateImages,
  sliders: migrateSliders,
  galleries: migrateGalleries,
  settings: migrateSettings,
  pages: migratePages,
  faqs: migrateFaqs,
  events: migrateEvents,
  comments: migrateComments,
  comment_responses: migrateCommentResponses,
  subscriptions: migrateSubscriptions,
  site_views: migrateSiteViews,
};

async function main() {
  const args = parseArgs();
  if (args.mongoUri) process.env.MONGODB_URI = args.mongoUri;

  const mysqlConn = await mysql.createConnection(args.mysqlUri);
  await connectDB();

  const tables: Table[] = args.only.length ? (args.only.filter((t) => (ORDER as readonly string[]).includes(t)) as Table[]) : [...ORDER];

  for (const t of tables) {
    console.log(`→ ${t}`);
    await RUNNERS[t](mysqlConn, args.dryRun);
  }

  console.log('migration complete');
  await mysqlConn.end();
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
