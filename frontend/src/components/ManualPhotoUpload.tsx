import React, { useState } from 'react';

const ManualPhotoUpload: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadStatus('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch('/api/upload-photo', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                setUploadStatus('Photo uploaded successfully!');
            } else {
                setUploadStatus('Failed to upload photo.');
            }
        } catch (error) {
            setUploadStatus('An error occurred during upload.');
        }
    };

    return (
        <div className="manual-photo-upload">
            <h2>Upload Student Photo</h2>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {uploadStatus && <p>{uploadStatus}</p>}
        </div>
    );
};

export default ManualPhotoUpload;