const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Mall Runner Siap! Buka http://localhost:${PORT}`);
});