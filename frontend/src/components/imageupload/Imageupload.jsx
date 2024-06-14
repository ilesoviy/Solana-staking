import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import Dropzone, { useDropzone } from "react-dropzone";
import ImageIcon from '@mui/icons-material/Image';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import uploadIcon from "../../assets/icons/upload.svg";
import { toast } from "react-toastify";


// for profile picture
function ImageUpload({ addFile, file, width, height, radius }) {
    const [render, setRender] = useState();

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {

        if (Object.keys(rejectedFiles).length !== 0) {
            const message = "Please submit valid file type";
            console.log("message: ", message);
            toast.warn(message);
        } else {
            addFile(acceptedFiles);

            var blobPromise = new Promise((resolve, reject) => {
                const reader = new window.FileReader();
                reader.readAsDataURL(acceptedFiles[0]);
                reader.onloadend = () => {
                    const base64data = reader.result;
                    resolve(base64data);
                };
            });
            blobPromise.then(value => {
                // console.log(value);
            });

        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/png': ['.png'],
            'image/jpg': ['.jpg'],
            'image/jpeg': ['.jpeg'],
        }
    })

    // console.log("isDragActive: ", isDragActive, getInputProps());


    const thumbsContainer = {
        width,
        height,
        objectFit: "cover",
        objectPosition: "center",
        ...(radius ? {
            borderRadius: radius,
        } : {
            borderRadius: '10px',
        })
    };

    const thumbs = (
        <div className="relative dropzone-image">
            <img className=""
                style={thumbsContainer}
                src={file.preview} alt="profile" />
            <div className="dropzone-icon">
                <BorderColorIcon />
            </div>
        </div>
    );

    const _render =
        Object.keys(file).length !== 0 ? (
            <aside style={{ width }}>{thumbs}</aside>
        ) : (
            <div className="w-full !h-full flex flex-col items-center !py-auto">
                <img src={uploadIcon} width="24px" height="24px" />
                <p className="dark:text-black">Drop file here or</p>
                <p className="text-[#4628FF] cursor-pointer">Browse</p>
            </div>
        );

    useEffect(() => {
        setRender(_render);
    }, [file])

    return (
        <div className="text-input bg-[#00000080] dark:bg-regal-white !h-full">
            <Dropzone
                style={{
                    width,
                    height,
                    objectFit: "cover",
                    objectPosition: "center",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: "1px dashed #70757c",
                    ...(radius ? {
                        borderRadius: radius,
                    } : {
                        borderRadius: '10px',
                    })
                }}
                multiple={false}
                accept="image/*"

                onDrop={(accepted, rejected) => onDrop(accepted, rejected)}
            >
                {({ getRootProps, getInputProps }) => (
                    <section className="cursor-pointer flex justify-center">
                        <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            {
                                render
                            }
                        </div>
                    </section>
                )}
            </Dropzone>
        </div>
    );

}

export default ImageUpload;