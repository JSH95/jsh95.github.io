import { useEffect, useState } from "react";
import { calculateWorkStats } from "../../utils/calculateWorkHours";
import {useLoading} from "../../utils/LoadingContext";

const useWorkHours = (year, month, username, role, run) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await calculateWorkStats(year, month, username, role, run);
                setData(result);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year, month, username, role]);

    return { data, loading, error };
};

export default useWorkHours;
