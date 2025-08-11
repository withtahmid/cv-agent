import { useEffect, useState } from "react";
import { trpc, type RouterOutput } from "../../trpc";

type Config = RouterOutput["secrets"]["list"][number];
const Configs = () => {
    const [configs, setConfigs] = useState<Config[]>([]);
    const [sheetName, setSheetName] = useState("");
    const {
        data: secretList,
        error: secretListError,
        refetch: refetchSecrets,
        isFetching: isFetchingSecrets,
    } = trpc.secrets.list.useQuery();

    useEffect(() => {
        if (secretList) {
            setConfigs(secretList);
        }
        if (secretListError) {
            console.error("Failed to fetch secrets:", secretListError);
        }
    }, [secretList, secretListError]);

    const { mutate: addSheetName, isPending } = trpc.secrets.add.useMutation({
        onSuccess: () => {
            refetchSecrets();
            setSheetName("");
        },
        onError: (error) => {
            console.error("Failed to add sheet name:", error);
        },
    });

    const addNewSheet = () => {
        addSheetName({
            key: sheetName,
            name: sheetName,
            type: "SHEET_NAME",
        });
    };

    const { mutate: updateSecretsMutation, isPending: isUpdating } =
        trpc.secrets.update.useMutation({
            onSuccess: () => {
                refetchSecrets();
            },
            onError: (error) => {
                console.error("Failed to update secrets:", error);
            },
        });

    const toggleConfigActive = (
        id: number,
        type: "GEMINI" | "OCR" | "SHEET_NAME" | "SHEET_ID"
    ) => {
        setConfigs((prev) =>
            prev.map((config) =>
                config.type === type
                    ? { ...config, is_active: config.id === id }
                    : config
            )
        );
        updateSecretsMutation(
            configs.map((config) =>
                config.type === type
                    ? { id: config.id, is_active: config.id === id }
                    : { id: config.id, is_active: config.is_active }
            )
        );
    };

    return (
        <div
            className={`w-full max-w-5xl my-8 mx-auto bg-base-200 p-5 rounded-lg shadow-lg ${isFetchingSecrets || isPending || isUpdating ? "opacity-50" : ""}`}
        >
            <div className="my-4 flex   items-center justify-between gap-2">
                <div className="join">
                    <input
                        className="input join-item"
                        placeholder="Sheet Name"
                        value={sheetName}
                        onChange={(e) => setSheetName(e.target.value)}
                    />
                    <button
                        className="btn btn-primary join-item rounded-r-full"
                        disabled={
                            !sheetName ||
                            isFetchingSecrets ||
                            isPending ||
                            isUpdating
                        }
                        onClick={() => addNewSheet()}
                    >
                        Add New Sheet
                    </button>
                </div>
                <div className="">
                    <button
                        disabled={isFetchingSecrets || isPending || isUpdating}
                        onClick={() => refetchSecrets()}
                        className="btn btn-primary"
                    >
                        {isFetchingSecrets ? (
                            <span className="loading loading-spinner loading-xl"></span>
                        ) : (
                            "Refresh"
                        )}
                    </button>
                </div>
            </div>
            <div className="my-4">
                <h3 className="font-bold text-lg">Gemini API Keys</h3>
                {configs && configs.length > 0 && (
                    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-200">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Total Usage</th>
                                    <th>Last 24h Usage</th>
                                    <th>Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {configs
                                    .filter((s) => s.type === "GEMINI")
                                    .map((s, idx) => (
                                        <tr key={s.id}>
                                            <th>{idx + 1}</th>
                                            <td>{s.name}</td>
                                            <td>{s.total_usage}</td>
                                            <td>{s.last_24h_usage}</td>
                                            <td>
                                                <input
                                                    type="radio"
                                                    name="GEMINI"
                                                    checked={s.is_active}
                                                    onChange={() =>
                                                        toggleConfigActive(
                                                            s.id,
                                                            "GEMINI"
                                                        )
                                                    }
                                                    className="radio radio-primary"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className="my-4">
                <h3 className="font-bold text-lg">OCR API Keys</h3>
                {configs && configs.length > 0 && (
                    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-200">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Total Usage</th>
                                    <th>Last 24h Usage</th>
                                    <th>Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {configs
                                    .filter((s) => s.type === "OCR")
                                    .map((s, idx) => (
                                        <tr key={s.id}>
                                            <th>{idx + 1}</th>
                                            <td>{s.name}</td>
                                            <td>{s.total_usage}</td>
                                            <td>{s.last_24h_usage}</td>
                                            <td>
                                                <input
                                                    type="radio"
                                                    name="OCR"
                                                    checked={s.is_active}
                                                    onChange={() =>
                                                        toggleConfigActive(
                                                            s.id,
                                                            "OCR"
                                                        )
                                                    }
                                                    className="radio radio-primary"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className="my-4">
                <h3 className="font-bold text-lg">Google Sheet ID</h3>
                {configs && configs.length > 0 && (
                    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-200">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Total Usage</th>
                                    <th>Last 24h Usage</th>
                                    <th>Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {configs
                                    .filter((s) => s.type === "SHEET_ID")
                                    .map((s, idx) => (
                                        <tr key={s.id}>
                                            <th>{idx + 1}</th>
                                            <td>{s.name}</td>
                                            <td>{s.total_usage}</td>
                                            <td>{s.last_24h_usage}</td>
                                            <td>
                                                <input
                                                    type="radio"
                                                    name="SHEET_ID"
                                                    checked={s.is_active}
                                                    onChange={() =>
                                                        toggleConfigActive(
                                                            s.id,
                                                            "SHEET_ID"
                                                        )
                                                    }
                                                    className="radio radio-primary"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <div className="my-4">
                <h3 className="font-bold text-lg">Google Sheet Name</h3>
                {configs && configs.length > 0 && (
                    <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-200">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Total Usage</th>
                                    <th>Last 24h Usage</th>
                                    <th>Active</th>
                                </tr>
                            </thead>
                            <tbody>
                                {configs
                                    .filter((s) => s.type === "SHEET_NAME")
                                    .map((s, idx) => (
                                        <tr key={s.id}>
                                            <th>{idx + 1}</th>
                                            <td>{s.name}</td>
                                            <td>{s.total_usage}</td>
                                            <td>{s.last_24h_usage}</td>
                                            <td>
                                                <input
                                                    type="radio"
                                                    name="SHEET_NAME"
                                                    checked={s.is_active}
                                                    onChange={() =>
                                                        toggleConfigActive(
                                                            s.id,
                                                            "SHEET_NAME"
                                                        )
                                                    }
                                                    className="radio radio-primary"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Configs;
