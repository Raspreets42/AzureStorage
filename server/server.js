require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(express.json());

// Azure Blob Storage setup
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.CONTAINER_NAME);

// Routes
app.get('/api/files', async (req, res) => {
    try {
        const blobs = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            blobs.push({
                name: blob.name,
                url: `${containerClient.url}/${blob.name}`,
                properties: blob.properties
            });
        }
        res.json(blobs);
    } catch (error) {
        console.error('Error listing blobs:', error);
        res.status(500).json({ error: 'Failed to list files' });
    }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const blobName = req.file.originalname;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.upload(req.file.buffer, req.file.size);

        res.json({
            message: 'File uploaded successfully',
            url: blockBlobClient.url
        });
    } catch (error) {
        console.error('Error uploading blob:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

app.get('/api/download/:filename', async (req, res) => {
    try {
        const blobName = req.params.filename;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const downloadBlockBlobResponse = await blockBlobClient.download();
        res.setHeader('Content-Type', downloadBlockBlobResponse.contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${blobName}`);

        downloadBlockBlobResponse.readableStreamBody.pipe(res);
    } catch (error) {
        console.error('Error downloading blob:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

app.delete('/api/delete/:filename', async (req, res) => {
    try {
        const blobName = req.params.filename;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.delete();
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting blob:', error);
        res.status(500).json({ error: 'Failed to delete file' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});