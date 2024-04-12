import { useEffect, useRef, useState } from 'react';
import Cropper from 'cropperjs';
import "cropperjs/dist/cropper.css";
import './upload-image.css';

export default function UploadImage(props: UploadImageProps) {
    const [selectedImage, setSelectedImage] = useState<string | ArrayBuffer | null>(null);
    const [message, setMessage] = useState<string>('Drag here to upload');
    const cropperRef = useRef<HTMLImageElement>(null);
    let cropper: Cropper;

    useEffect(() => {
        if (!selectedImage || !cropperRef.current) return;

        if (cropper) cropper.destroy();

        cropper = new Cropper(cropperRef.current, {
            aspectRatio: props.aspectRatio,
            viewMode: 1,
            minCropBoxHeight: 100,
            minCropBoxWidth: 100,
            background: false,
            responsive: true,
            autoCropArea: 1,
            checkOrientation: false,
            guides: true
        });
    }, [selectedImage]);

    const validateImage = (file: File) => {
        const fileSize = file.size / 1000 / 1000;
        
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (validTypes.indexOf(file.type) === -1) {
            setMessage('Invalid file type. Only JPEG, PNG, and JPG are allowed');
            return;
        }

        if (fileSize > props.maxImageSizeInMb) {
            setMessage('File size cannot exceed 8MB');
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

    const getCroppedImage = () => {
        if (!cropper) return;
        const canvas = cropper.getCroppedCanvas();

        if (!canvas) return;

        props.onCrop(canvas.toDataURL('image/jpeg', 0.9));
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
            <div style={!selectedImage ? { display: "none" } : { minWidth: "200px" }}>
                <img style={{ height: props.height, maxWidth: "100%", display: "100%" }} ref={cropperRef} src={selectedImage as string} alt="profile-picture"/>
                <button onClick={() => getCroppedImage()} style={{ marginTop: "10px", width: "100%" }} className="button primary">Upload</button>
            </div>
        </div>
    );
}