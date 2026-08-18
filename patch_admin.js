const fs = require('fs');
let content = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Replace state
content = content.replace(
  "const [imageUrl, setImageUrl] = useState('');",
  "const [imageUrl, setImageUrl] = useState('');\n  const [imageUrls, setImageUrls] = useState<string[]>(['', '', '']);\n  const [videoUrl, setVideoUrl] = useState('');"
);

// Replace handleEdit
content = content.replace(
  "setImageUrl(recipe.imageUrl || '');",
  "setImageUrl(recipe.imageUrl || '');\n    setImageUrls(recipe.imageUrls?.length ? [...recipe.imageUrls, '', '', ''].slice(0, 3) : [recipe.imageUrl || '', '', '']);\n    setVideoUrl(recipe.videoUrl || '');"
);

// Replace API payload
content = content.replace(
  "imageUrl,\n      published: true",
  "imageUrl: imageUrls[0] || imageUrl,\n      imageUrls: imageUrls.filter(u => u.trim() !== ''),\n      videoUrl: videoUrl.trim(),\n      published: true"
);

// Replace form inputs
const formInputs = `
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">لینک تصویر</label>
                      <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 text-sm text-left" dir="ltr" placeholder="https://..." />
                    </div>`;

const newFormInputs = `
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-sm font-medium text-gray-700">لینک‌های تصویر (تا ۳ عدد)</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input type="url" value={imageUrls[0] || ''} onChange={e => setImageUrls([e.target.value, imageUrls[1], imageUrls[2]])} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 text-sm text-left" dir="ltr" placeholder="تصویر ۱" />
                        <input type="url" value={imageUrls[1] || ''} onChange={e => setImageUrls([imageUrls[0], e.target.value, imageUrls[2]])} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 text-sm text-left" dir="ltr" placeholder="تصویر ۲ (اختیاری)" />
                        <input type="url" value={imageUrls[2] || ''} onChange={e => setImageUrls([imageUrls[0], imageUrls[1], e.target.value])} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 text-sm text-left" dir="ltr" placeholder="تصویر ۳ (اختیاری)" />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">لینک ویدیو (اختیاری)</label>
                      <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 text-sm text-left" dir="ltr" placeholder="https://youtube.com/..." />
                    </div>`;

content = content.replace(formInputs, newFormInputs);

fs.writeFileSync('src/pages/Admin.tsx', content);
console.log('Patched Admin.tsx');
