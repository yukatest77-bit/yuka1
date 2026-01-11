const fs = require('fs');
const path = require('path');

const envContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=pharma-8cea4
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@pharma-8cea4.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCqtfgFRy1Z8snw\\nt2ZBtk3UWgOY6EWxnPziCm40qB8PHXLhCS4q7h7oOVFHH+M8zTgVpC853A1V32h7\\nMqRferm5egQY+0YL444NJl8srlPFEhTq53p4ZHfbrOLrHzBz2wYLCE2Zp/uVBtTt\\nfATPG5pYoZNW3MvVwIMK40LNK8cOx+Uny9ry43Li80eaYoa71JA/ag/2z+kUaKq+\\nI9ZkVa91hqkRlv5wej00uHdQ2HBKvCT27LM5iADNaskF1SMhaV7U2q5nR29J78Gc\\nhu9mathbNih5r+LwzjqlRZlWPxZWb4GXO4sQ3uPwqGhkT+A149+uIcqdkiBlqBc6\\nQpfh8mONAgMBAAECggEAEjB3b+CIpYfoGn0AKUpKerDopzdAjc9DZrZjzbqILK0f\\nm3jF8Y8Tvfy1e1WbedQIAM5QteKLjTXTxSS9POsvtOKaYysK6KNjdGU9SN5+UIY/\\nslPdycwytTZzq0fUetPAjhZhZljuxo9GytMnFAZF6OG2eE/obCsqC1PxvzjF6f4X\\np7rR52wGwjGkeEv6JjYDjyDFdhNDr5zFQKMj25f57lDNaq3VI9qqpun41R1hv8w7\\nL5WFsrsZXMncY/gXMjZKJCLn17QXA4stNwZ+U9NcsLkInhorhxvOq8vijVkn20df\\nPO/3ZdGfXnZr6C3GadDYAV7m79gZjhQLl/ssTltEBQKBgQDvcrdGuHEBha/CXh0P\\nRcollMR9fzf+WDdODV3En/AAyz/JiDqqgP1q+76rjPTKN2oLAwRMOQbVYiKe1NNM\\nlkaBs0XVW7JDvpntwkjStVg+899sAfjq+cyitlEheiDHGBA6hVYeV3riXuwyVM5b\\nfrQ+1NQeCRL77eACEuZ5N0C2zwKBgQC2gt/ysYXUYEq33aJicqAStoM8gQZ0/HqB\\nMHv/Q26I7kqyGLsHSjq0LSXxx2aa2c0ZCwO9nxGI+w5YPkK4lK/PcPMaR04Yh+s6\\nT6PeW3H4iNHnIquUrZmFw6zbh/TpkXkaswxPJaXzj9YnOkzjkjkOfg8VXW5pIFxs\\nQg6lTR2W4wKBgQCTU07G2YbWO+33NjbFBdippM38tUC7YoWspXazGwDtTCDUG9iU\\nvcaug3Q+UvzuSogZfGKxj0jQE5Bfj2zuq2t4M9hcvQ2Ctww4iJiL5H4GRcCK0O/Z\\ni5bH6ksiwOTX+stJZm6lPofiLis/kIRjMSMvoX1deZHPpf106TIbFM7hawKBgQCZ\\nIYfa7f22qjAmwuu7JCeQa9gCzNLpFumGOXLgQuicNSsw8LUDsdE9WWAr0z0QkcuW\\nxnoWAD/LKbHochyzF/XG3CLsmoU46dmAbE+2gg1HFSzgfGNv9JQJ+pqu+wyPaEIv\\nF6ktQw5RJA7vjOf0TLxYn4XyTBkWVVOWdXoqUWCRNwKBgAOXemaGEXuvVaXVUWgT\\n2ouYbIREE0loKhaX64vb9ZPshmSve7lWWoD/knRQvLp+zjQvTKjjD0l4sxve65D2\\n7PPHn2C8OWn8u/Vwhr4bE+J+8+hY9Y0ttXi8jwcoU7CI6Nv1LffogqTd4nuMUuzk\\nW9INnwQfqzCBAmq7qK+pyJzv\\n-----END PRIVATE KEY-----\\n"
FIREBASE_DATABASE_URL=https://pharma-8cea4-default-rtdb.europe-west1.firebasedatabase.app

# Scraper Configuration
SCRAPER_URL=https://dimapermanence.site/pharmacies-de-garde-tanger/
SCRAPER_CRON_SCHEDULE=0 0 * * *

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://localhost:3001
`;

const envPath = path.join(__dirname, '.env');
fs.writeFileSync(envPath, envContent, { encoding: 'utf8' });
console.log('✅ .env file has been created successfully!');
console.log('📁 Location:', envPath);
