const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

const searchStr = `{activeTab === 'settings' && (`;
code = code.replace(searchStr, `{activeTab === 'settings' && (<>`);

const endSettingsStr = `ذخیره تغییرات یخچال
            </button>
          </div>
        </div>
      )}`;

code = code.replace(endSettingsStr, `ذخیره تغییرات یخچال
            </button>
          </div>
        </div>
        </>
      )}`);

fs.writeFileSync('src/pages/Admin.tsx', code);
