import { execSync } from 'child_process';

const DB_NAME = 'ShopSphereDB';

const cleanOutput = (output) => {
  if (!output) return '';
  return output.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('---') && !/^\(\d+ rows? affected\)$/i.test(l))
    .join('\n');
};

const sqlcmd = (query) => {
  const escaped = query.replace(/"/g, '""');
  const cmd = `sqlcmd -S localhost -E -d ${DB_NAME} -Q "${escaped}" -h -1 -W`;
  try {
    const result = execSync(cmd, { encoding: 'utf-8', timeout: 15000, windowsHide: true });
    return cleanOutput(result);
  } catch (err) {
    console.error('[db] sqlcmd error:', err.message?.substring(0, 200));
    return null;
  }
};

const dbEnsureTables = () => {
  sqlcmd(`
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'VideoUrl')
      ALTER TABLE Products ADD VideoUrl NVARCHAR(1000) NOT NULL DEFAULT '';
  `);
  console.log('[db] Tables ensured via sqlcmd');
};

const dbGetProductImages = (productId) => {
  const result = sqlcmd(`SELECT ImageId, ImageUrl FROM ProductImages WHERE ProductId = ${productId} ORDER BY ImageId`);
  if (!result) return [];
  return result.split('\n').filter(Boolean).map(line => {
    const match = line.match(/^(\d+)\s+(.+)$/);
    return { ImageId: parseInt(match?.[1]) || 0, ImageUrl: match?.[2]?.trim() || '' };
  }).filter(i => i.ImageUrl);
};

const dbSetProductImages = (productId, imageUrls) => {
  sqlcmd(`DELETE FROM ProductImages WHERE ProductId = ${productId}`);
  for (const url of imageUrls) {
    if (!url) continue;
    const safeUrl = url.replace(/'/g, "''");
    const result = sqlcmd(`INSERT INTO ProductImages (ProductId, ImageUrl) VALUES (${productId}, N'${safeUrl}')`);
    if (result === null) console.error(`[db] Failed to insert image for product ${productId}: ${url.substring(0, 60)}`);
  }
  return true;
};

const dbGetProductVideo = (productId) => {
  const result = sqlcmd(`SELECT ISNULL(VideoUrl, '') as v FROM Products WHERE ProductId = ${productId}`);
  if (!result) return '';
  return result.split('\n').filter(Boolean)[0] || '';
};

const dbSetProductVideo = (productId, videoUrl) => {
  const safeUrl = (videoUrl || '').replace(/'/g, "''");
  const result = sqlcmd(`UPDATE Products SET VideoUrl = N'${safeUrl}' WHERE ProductId = ${productId}`);
  if (result === null) console.error(`[db] Failed to set video for product ${productId}`);
  return true;
};

const dbGetAllMedia = () => {
  const mediaMap = {};
  const imgResult = sqlcmd(`SELECT ProductId, ImageUrl FROM ProductImages`);
  if (imgResult) {
    for (const line of imgResult.split('\n').filter(Boolean)) {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const pid = match[1];
        if (!mediaMap[pid]) mediaMap[pid] = { images: [], videoUrl: '' };
        mediaMap[pid].images.push(match[2].trim());
      }
    }
  }
  const vidResult = sqlcmd(`SELECT ProductId, ISNULL(VideoUrl, '') as v FROM Products WHERE VideoUrl IS NOT NULL AND VideoUrl != ''`);
  if (vidResult) {
    for (const line of vidResult.split('\n').filter(Boolean)) {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const pid = match[1];
        const vurl = match[2].trim();
        if (!mediaMap[pid]) mediaMap[pid] = { images: [], videoUrl: '' };
        mediaMap[pid].videoUrl = vurl;
      }
    }
  }
  return mediaMap;
};

export { dbEnsureTables, dbGetProductImages, dbSetProductImages, dbGetProductVideo, dbSetProductVideo, dbGetAllMedia };
