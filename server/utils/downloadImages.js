// Run this script once to download all product images:
// node downloadImages.js

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../client/public/images/products');

const images = [
  // Electronics
  { file: 'iphone15.jpg',        url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop' },
  { file: 'samsung-s23.jpg',     url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=500&fit=crop' },
  { file: 'oneplus-nord.jpg',    url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&h=500&fit=crop' },
  { file: 'sony-tv.jpg',         url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=500&h=500&fit=crop' },
  { file: 'hp-laptop.jpg',       url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=500&fit=crop' },
  { file: 'boat-headphones.jpg', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop' },
  { file: 'realme-tvstick.jpg',  url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&h=500&fit=crop' },
  { file: 'canon-camera.jpg',    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop' },
  { file: 'airpods-pro.jpg',     url: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=500&h=500&fit=crop' },
  { file: 'dell-monitor.jpg',    url: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=500&h=500&fit=crop' },
  { file: 'macbook.jpg',         url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop' },
  { file: 'ipad.jpg',            url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=500&fit=crop' },
  { file: 'earbuds.jpg',         url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop' },
  { file: 'mouse.jpg',           url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop' },
  { file: 'speaker.jpg',         url: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=500&h=500&fit=crop' },
  { file: 'pendrive.jpg',        url: 'https://images.unsplash.com/photo-1618410320928-25228d811631?w=500&h=500&fit=crop' },
  { file: 'lg-tv.jpg',           url: 'https://images.unsplash.com/photo-1571415060716-baff5f717c37?w=500&h=500&fit=crop' },
  // Fashion
  { file: 'puma-tshirt.jpg',     url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop' },
  { file: 'biba-kurti.jpg',      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=500&fit=crop' },
  { file: 'levis-jeans.jpg',     url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop' },
  { file: 'saree.jpg',           url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&h=500&fit=crop' },
  { file: 'shirt.jpg',           url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=500&fit=crop' },
  { file: 'handbag.jpg',         url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop' },
  { file: 'running-shoes.jpg',   url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop' },
  { file: 'heels.jpg',           url: 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=500&h=500&fit=crop' },
  { file: 'watch.jpg',           url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop' },
  { file: 'sunglasses.jpg',      url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=500&fit=crop' },
  { file: 'dress.jpg',           url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=500&fit=crop' },
  { file: 'wallet.jpg',          url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=500&fit=crop' },
  { file: 'belt.jpg',            url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop' },
  { file: 'nike-shoes.jpg',      url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop' },
  // Home & Furniture
  { file: 'queen-bed.jpg',       url: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&h=500&fit=crop' },
  { file: 'sofa.jpg',            url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop' },
  { file: 'study-table.jpg',     url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&h=500&fit=crop' },
  { file: 'office-chair.jpg',    url: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=500&h=500&fit=crop' },
  { file: 'wardrobe.jpg',        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop' },
  { file: 'coffee-table.jpg',    url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&h=500&fit=crop' },
  { file: 'bookshelf.jpg',       url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop' },
  { file: 'mattress.jpg',        url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&h=500&fit=crop' },
  { file: 'dining-table.jpg',    url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&h=500&fit=crop' },
  // Appliances
  { file: 'washing-machine.jpg', url: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&h=500&fit=crop' },
  { file: 'refrigerator.jpg',    url: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&h=500&fit=crop' },
  { file: 'microwave.jpg',       url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&h=500&fit=crop' },
  { file: 'induction.jpg',       url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop' },
  { file: 'water-heater.jpg',    url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&h=500&fit=crop' },
  { file: 'air-fryer.jpg',       url: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=500&h=500&fit=crop' },
  { file: 'ro-purifier.jpg',     url: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=500&h=500&fit=crop' },
  { file: 'kettle.jpg',          url: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500&h=500&fit=crop' },
  { file: 'mixer-grinder.jpg',   url: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500&h=500&fit=crop' },
  // Beauty
  { file: 'serum.jpg',           url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&h=500&fit=crop' },
  { file: 'lipstick.jpg',        url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=500&fit=crop' },
  { file: 'body-lotion.jpg',     url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop' },
  { file: 'hair-oil.jpg',        url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=500&h=500&fit=crop' },
  { file: 'face-wash.jpg',       url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop' },
  { file: 'sunscreen.jpg',       url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&h=500&fit=crop' },
  { file: 'shampoo.jpg',         url: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=500&h=500&fit=crop' },
  { file: 'makeup-kit.jpg',      url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=500&fit=crop' },
  { file: 'foundation.jpg',      url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop' },
  { file: 'night-gel.jpg',       url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop' },
  // Sports
  { file: 'cricket-bat.jpg',     url: 'https://images.unsplash.com/photo-1593766827228-8737b4534aa6?w=500&h=500&fit=crop' },
  { file: 'badminton.jpg',       url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&h=500&fit=crop' },
  { file: 'football.jpg',        url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=500&fit=crop' },
  { file: 'yoga-mat.jpg',        url: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=500&h=500&fit=crop' },
  { file: 'skipping-rope.jpg',   url: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=500&h=500&fit=crop' },
  { file: 'adidas-shoes.jpg',    url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=500&fit=crop' },
  { file: 'nike-airmax.jpg',     url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop' },
  // Books
  { file: 'psychology-money.jpg',url: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=500&h=500&fit=crop' },
  { file: 'rich-dad.jpg',        url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=500&h=500&fit=crop' },
  { file: 'atomic-habits.jpg',   url: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&h=500&fit=crop' },
  { file: 'think-grow-rich.jpg', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop' },
  { file: 'ikigai.jpg',          url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&h=500&fit=crop' },
  { file: 'start-with-why.jpg',  url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&h=500&fit=crop' },
  { file: 'book-general.jpg',    url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&h=500&fit=crop' },
  // Toys
  { file: 'lego.jpg',            url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=500&h=500&fit=crop' },
  { file: 'puzzle.jpg',          url: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=500&h=500&fit=crop' },
  { file: 'teddy-bear.jpg',      url: 'https://images.unsplash.com/photo-1559715745-e1b33a271c8f?w=500&h=500&fit=crop' },
  { file: 'rc-car.jpg',          url: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=500&h=500&fit=crop' },
  { file: 'doctor-playset.jpg',  url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&h=500&fit=crop' },
  { file: 'building-blocks.jpg', url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500&h=500&fit=crop' },
  { file: 'ride-on-car.jpg',     url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=500&h=500&fit=crop' },
  { file: 'hot-wheels.jpg',      url: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=500&h=500&fit=crop' },
  { file: 'barbie.jpg',          url: 'https://images.unsplash.com/photo-1559715745-e1b33a271c8f?w=500&h=500&fit=crop' },
  // Grocery
  { file: 'atta.jpg',            url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&h=500&fit=crop' },
  { file: 'sunflower-oil.jpg',   url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&h=500&fit=crop' },
  { file: 'maggi.jpg',           url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=500&fit=crop' },
  { file: 'tata-tea.jpg',        url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&h=500&fit=crop' },
  { file: 'amul-butter.jpg',     url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=500&fit=crop' },
  { file: 'britannia.jpg',       url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&h=500&fit=crop' },
  { file: 'surf-excel.jpg',      url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=500&h=500&fit=crop' },
  { file: 'tata-salt.jpg',       url: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&h=500&fit=crop' },
  { file: 'red-label-tea.jpg',   url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&h=500&fit=crop' },
  { file: 'chocolate.jpg',       url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500&h=500&fit=crop' },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) { console.log(`⏭  Skip (exists): ${path.basename(dest)}`); return resolve(); }
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); console.log(`✅ Downloaded: ${path.basename(dest)}`); resolve(); });
    }).on('error', err => { fs.unlinkSync(dest); reject(err); });
  });
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`\n📥 Downloading ${images.length} images to:\n   ${OUTPUT_DIR}\n`);
  for (const img of images) {
    try { await download(img.url, path.join(OUTPUT_DIR, img.file)); }
    catch (e) { console.error(`❌ Failed: ${img.file} — ${e.message}`); }
  }
  console.log('\n🎉 All done! Now update seeder.js to use local paths.\n');
}

main();
