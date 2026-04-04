// login-test.js

const http = require('http');

const data = JSON.stringify({
    email: "test@example.com",
    password: "123456"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',   // 🔴 CHANGE if your login route is different
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';

    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log("Response:", body);

        if (res.statusCode === 200) {
            console.log("✅ Login API Test Passed");
            process.exit(0);
        } else {
            console.error("❌ Login API Test Failed");
            process.exit(1);
        }
    });
});

req.on('error', (error) => {
    console.error("❌ Request Error:", error);
    process.exit(1);
});

req.write(data);
req.end();