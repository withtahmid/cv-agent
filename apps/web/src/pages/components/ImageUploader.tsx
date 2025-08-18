import React, { useCallback, useRef, useState } from "react";
import { trpc } from "../../trpc";
import { compressImageToBase64 } from "../utils/compressImage";
import Configs from "./Configs";

type ImageFile = {
    file: File;
    url: string;
};

export default function ImageDropzone() {
    const [files, setFiles] = useState<ImageFile[]>([]);
    const [successData, setSuccessData] = useState<any>({});
    const [errorData, setErrorData] = useState<any>({});
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [timer, setTimer] = useState<number | null>(null);

    const onFiles = useCallback((fileList: FileList) => {
        const arr: ImageFile[] = Array.from(fileList)
            .filter((f) => f.type.startsWith("image/"))
            .map((file) => ({ file, url: URL.createObjectURL(file) }));
        setFiles((prev) => [...prev, ...arr]);
    }, []);

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files);
        e.dataTransfer.clearData();
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleBrowse = () => inputRef.current?.click();

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) onFiles(e.target.files);
        e.target.value = "";
    };

    const handleClear = () => {
        files.forEach((f) => URL.revokeObjectURL(f.url));
        setFiles([]);
    };

    const removeOne = (index: number) => {
        const removed = files[index];
        URL.revokeObjectURL(removed.url);
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Example button to refetch secrets:
    // <button onClick={() => refetchSecrets()} disabled={isFetchingSecrets}>Refetch Secrets</button>

    const { mutate: uploadMutation, isPending } = trpc.upload.useMutation();

    const processImages = async () => {
        setTimer(Date.now());
        const base64Images = await Promise.all(
            files.map(async (f) => ({
                image: await compressImageToBase64(f.file),
                filename: f.file.name,
            }))
        );
        uploadMutation(base64Images, {
            onSuccess: (data) => {
                console.log("Upload successful:", data);
                const modal = document.getElementById("success_modal");
                setTimer((prev) => (prev ? Date.now() - prev : null));
                if (modal && modal instanceof HTMLDialogElement) {
                    setSuccessData(data);
                    modal.showModal();
                }
                // handleClear();
            },
            onError: (error) => {
                const errorData = error.data as { code?: string } | undefined;
                setTimer((prev) => (prev ? Date.now() - prev : null));
                setErrorData({
                    code: errorData?.code || "UNKNOWN_ERROR",
                    message: error.message || "An unknown error occurred",
                });

                const modal = document.getElementById("error_modal");
                if (modal && modal instanceof HTMLDialogElement) {
                    modal.showModal();
                }

                console.error("Upload failed:", error);
            },
        });
    };
    const closeSuccessModal = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const modal = document.getElementById("success_modal");
        if (modal && modal instanceof HTMLDialogElement) {
            modal.close();
        }
        handleClear();
    };

    const openSettingsModal = () => {
        const modal = document.getElementById("settings_modal");
        if (modal && modal instanceof HTMLDialogElement) {
            modal.showModal();
        }
    };
    const closeSettingsModal = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const modal = document.getElementById("settings_modal");
        if (modal && modal instanceof HTMLDialogElement) {
            modal.close();
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4">
            <div
                className={`border-2 border-dashed border-primary rounded-lg p-12 py-20  text-center cursor-pointer ${isPending ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={handleBrowse}
                role="button"
                aria-label="Drop images here or click to browse"
            >
                <input
                    disabled={isPending}
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onInputChange}
                />

                <div className="flex flex-col items-center gap-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 opacity-60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v5a4 4 0 01-4 4H7z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 12l3-3 2 2 4-4 3 3"
                        />
                    </svg>
                    {isPending && (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-base-content/60"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18 12a6 6 0 11-12 0 6 6 0 0112 0zm-6-6v6l4 2"
                            />
                        </svg>
                    )}
                    <div className="text-lg font-medium">
                        Drop images here or click to select
                    </div>
                    <div className="text-sm text-base-content/70">
                        Supports multiple files. Click to open file picker.
                    </div>
                </div>
            </div>

            {files.length > 0 && (
                <div className="mt-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {files.map((f, idx) => (
                            <div
                                key={f.url}
                                className="card card-compact bg-base-100 shadow-sm flex flex-col h-full"
                            >
                                <div className="w-full h-40 bg-base-200 rounded-t overflow-hidden flex items-center justify-center">
                                    <img
                                        src={f.url}
                                        alt={f.file.name}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between p-2">
                                    <div className="text-xs truncate mt-2">
                                        {f.file.name}
                                    </div>
                                    <div className="card-actions justify-end mt-2">
                                        <button
                                            className="btn btn-sm btn-ghost"
                                            onClick={() => removeOne(idx)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-around gap-2 mt-4">
                        <button
                            className="btn btn-base w-md"
                            onClick={handleClear}
                            disabled={isPending}
                        >
                            Clear
                        </button>
                        <button
                            className="btn btn-primary w-md"
                            onClick={processImages}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <span className="loading loading-spinner loading-xl"></span>
                            ) : (
                                "Process"
                            )}
                        </button>
                    </div>
                </div>
            )}
            <Configs />

            <dialog id="success_modal" className="modal">
                <div className="modal-box w-full max-w-3xl">
                    <h3 className="font-bold text-lg">
                        CV Parsed Successfully!
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Field</th>
                                    <th>Value</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(successData).map(
                                    ([key], index) => (
                                        <tr key={key}>
                                            <th>{index + 1}</th>
                                            <td>{key}</td>
                                            <td>{successData[key] ?? ""}</td>
                                            <td>
                                                {successData[key] ? (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 text-green-500 inline"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-5 w-5 text-red-500 inline"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                )}
                                <tr>
                                    <td>10</td>
                                    <td>Total Time:</td>
                                    <td>
                                        {timer !== null
                                            ? `${(timer / 1000).toFixed(2)} seconds`
                                            : "N/A"}
                                    </td>
                                    <td>{"-"}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="modal-action">
                        <form method="dialog">
                            <button
                                onClick={closeSuccessModal}
                                className="btn btn-primary"
                            >
                                Go to Next
                            </button>
                        </form>
                    </div>
                </div>
            </dialog>
            <dialog id="error_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-red-600">
                        An Error Occurred
                    </h3>

                    {errorData ? (
                        <div className="py-4 space-y-3 text-sm text-gray-800">
                            <div>
                                <strong className="text-gray-700">Code:</strong>{" "}
                                <span className="text-red-500">
                                    {errorData.code}
                                </span>
                            </div>

                            <div>
                                <strong className="text-gray-700">
                                    Message:
                                </strong>{" "}
                                <span className="text-red-600">
                                    {errorData.message}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p className="py-4 text-gray-500">
                            Unknown error occurred.
                        </p>
                    )}

                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
