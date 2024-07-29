const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const dataFilePath = path.join(__dirname, 'data.json');

const saveData = (data, callback) => {
    fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf8', callback);
};

const loadData = (callback) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return callback(null, []);
            }
            return callback(err);
        }
        try {
            callback(null, JSON.parse(data));
        } catch (parseError) {
            callback(parseError);
        }
    });
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/signup' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const newUser = JSON.parse(body);

                loadData((err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Ma\'lumotlarni o\'qishda xatolik yuz berdi.');
                        return;
                    }

                    data.push(newUser);

                    saveData(data, (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Ma\'lumotlarni saqlashda xatolik yuz berdi.');
                            return;
                        }

                        res.writeHead(302, { 'Location': '/profile' });
                        res.end();
                    });
                });
            } catch (parseError) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Yangi foydalanuvchi ma\'lumotlarini tahlil qilishda xatolik yuz berdi.');
            }
        });

    } else if (pathname === '/profile' && req.method === 'GET') {
        loadData((err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Ma\'lumotlarni o\'qishda xatolik yuz berdi.');
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        });

    } else if (pathname === '/create-profile' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const profileData = JSON.parse(body);

                loadData((err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        res.end('Ma\'lumotlarni o\'qishda xatolik yuz berdi.');
                        return;
                    }

                    data.push(profileData);

                    saveData(data, (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            res.end('Ma\'lumotlarni saqlashda xatolik yuz berdi.');
                            return;
                        }

                        res.writeHead(200, { 'Content-Type': 'text/plain' });
                        res.end('Profil muvaffaqiyatli yaratildi.');
                    });
                });
            } catch (parseError) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Yangi profil ma\'lumotlarini tahlil qilishda xatolik yuz berdi.');
            }
        });

    } else if (pathname.startsWith('/public/')) {
        const filePath = path.join(__dirname, pathname);
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Fayl topilmadi.');
                return;
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Sahifa topilmadi.');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server ${PORT} portida ishlamoqda...`);
});
