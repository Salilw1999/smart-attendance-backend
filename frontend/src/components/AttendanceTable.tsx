import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Student } from '../interfaces/types';

interface AttendanceTableProps {
  attendanceData: Student[];
}

const columns: ColumnsType<Student> = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: 'Name', dataIndex: 'name', key: 'name' },
  { title: 'Roll Number', dataIndex: 'rollNumber', key: 'rollNumber' },
];

const AttendanceTable: React.FC<AttendanceTableProps> = ({ attendanceData }) => {
  return (
    <div>
      <h2>Attendance Records</h2>
      <Table dataSource={attendanceData} columns={columns} rowKey="id" />
    </div>
  );
};

export default AttendanceTable;
