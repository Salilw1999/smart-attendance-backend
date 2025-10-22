import React, { useEffect, useState } from 'react';
import { fetchAttendanceReports } from '../services/api';
import { AttendanceReport } from '../types';

const Reports: React.FC = () => {
    const [reports, setReports] = useState<AttendanceReport[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadReports = async () => {
            try {
                const data = await fetchAttendanceReports();
                setReports(data);
            } catch (err) {
                setError('Failed to load reports');
            } finally {
                setLoading(false);
            }
        };

        loadReports();
    }, []);

    const handleExport = async () => {
        // Logic to export reports to Excel
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Attendance Reports</h1>
            <button onClick={handleExport}>Export to Excel</button>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Student Name</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <tr key={report.id}>
                            <td>{report.date}</td>
                            <td>{report.studentName}</td>
                            <td>{report.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Reports;