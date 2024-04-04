import { useEffect, useRef, useState } from 'react';
import Cropper from 'cropperjs';
import "cropperjs/dist/cropper.css";
import './upload-image.css';

export default function UploadImage() {
    const [selectedImage, setSelectedImage] = useState<string | ArrayBuffer | null>(null);
    const [message, setMessage] = useState<string>('Drag here to upload');
    const cropperRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!selectedImage || !cropperRef.current) return;

        new Cropper(cropperRef.current, {
            initialAspectRatio: 1,
            aspectRatio: 1,
            viewMode: 1,
            minCropBoxHeight: 100,
            minCropBoxWidth: 100,
            background: false,
            responsive: true,
            autoCropArea: 1,
            checkOrientation: false,
            guides: true,
            crop: (event) => {
                console.log(event.detail.x);
                console.log(event.detail.y);
            }
        });
    }, [selectedImage]);

    const validateImage = (file: File) => {
        const fileSize = file.size / 1000 / 1000;
        
        if (fileSize > 8) {
            setMessage('File size cannot exceeds 8MB');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (validTypes.indexOf(file.type) === -1) {
            setMessage('Invalid file type. Only JPEG, PNG, JPG are allowed');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.dataTransfer.files) {
            setMessage('Please select or drag an image');
            return;
        }

        validateImage(e.dataTransfer.files[0]);
    }

    return (
        <div className="upload-container">
            <div 
            style={selectedImage ? { display: "none" } : {}}
            onDrop={handleDrop}
            className="upload-image-box">
                <input 
                className="upload-pfp-btn" 
                type="file" 
                name="pfp" 
                onChange={(e) => {
                    if (!e.target.files) {
                        setMessage('Please select or drag an image');
                        return;
                    }

                    validateImage(e.target.files[0]);
                }} accept="image/*"/>
                <h3>Upload Image</h3>
                <p>{message}</p>
            </div>
            <div style={!selectedImage ? { display: "none" } : { overflow: "hidden", height: "300px" }}>
                <img ref={cropperRef} src={selectedImage as string} alt="profile-picture"/>
                <button style={{ marginTop: "10px", width: "100%" }} className="button primary">Upload</button>
            </div>
        </div>
    );
}